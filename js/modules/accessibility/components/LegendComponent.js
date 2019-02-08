/* *
 *
 *  (c) 2009-2019 Øystein Moseng
 *
 *  Accessibility component for chart legend.
 *
 *  License: www.highcharts.com/license
 *
 * */

'use strict';

import H from '../../../parts/Globals.js';
import AccessibilityComponent from '../AccessibilityComponent.js';
import KeyboardNavigationModule from '../KeyboardNavigationModule.js';


/**
 * Highlight legend item by index.
 *
 * @private
 * @function Highcharts.Chart#highlightLegendItem
 *
 * @param {number} ix
 *
 * @return {boolean}
 */
H.Chart.prototype.highlightLegendItem = function (ix) {
    var items = this.legend.allItems,
        oldIx = this.highlightedLegendItemIx;

    if (items[ix]) {
        if (items[oldIx]) {
            H.fireEvent(
                items[oldIx].legendGroup.element,
                'mouseout'
            );
        }
        // Scroll if we have to
        if (items[ix].pageIx !== undefined &&
            items[ix].pageIx + 1 !== this.legend.currentPage) {
            this.legend.scroll(1 + items[ix].pageIx - this.legend.currentPage);
        }
        // Focus
        this.setFocusToElement(items[ix].legendItem, items[ix].legendGroup);
        H.fireEvent(items[ix].legendGroup.element, 'mouseover');
        return true;
    }
    return false;
};


/**
 * The LegendComponent class
 *
 * @private
 * @class
 * @param {Highcharts.Chart} chart
 *        Chart object
 */
var LegendComponent = function (chart) {
    this.initBase(chart);
    this.init();
};
LegendComponent.prototype = new AccessibilityComponent();
H.extend(LegendComponent.prototype, {

    /**
     * Init the component.
     */
    init: function () {},


    /**
     * Called on first render/updates to the chart, including options changes.
     */
    onChartUpdate: function () {
        var chart = this.chart;
        if (chart.legend && chart.legend.allItems) {
            // Make elements focusable
            chart.legend.allItems.forEach(function (item) {
                item.legendGroup.element.setAttribute('tabindex', '-1');
            });
        }
    },


    /**
     * Get keyboard navigation module for this component.
     */
    getKeyboardNavigation: function () {
        var keys = this.keyCodes,
            component = this,
            chart = this.chart,
            a11yOptions = chart.options.accessibility;
        return new KeyboardNavigationModule(chart, {
            keyCodeMap: [
                // Arrow key handling
                [[
                    keys.left, keys.right, keys.up, keys.down
                ], function (keyCode) {
                    var direction = (
                        keyCode === keys.left || keyCode === keys.up
                    ) ? -1 : 1;

                    // Try to highlight next/prev legend item
                    var res = chart.highlightLegendItem(
                        component.highlightedLegendItemIx + direction
                    );
                    if (res) {
                        component.highlightedLegendItemIx += direction;
                        return this.response.success;
                    }

                    // Failed, can we wrap around?
                    if (
                        chart.legend.allItems.length > 1 &&
                        a11yOptions.keyboardNavigation.wrapAround
                    ) {
                        // Wrap around if we failed and have more than 1 item
                        this.init(direction);
                        return this.response.success;
                    }

                    // No wrap, move
                    return this.response[direction > 0 ? 'next' : 'prev'];
                }],

                // Click item
                [[
                    keys.enter, keys.space
                ], function () {
                    var legendElement = chart.legend.allItems[
                        component.highlightedLegendItemIx
                    ].legendItem.element;

                    this.fakeClickEvent(
                        !chart.legend.options.useHTML ? // #8561
                            legendElement.parentNode : legendElement
                    );
                    return this.response.success;
                }]
            ],

            // Only run this module if we have at least one legend - wait for
            // it - item. Don't run if the legend is populated by a colorAxis.
            // Don't run if legend navigation is disabled.
            validate: function () {
                var legendOptions = chart.options.legend;
                return chart.legend && chart.legend.allItems &&
                    chart.legend.display &&
                    !(chart.colorAxis && chart.colorAxis.length) &&
                    legendOptions &&
                    legendOptions.accessibility &&
                    legendOptions.accessibility.keyboardNavigation &&
                    legendOptions.accessibility.keyboardNavigation.enabled;
            },


            // Focus first/last item
            init: function (direction) {
                var ix = direction > 0 ? 0 : chart.legend.allItems.length - 1;
                chart.highlightLegendItem(ix);
                component.highlightedLegendItemIx = ix;
            }
        });
    }

});

export default LegendComponent;
