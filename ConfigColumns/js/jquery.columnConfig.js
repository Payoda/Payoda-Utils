/*******************************************************************************
* Copyright (c) 2012 Payoda Technologies Pvt Ltd
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*******************************************************************************/

(function (jQuery) {

    var parentDiv; var oTableHid; var oTableVis; var bShow; var bHide; var bUp; var bDown; var dragRow; var separator;

    jQuery.fn.dragDropRow = function (settings) {

        var configs = {
            'rowSelectedCSS': 'row_selected',
            'dragRow': 'drag_row',
            'cursor': 'pointer'
        };

        var selectedCss = configs['rowSelectedCSS'];
        var dragRow = configs['dragRow'];
        var cursor = configs['cursor'];

        if (settings) { jQuery.extend(configs, settings); };

        var oTable = GetDataTable(this);
        oTable.css('cursor', cursor);
        var rowPicked;
        var rowPlaced;
        source = oTable.find('tr');
        target = source;
        source.draggable({
            helper: function (event) {
                rowPicked = jQuery(this).text();
                return jQuery('<div class="' + dragRow + '"><table></table></div>')
                .find('table').append(jQuery(event.target).closest('tr').clone()).end();
            },
            opacity: 1,
            appendTo: 'body',
            cursor: 'move'
        });

        target.droppable({
            drop: function (event, ui) {
                rowPlaced = jQuery(this).text();
                reArrangeRows(oTable, rowPicked, rowPlaced);
            },
            accept: source.selector
        });
    };

    jQuery.fn.rowToggler = function (settings) {
        var configs = {
            'oTableHidden': undefined,
            'oTableVisible': undefined,
            'btnShow': undefined,
            'btnHide': undefined,
            'btnUp': undefined,
            'btnDown': undefined,
            'rowSelectedCSS': 'row_selected',
            'dragRow': 'drag_row'
        };

        if (settings) { jQuery.extend(configs, settings); };

        parentDiv = jQuery(this);
        oTableHid = configs['oTableHidden'];
        oTableVis = configs['oTableVisible'];
        bShow = configs['btnShow'];
        bHide = configs['btnHide'];
        bUp = configs['btnUp'];
        bDown = configs['btnDown'];
        selectedCss = configs['rowSelectedCSS'];
        dragRow = configs['dragRow'];

        Validate();

        oTableVis.dragDropRow();

        bUp.click(function (event) {
            moveSelectedUp(oTableVis);
        });

        bDown.click(function (event) {
            moveSelectedDown(oTableVis);
        });

        bShow.click(function (event) {
            AddColumn(oTableHid, oTableVis);
        });

        bHide.click(function (event) {
            RemoveColumn(oTableHid, oTableVis);
        });

        hidden = oTableHid.find('tbody');
        visible = oTableVis.find('tbody');

        visible.click(toggleRowSelection);
        hidden.click(toggleRowSelection);

        hidden.dblclick(function (event) {
            AddColumn(oTableHid, oTableVis);
        });

        visible.dblclick(function (event) {
            RemoveColumn(oTableHid, oTableVis);
        });
    };


    jQuery.fn.GetValues = function (settings) {
        var dflt = {
            'separator': ','
        };

        if (settings) { jQuery.extend(dflt, settings); };

        separator = dflt['separator'];

        var tableRequested = jQuery(this);

        var oTable;
        if (tableRequested.attr('Id') == oTableHid.attr('Id'))
            oTable = oTableHid;
        else
            oTable = oTableVis;

        var aTrs = oTable.fnGetNodes();
        var aReturn = '';
        for (var i = 0; i < aTrs.length; i++) {
            aReturn += oTable.fnGetData(aTrs[i]) + separator;
        }
        return aReturn;
    };

    function Validate() {
        if (oTableHid == undefined || oTableVis == undefined) {
            parentDiv.children().find('table').each(function () {
                var tabId = jQuery(this).attr('id');
                if (tabId != undefined) {
                    if (oTableHid == undefined) {
                        oTableHid = GetDataTable(jQuery(this));
                    }
                    if (oTableHid.attr('id') != tabId && oTableVis == undefined) {
                        oTableVis = GetDataTable(jQuery(this));
                    }
                }
            });
        }


        if (bShow == undefined || bHide == undefined || bUp == undefined || bDown == undefined) {
            parentDiv.children().find('input').each(function () {
                var inpId = jQuery(this).attr('id');
                if (inpId != undefined) {
                    if (bShow == undefined)
                        bShow = jQuery(this);
                    if (bShow.attr('id') != inpId && bHide == undefined)
                        bHide = jQuery(this);
                    if (bShow.attr('id') != inpId && bHide.attr('id') != inpId && bUp == undefined)
                        bUp = jQuery(this);
                    if (bShow.attr('id') != inpId && bHide.attr('id') != inpId && bUp.attr('id') != inpId && bDown == undefined)
                        bDown = jQuery(this);
                }
            });
        }
    };

})(jQuery);

