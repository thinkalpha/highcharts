/* *
 *
 *  (c) 2009-2019 Øystein Moseng
 *
 *  Accessibility component for exporting menu.
 *
 *  License: www.highcharts.com/license
 *
 * */

'use strict';

import H from '../../../parts/Globals.js';
import AccessibilityComponent from '../AccessibilityComponent.js';
import KeyboardNavigationModule from '../KeyboardNavigationModule.js';


/**
 * Show the export menu and focus the first item (if exists).
 *
 * @private
 * @function Highcharts.Chart#showExportMenu
 */
H.Chart.prototype.showExportMenu = function () {
    if (this.exportSVGElements && this.exportSVGElements[0]) {
        this.exportSVGElements[0].element.onclick();
        this.highlightExportItem(0);
    }
};


/**
 * Hide export menu.
 *
 * @private
 * @function Highcharts.Chart#hideExportMenu
 */
H.Chart.prototype.hideExportMenu = function () {
    var chart = this,
        exportList = chart.exportDivElements;

    if (exportList && chart.exportContextMenu) {
        // Reset hover states etc.
        exportList.forEach(function (el) {
            if (el.className === 'highcharts-menu-item' && el.onmouseout) {
                el.onmouseout();
            }
        });
        chart.highlightedExportItemIx = 0;
        // Hide the menu div
        chart.exportContextMenu.hideMenu();
        // Make sure the chart has focus and can capture keyboard events
        chart.container.focus();
    }
};


/**
 * Highlight export menu item by index.
 *
 * @private
 * @function Highcharts.Chart#highlightExportItem
 *
 * @param {number} ix
 *
 * @return {true|undefined}
 */
H.Chart.prototype.highlightExportItem = function (ix) {
    var listItem = this.exportDivElements && this.exportDivElements[ix],
        curHighlighted =
            this.exportDivElements &&
            this.exportDivElements[this.highlightedExportItemIx],
        hasSVGFocusSupport;

    if (
        listItem &&
        listItem.tagName === 'DIV' &&
        !(listItem.children && listItem.children.length)
    ) {
        // Test if we have focus support for SVG elements
        hasSVGFocusSupport = !!(
            this.renderTo.getElementsByTagName('g')[0] || {}
        ).focus;

        // Only focus if we can set focus back to the elements after
        // destroying the menu (#7422)
        if (listItem.focus && hasSVGFocusSupport) {
            listItem.focus();
        }
        if (curHighlighted && curHighlighted.onmouseout) {
            curHighlighted.onmouseout();
        }
        if (listItem.onmouseover) {
            listItem.onmouseover();
        }
        this.highlightedExportItemIx = ix;
        return true;
    }
};


/**
 * Try to highlight the last valid export menu item.
 *
 * @private
 * @function Highcharts.Chart#highlightLastExportItem
 */
H.Chart.prototype.highlightLastExportItem = function () {
    var chart = this,
        i;

    if (chart.exportDivElements) {
        i = chart.exportDivElements.length;
        while (i--) {
            if (chart.highlightExportItem(i)) {
                return true;
            }
        }
    }
    return false;
};


/**
 * The MenuComponent class
 *
 * @private
 * @class
 * @param {Highcharts.Chart} chart
 *        Chart object
 */
var MenuComponent = function (chart) {
    this.initBase(chart);
    this.init();
};
MenuComponent.prototype = new AccessibilityComponent();
H.extend(MenuComponent.prototype, {

    /**
     * Init the component.
     */
    init: function () {},


    /**
     * Called on first render/updates to the chart, including options changes.
     */
    onChartUpdate: function () {},


    /**
     * Get keyboard navigation module for this component.
     */
    getKeyboardNavigation: function () {
        var keys = this.keyCodes,
            chart = this.chart,
            a11yOptions = chart.options.accessibility;

        return new KeyboardNavigationModule(chart, {
            keyCodeMap: [
                // Arrow prev handler
                [[
                    keys.left, keys.up
                ], function () {
                    var i = chart.highlightedExportItemIx || 0;

                    // Try to highlight prev item in list. Highlighting e.g.
                    // separators will fail.
                    while (i--) {
                        if (chart.highlightExportItem(i)) {
                            return this.response.success;
                        }
                    }

                    // We failed, so wrap around or move to prev module
                    if (a11yOptions.keyboardNavigation.wrapAround) {
                        chart.highlightLastExportItem();
                        return this.response.success;
                    }
                    return this.response.prev;
                }],

                // Arrow next handler
                [[
                    keys.right, keys.down
                ], function () {
                    var i = (chart.highlightedExportItemIx || 0) + 1;

                    // Try to highlight next item in list. Highlighting e.g.
                    // separators will fail.
                    for (;i < chart.exportDivElements.length; ++i) {
                        if (chart.highlightExportItem(i)) {
                            return this.response.success;
                        }
                    }

                    // We failed, so wrap around or move to next module
                    if (a11yOptions.keyboardNavigation.wrapAround) {
                        chart.highlightExportItem(0);
                        return this.response.success;
                    }
                    return this.response.next;
                }],

                // Click handler
                [[
                    keys.enter, keys.space
                ], function () {
                    this.fakeClickEvent(
                        chart.exportDivElements[chart.highlightedExportItemIx]
                    );
                    return this.response.success;
                }],

                // ESC handler
                [[
                    keys.esc
                ], function () {
                    return this.response.prev;
                }]
            ],

            // Only run exporting navigation if exporting support exists and is
            // enabled on chart
            validate: function () {
                return chart.exportChart &&
                    !(chart.options.exporting &&
                    chart.options.exporting.enabled === false);
            },

            // Show export menu
            init: function (direction) {
                chart.showExportMenu();

                // If coming back to export menu from other module, try to
                // highlight last item in menu
                if (direction < 0) {
                    chart.highlightLastExportItem();
                }
            },

            // Hide the menu
            terminate: function () {
                chart.hideExportMenu();
            }
        });
    }

});

export default MenuComponent;