var GetDataTable = function (oTable) {

    if (oTable.hasClass('.initialized'))
        return oTable;

    oTable = oTable.dataTable({ "bSort": false, "bPaginate": false,
        "sScrollY": "500px"
    });

    if (!jQuery(oTable).hasClass('.initialized'))
        jQuery(oTable).addClass('.initialized');

    return oTable;
};

var toggleRowSelection = function () {
    if (jQuery(event.target.parentNode).hasClass(selectedCss))
        jQuery(event.target.parentNode).removeClass(selectedCss);
    else
        jQuery(event.target.parentNode).addClass(selectedCss);
};

function reArrangeRows(oTable, rowPicked, rowPlaced) {
    var nodes = oTable.fnGetNodes();
    var row1 = getNodeIndex(nodes, rowPicked);
    var row2 = getNodeIndex(nodes, rowPlaced);
    jQuery(nodes[row1]).addClass(selectedCss);
    if (row1 > row2) {
        for (var i = 0; i < row1 - row2; i++) {
            moveSelectedUp(oTable);
        }
    }
    else if (row1 < row2) {
        for (var j = 0; j < row2 - row1; j++) {
            moveSelectedDown(oTable);
        }
    }
    oTable.fnDraw();
};

function getNodeIndex(nodes, RowData) {
    for (var node in nodes) {
        if (jQuery(nodes[node]).children('td').eq(0).text() == RowData) {
            return parseInt(node);
        }
    }
};

/* Get the rows which are currently selected */
function fnGetSelected(oTable) {
    var aReturn = new Array();
    var aTrs = oTable.fnGetNodes();

    for (var i = 0; i < aTrs.length; i++) {
        if (jQuery(aTrs[i]).hasClass(selectedCss)) {
            aReturn.push(aTrs[i]);
        }
    }
    return aReturn;
};

function moveSelectedUp(oTable) {
    var arr = fnGetSelected(oTable);
    for (var i = 0; i < arr.length; i++) {
        var tr = arr[i];
        var row = jQuery(tr);               /* row to move. */
        var prevRow = jQuery(tr).prev();    /* row to move should be moved up and replace this.*/
        /* already at the top? */
        if (prevRow.length == 0) { break; }
        moveData(oTable, row, prevRow);
        moveVisualSelection(row, prevRow);
    }
};

function moveSelectedDown(oTable) {
    var arr = fnGetSelected(oTable);
    for (var i = arr.length - 1; i >= 0; i--) {
        var tr = arr[i];
        var row = jQuery(tr);
        var nextRow = jQuery(tr).next();

        /* already at the Bottom? */
        if (nextRow.length == oTable.fnSettings().fnRecordsTotal()) { break; }
        moveData(oTable, row, nextRow);
        moveVisualSelection(row, nextRow);
    }
};

/* the visual stuff that show which rows are selected */
function moveVisualSelection(row, nearRow) {
    row.removeClass(selectedCss);
    nearRow.addClass(selectedCss);
};

/* move the data in the internal datatable structure */
function moveData(oTable, row, RowNear) {
    var movedData = oTable.fnGetData(row[0]).slice(0);    /* copy of row to move. */
    var nearData = oTable.fnGetData(RowNear[0]).slice(0);  /*  copy of old data to be overwritten by above data. */
	 /*  switch data around :) */
    oTable.fnUpdate(nearData, row[0], 0, false, false);
    oTable.fnUpdate(movedData, RowNear[0], 0, true, true);
};


var AddColumn = function (oTableHidden, oTableVisible) {
    var SelectedRow = fnGetSelected(oTableHidden);
    for (var i = 0; i < SelectedRow.length; i++) {
        var aData = oTableHidden.fnGetData(SelectedRow[i]);
        oTableVisible.fnAddData([aData]);
        oTableHidden.fnDeleteRow(SelectedRow[i]);
    }
};

var RemoveColumn = function (oTableHidden, oTableVisible) {
    var SelectedRow = fnGetSelected(oTableVisible);
    for (var i = 0; i < SelectedRow.length; i++) {
        var aData = oTableVisible.fnGetData(SelectedRow[i]);
        oTableHidden.fnAddData([aData]);
        oTableVisible.fnDeleteRow(SelectedRow[i]);
    }
};
