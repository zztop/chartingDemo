(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var Chartist = require('chartist');
var superAgent = require('superagent');



superAgent.get('/gettemp').end(function(data) {
    if (data.ok) {

        new Chartist.Bar('.ct-chart', {
            labels: data.body.dates,
            series: [
                data.body.max,
                data.body.avg,
                data.body.min
            ]
        }, {
            stackBars: true,
            axisY: {
                labelInterpolationFnc: function(value) {
                    return value + ' c';
                }
            }
        }).on('draw', function(data) {
            if (data.type === 'bar') {
                data.element.attr({
                    style: 'stroke-width: 5px'
                });
            }
        });
    }
});



},{"chartist":2,"superagent":3}],2:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Chartist'] = factory();
  }
}(this, function () {

  /* Chartist.js 0.7.2
   * Copyright © 2015 Gion Kunz
   * Free to use under the WTFPL license.
   * http://www.wtfpl.net/
   */
  /**
   * The core module of Chartist that is mainly providing static functions and higher level functions for chart modules.
   *
   * @module Chartist.Core
   */
  var Chartist = {
    version: '0.7.1'
  };

  (function (window, document, Chartist) {
    'use strict';

    /**
     * Helps to simplify functional style code
     *
     * @memberof Chartist.Core
     * @param {*} n This exact value will be returned by the noop function
     * @return {*} The same value that was provided to the n parameter
     */
    Chartist.noop = function (n) {
      return n;
    };

    /**
     * Generates a-z from a number 0 to 26
     *
     * @memberof Chartist.Core
     * @param {Number} n A number from 0 to 26 that will result in a letter a-z
     * @return {String} A character from a-z based on the input number n
     */
    Chartist.alphaNumerate = function (n) {
      // Limit to a-z
      return String.fromCharCode(97 + n % 26);
    };

    /**
     * Simple recursive object extend
     *
     * @memberof Chartist.Core
     * @param {Object} target Target object where the source will be merged into
     * @param {Object...} sources This object (objects) will be merged into target and then target is returned
     * @return {Object} An object that has the same reference as target but is extended and merged with the properties of source
     */
    Chartist.extend = function (target) {
      target = target || {};

      var sources = Array.prototype.slice.call(arguments, 1);
      sources.forEach(function(source) {
        for (var prop in source) {
          if (typeof source[prop] === 'object' && !(source[prop] instanceof Array)) {
            target[prop] = Chartist.extend(target[prop], source[prop]);
          } else {
            target[prop] = source[prop];
          }
        }
      });

      return target;
    };

    /**
     * Replaces all occurrences of subStr in str with newSubStr and returns a new string.
     *
     * @memberof Chartist.Core
     * @param {String} str
     * @param {String} subStr
     * @param {String} newSubStr
     * @return {String}
     */
    Chartist.replaceAll = function(str, subStr, newSubStr) {
      return str.replace(new RegExp(subStr, 'g'), newSubStr);
    };

    /**
     * Converts a string to a number while removing the unit if present. If a number is passed then this will be returned unmodified.
     *
     * @memberof Chartist.Core
     * @param {String|Number} value
     * @return {Number} Returns the string as number or NaN if the passed length could not be converted to pixel
     */
    Chartist.stripUnit = function(value) {
      if(typeof value === 'string') {
        value = value.replace(/[^0-9\+-\.]/g, '');
      }

      return +value;
    };

    /**
     * Converts a number to a string with a unit. If a string is passed then this will be returned unmodified.
     *
     * @memberof Chartist.Core
     * @param {Number} value
     * @param {String} unit
     * @return {String} Returns the passed number value with unit.
     */
    Chartist.ensureUnit = function(value, unit) {
      if(typeof value === 'number') {
        value = value + unit;
      }

      return value;
    };

    /**
     * This is a wrapper around document.querySelector that will return the query if it's already of type Node
     *
     * @memberof Chartist.Core
     * @param {String|Node} query The query to use for selecting a Node or a DOM node that will be returned directly
     * @return {Node}
     */
    Chartist.querySelector = function(query) {
      return query instanceof Node ? query : document.querySelector(query);
    };

    /**
     * Functional style helper to produce array with given length initialized with undefined values
     *
     * @memberof Chartist.Core
     * @param length
     * @return {Array}
     */
    Chartist.times = function(length) {
      return Array.apply(null, new Array(length));
    };

    /**
     * Sum helper to be used in reduce functions
     *
     * @memberof Chartist.Core
     * @param previous
     * @param current
     * @return {*}
     */
    Chartist.sum = function(previous, current) {
      return previous + current;
    };

    /**
     * Map for multi dimensional arrays where their nested arrays will be mapped in serial. The output array will have the length of the largest nested array. The callback function is called with variable arguments where each argument is the nested array value (or undefined if there are no more values).
     *
     * @memberof Chartist.Core
     * @param arr
     * @param cb
     * @return {Array}
     */
    Chartist.serialMap = function(arr, cb) {
      var result = [],
          length = Math.max.apply(null, arr.map(function(e) {
            return e.length;
          }));

      Chartist.times(length).forEach(function(e, index) {
        var args = arr.map(function(e) {
          return e[index];
        });

        result[index] = cb.apply(null, args);
      });

      return result;
    };

    /**
     * A map with characters to escape for strings to be safely used as attribute values.
     *
     * @memberof Chartist.Core
     * @type {Object}
     */
    Chartist.escapingMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;'
    };

    /**
     * This function serializes arbitrary data to a string. In case of data that can't be easily converted to a string, this function will create a wrapper object and serialize the data using JSON.stringify. The outcoming string will always be escaped using Chartist.escapingMap.
     * If called with null or undefined the function will return immediately with null or undefined.
     *
     * @memberof Chartist.Core
     * @param {Number|String|Object} data
     * @return {String}
     */
    Chartist.serialize = function(data) {
      if(data === null || data === undefined) {
        return data;
      } else if(typeof data === 'number') {
        data = ''+data;
      } else if(typeof data === 'object') {
        data = JSON.stringify({data: data});
      }

      return Object.keys(Chartist.escapingMap).reduce(function(result, key) {
        return Chartist.replaceAll(result, key, Chartist.escapingMap[key]);
      }, data);
    };

    /**
     * This function de-serializes a string previously serialized with Chartist.serialize. The string will always be unescaped using Chartist.escapingMap before it's returned. Based on the input value the return type can be Number, String or Object. JSON.parse is used with try / catch to see if the unescaped string can be parsed into an Object and this Object will be returned on success.
     *
     * @memberof Chartist.Core
     * @param {String} data
     * @return {String|Number|Object}
     */
    Chartist.deserialize = function(data) {
      if(typeof data !== 'string') {
        return data;
      }

      data = Object.keys(Chartist.escapingMap).reduce(function(result, key) {
        return Chartist.replaceAll(result, Chartist.escapingMap[key], key);
      }, data);

      try {
        data = JSON.parse(data);
        data = data.data !== undefined ? data.data : data;
      } catch(e) {}

      return data;
    };

    /**
     * Create or reinitialize the SVG element for the chart
     *
     * @memberof Chartist.Core
     * @param {Node} container The containing DOM Node object that will be used to plant the SVG element
     * @param {String} width Set the width of the SVG element. Default is 100%
     * @param {String} height Set the height of the SVG element. Default is 100%
     * @param {String} className Specify a class to be added to the SVG element
     * @return {Object} The created/reinitialized SVG element
     */
    Chartist.createSvg = function (container, width, height, className) {
      var svg;

      width = width || '100%';
      height = height || '100%';

      // Check if there is a previous SVG element in the container that contains the Chartist XML namespace and remove it
      // Since the DOM API does not support namespaces we need to manually search the returned list http://www.w3.org/TR/selectors-api/
      Array.prototype.slice.call(container.querySelectorAll('svg')).filter(function filterChartistSvgObjects(svg) {
        return svg.getAttribute(Chartist.xmlNs.qualifiedName);
      }).forEach(function removePreviousElement(svg) {
        container.removeChild(svg);
      });

      // Create svg object with width and height or use 100% as default
      svg = new Chartist.Svg('svg').attr({
        width: width,
        height: height
      }).addClass(className).attr({
        style: 'width: ' + width + '; height: ' + height + ';'
      });

      // Add the DOM node to our container
      container.appendChild(svg._node);

      return svg;
    };


    /**
     * Reverses the series, labels and series data arrays.
     *
     * @memberof Chartist.Core
     * @param data
     */
    Chartist.reverseData = function(data) {
      data.labels.reverse();
      data.series.reverse();
      for (var i = 0; i < data.series.length; i++) {
        if(typeof(data.series[i]) === 'object' && data.series[i].data !== undefined) {
          data.series[i].data.reverse();
        } else {
          data.series[i].reverse();
        }
      }
    };

    /**
     * Convert data series into plain array
     *
     * @memberof Chartist.Core
     * @param {Object} data The series object that contains the data to be visualized in the chart
     * @param {Boolean} reverse If true the whole data is reversed by the getDataArray call. This will modify the data object passed as first parameter. The labels as well as the series order is reversed. The whole series data arrays are reversed too.
     * @return {Array} A plain array that contains the data to be visualized in the chart
     */
    Chartist.getDataArray = function (data, reverse) {
      var array = [],
        value,
        localData;

      // If the data should be reversed but isn't we need to reverse it
      // If it's reversed but it shouldn't we need to reverse it back
      // That's required to handle data updates correctly and to reflect the responsive configurations
      if(reverse && !data.reversed || !reverse && data.reversed) {
        Chartist.reverseData(data);
        data.reversed = !data.reversed;
      }

      for (var i = 0; i < data.series.length; i++) {
        // If the series array contains an object with a data property we will use the property
        // otherwise the value directly (array or number).
        // We create a copy of the original data array with Array.prototype.push.apply
        localData = typeof(data.series[i]) === 'object' && data.series[i].data !== undefined ? data.series[i].data : data.series[i];
        if(localData instanceof Array) {
          array[i] = [];
          Array.prototype.push.apply(array[i], localData);
        } else {
          array[i] = localData;
        }

        // Convert object values to numbers
        for (var j = 0; j < array[i].length; j++) {
          value = array[i][j];
          value = value.value === 0 ? 0 : (value.value || value);
          array[i][j] = +value;
        }
      }

      return array;
    };

    /**
     * Adds missing values at the end of the array. This array contains the data, that will be visualized in the chart
     *
     * @memberof Chartist.Core
     * @param {Array} dataArray The array that contains the data to be visualized in the chart. The array in this parameter will be modified by function.
     * @param {Number} length The length of the x-axis data array.
     * @return {Array} The array that got updated with missing values.
     */
    Chartist.normalizeDataArray = function (dataArray, length) {
      for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i].length === length) {
          continue;
        }

        for (var j = dataArray[i].length; j < length; j++) {
          dataArray[i][j] = 0;
        }
      }

      return dataArray;
    };

    Chartist.getMetaData = function(series, index) {
      var value = series.data ? series.data[index] : series[index];
      return value ? Chartist.serialize(value.meta) : undefined;
    };

    /**
     * Calculate the order of magnitude for the chart scale
     *
     * @memberof Chartist.Core
     * @param {Number} value The value Range of the chart
     * @return {Number} The order of magnitude
     */
    Chartist.orderOfMagnitude = function (value) {
      return Math.floor(Math.log(Math.abs(value)) / Math.LN10);
    };

    /**
     * Project a data length into screen coordinates (pixels)
     *
     * @memberof Chartist.Core
     * @param {Object} axisLength The svg element for the chart
     * @param {Number} length Single data value from a series array
     * @param {Object} bounds All the values to set the bounds of the chart
     * @return {Number} The projected data length in pixels
     */
    Chartist.projectLength = function (axisLength, length, bounds) {
      return length / bounds.range * axisLength;
    };

    /**
     * Get the height of the area in the chart for the data series
     *
     * @memberof Chartist.Core
     * @param {Object} svg The svg element for the chart
     * @param {Object} options The Object that contains all the optional values for the chart
     * @return {Number} The height of the area in the chart for the data series
     */
    Chartist.getAvailableHeight = function (svg, options) {
      return Math.max((Chartist.stripUnit(options.height) || svg.height()) - (options.chartPadding * 2) - options.axisX.offset, 0);
    };

    /**
     * Get highest and lowest value of data array. This Array contains the data that will be visualized in the chart.
     *
     * @memberof Chartist.Core
     * @param {Array} dataArray The array that contains the data to be visualized in the chart
     * @return {Object} An object that contains the highest and lowest value that will be visualized on the chart.
     */
    Chartist.getHighLow = function (dataArray) {
      var i,
        j,
        highLow = {
          high: -Number.MAX_VALUE,
          low: Number.MAX_VALUE
        };

      for (i = 0; i < dataArray.length; i++) {
        for (j = 0; j < dataArray[i].length; j++) {
          if (dataArray[i][j] > highLow.high) {
            highLow.high = dataArray[i][j];
          }

          if (dataArray[i][j] < highLow.low) {
            highLow.low = dataArray[i][j];
          }
        }
      }

      return highLow;
    };

    /**
     * Calculate and retrieve all the bounds for the chart and return them in one array
     *
     * @memberof Chartist.Core
     * @param {Number} axisLength The length of the Axis used for
     * @param {Object} highLow An object containing a high and low property indicating the value range of the chart.
     * @param {Number} scaleMinSpace The minimum projected length a step should result in
     * @param {Number} referenceValue The reference value for the chart.
     * @return {Object} All the values to set the bounds of the chart
     */
    Chartist.getBounds = function (axisLength, highLow, scaleMinSpace, referenceValue) {
      var i,
        newMin,
        newMax,
        bounds = {
          high: highLow.high,
          low: highLow.low
        };

      // If high and low are the same because of misconfiguration or flat data (only the same value) we need
      // to set the high or low to 0 depending on the polarity
      if(bounds.high === bounds.low) {
        // If both values are 0 we set high to 1
        if(bounds.low === 0) {
          bounds.high = 1;
        } else if(bounds.low < 0) {
          // If we have the same negative value for the bounds we set bounds.high to 0
          bounds.high = 0;
        } else {
          // If we have the same positive value for the bounds we set bounds.low to 0
          bounds.low = 0;
        }
      }

      // Overrides of high / low based on reference value, it will make sure that the invisible reference value is
      // used to generate the chart. This is useful when the chart always needs to contain the position of the
      // invisible reference value in the view i.e. for bipolar scales.
      if (referenceValue || referenceValue === 0) {
        bounds.high = Math.max(referenceValue, bounds.high);
        bounds.low = Math.min(referenceValue, bounds.low);
      }

      bounds.valueRange = bounds.high - bounds.low;
      bounds.oom = Chartist.orderOfMagnitude(bounds.valueRange);
      bounds.min = Math.floor(bounds.low / Math.pow(10, bounds.oom)) * Math.pow(10, bounds.oom);
      bounds.max = Math.ceil(bounds.high / Math.pow(10, bounds.oom)) * Math.pow(10, bounds.oom);
      bounds.range = bounds.max - bounds.min;
      bounds.step = Math.pow(10, bounds.oom);
      bounds.numberOfSteps = Math.round(bounds.range / bounds.step);

      // Optimize scale step by checking if subdivision is possible based on horizontalGridMinSpace
      // If we are already below the scaleMinSpace value we will scale up
      var length = Chartist.projectLength(axisLength, bounds.step, bounds),
        scaleUp = length < scaleMinSpace;

      while (true) {
        if (scaleUp && Chartist.projectLength(axisLength, bounds.step, bounds) <= scaleMinSpace) {
          bounds.step *= 2;
        } else if (!scaleUp && Chartist.projectLength(axisLength, bounds.step / 2, bounds) >= scaleMinSpace) {
          bounds.step /= 2;
        } else {
          break;
        }
      }

      // Narrow min and max based on new step
      newMin = bounds.min;
      newMax = bounds.max;
      for (i = bounds.min; i <= bounds.max; i += bounds.step) {
        if (i + bounds.step < bounds.low) {
          newMin += bounds.step;
        }

        if (i - bounds.step >= bounds.high) {
          newMax -= bounds.step;
        }
      }
      bounds.min = newMin;
      bounds.max = newMax;
      bounds.range = bounds.max - bounds.min;

      bounds.values = [];
      for (i = bounds.min; i <= bounds.max; i += bounds.step) {
        bounds.values.push(i);
      }

      return bounds;
    };

    /**
     * Calculate cartesian coordinates of polar coordinates
     *
     * @memberof Chartist.Core
     * @param {Number} centerX X-axis coordinates of center point of circle segment
     * @param {Number} centerY X-axis coordinates of center point of circle segment
     * @param {Number} radius Radius of circle segment
     * @param {Number} angleInDegrees Angle of circle segment in degrees
     * @return {Number} Coordinates of point on circumference
     */
    Chartist.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
      var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };

    /**
     * Initialize chart drawing rectangle (area where chart is drawn) x1,y1 = bottom left / x2,y2 = top right
     *
     * @memberof Chartist.Core
     * @param {Object} svg The svg element for the chart
     * @param {Object} options The Object that contains all the optional values for the chart
     * @return {Object} The chart rectangles coordinates inside the svg element plus the rectangles measurements
     */
    Chartist.createChartRect = function (svg, options) {
      var yOffset = options.axisY ? options.axisY.offset || 0 : 0,
        xOffset = options.axisX ? options.axisX.offset || 0 : 0,
        w = Chartist.stripUnit(options.width) || svg.width(),
        h = Chartist.stripUnit(options.height) || svg.height();

      return {
        x1: options.chartPadding + yOffset,
        y1: Math.max(h - options.chartPadding - xOffset, options.chartPadding),
        x2: Math.max(w - options.chartPadding, options.chartPadding + yOffset),
        y2: options.chartPadding,
        width: function () {
          return this.x2 - this.x1;
        },
        height: function () {
          return this.y1 - this.y2;
        }
      };
    };

    /**
     * Creates a grid line based on a projected value.
     *
     * @memberof Chartist.Core
     * @param projectedValue
     * @param index
     * @param axis
     * @param offset
     * @param length
     * @param group
     * @param classes
     * @param eventEmitter
     */
    Chartist.createGrid = function(projectedValue, index, axis, offset, length, group, classes, eventEmitter) {
      var positionalData = {};
      positionalData[axis.units.pos + '1'] = projectedValue.pos;
      positionalData[axis.units.pos + '2'] = projectedValue.pos;
      positionalData[axis.counterUnits.pos + '1'] = offset;
      positionalData[axis.counterUnits.pos + '2'] = offset + length;

      var gridElement = group.elem('line', positionalData, classes.join(' '));

      // Event for grid draw
      eventEmitter.emit('draw',
        Chartist.extend({
          type: 'grid',
          axis: axis.units.pos,
          index: index,
          group: group,
          element: gridElement
        }, positionalData)
      );
    };

    /**
     * Creates a label based on a projected value and an axis.
     *
     * @memberof Chartist.Core
     * @param projectedValue
     * @param index
     * @param labels
     * @param axis
     * @param axisOffset
     * @param labelOffset
     * @param group
     * @param classes
     * @param useForeignObject
     * @param eventEmitter
     */
    Chartist.createLabel = function(projectedValue, index, labels, axis, axisOffset, labelOffset, group, classes, useForeignObject, eventEmitter) {
      var labelElement,
        positionalData = {};
      positionalData[axis.units.pos] = projectedValue.pos + labelOffset[axis.units.pos];
      positionalData[axis.counterUnits.pos] = labelOffset[axis.counterUnits.pos];
      positionalData[axis.units.len] = projectedValue.len;
      positionalData[axis.counterUnits.len] = axisOffset;

      if(useForeignObject) {
        var content = '<span class="' + classes.join(' ') + '">' + labels[index] + '</span>';
        labelElement = group.foreignObject(content, Chartist.extend({
          style: 'overflow: visible;'
        }, positionalData));
      } else {
        labelElement = group.elem('text', positionalData, classes.join(' ')).text(labels[index]);
      }

      eventEmitter.emit('draw', Chartist.extend({
        type: 'label',
        axis: axis,
        index: index,
        group: group,
        element: labelElement,
        text: labels[index]
      }, positionalData));
    };

    /**
     * This function creates a whole axis with its grid lines and labels based on an axis model and a chartRect.
     *
     * @memberof Chartist.Core
     * @param axis
     * @param data
     * @param chartRect
     * @param gridGroup
     * @param labelGroup
     * @param useForeignObject
     * @param options
     * @param eventEmitter
     */
    Chartist.createAxis = function(axis, data, chartRect, gridGroup, labelGroup, useForeignObject, options, eventEmitter) {
      var axisOptions = options['axis' + axis.units.pos.toUpperCase()],
        projectedValues = data.map(axis.projectValue.bind(axis)).map(axis.transform),
        labelValues = data.map(axisOptions.labelInterpolationFnc);

      projectedValues.forEach(function(projectedValue, index) {
        // Skip grid lines and labels where interpolated label values are falsey (execpt for 0)
        if(!labelValues[index] && labelValues[index] !== 0) {
          return;
        }

        if(axisOptions.showGrid) {
          Chartist.createGrid(projectedValue, index, axis, axis.gridOffset, chartRect[axis.counterUnits.len](), gridGroup, [
            options.classNames.grid,
            options.classNames[axis.units.dir]
          ], eventEmitter);
        }

        if(axisOptions.showLabel) {
          Chartist.createLabel(projectedValue, index, labelValues, axis, axisOptions.offset, axis.labelOffset, labelGroup, [
            options.classNames.label,
            options.classNames[axis.units.dir]
          ], useForeignObject, eventEmitter);
        }
      });
    };

    /**
     * Provides options handling functionality with callback for options changes triggered by responsive options and media query matches
     *
     * @memberof Chartist.Core
     * @param {Object} options Options set by user
     * @param {Array} responsiveOptions Optional functions to add responsive behavior to chart
     * @param {Object} eventEmitter The event emitter that will be used to emit the options changed events
     * @return {Object} The consolidated options object from the defaults, base and matching responsive options
     */
    Chartist.optionsProvider = function (options, responsiveOptions, eventEmitter) {
      var baseOptions = Chartist.extend({}, options),
        currentOptions,
        mediaQueryListeners = [],
        i;

      function updateCurrentOptions() {
        var previousOptions = currentOptions;
        currentOptions = Chartist.extend({}, baseOptions);

        if (responsiveOptions) {
          for (i = 0; i < responsiveOptions.length; i++) {
            var mql = window.matchMedia(responsiveOptions[i][0]);
            if (mql.matches) {
              currentOptions = Chartist.extend(currentOptions, responsiveOptions[i][1]);
            }
          }
        }

        if(eventEmitter) {
          eventEmitter.emit('optionsChanged', {
            previousOptions: previousOptions,
            currentOptions: currentOptions
          });
        }
      }

      function removeMediaQueryListeners() {
        mediaQueryListeners.forEach(function(mql) {
          mql.removeListener(updateCurrentOptions);
        });
      }

      if (!window.matchMedia) {
        throw 'window.matchMedia not found! Make sure you\'re using a polyfill.';
      } else if (responsiveOptions) {

        for (i = 0; i < responsiveOptions.length; i++) {
          var mql = window.matchMedia(responsiveOptions[i][0]);
          mql.addListener(updateCurrentOptions);
          mediaQueryListeners.push(mql);
        }
      }
      // Execute initially so we get the correct options
      updateCurrentOptions();

      return {
        get currentOptions() {
          return Chartist.extend({}, currentOptions);
        },
        removeMediaQueryListeners: removeMediaQueryListeners
      };
    };

    //http://schepers.cc/getting-to-the-point
    Chartist.catmullRom2bezier = function (crp, z) {
      var d = [];
      for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
        var p = [
          {x: +crp[i - 2], y: +crp[i - 1]},
          {x: +crp[i], y: +crp[i + 1]},
          {x: +crp[i + 2], y: +crp[i + 3]},
          {x: +crp[i + 4], y: +crp[i + 5]}
        ];
        if (z) {
          if (!i) {
            p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
          } else if (iLen - 4 === i) {
            p[3] = {x: +crp[0], y: +crp[1]};
          } else if (iLen - 2 === i) {
            p[2] = {x: +crp[0], y: +crp[1]};
            p[3] = {x: +crp[2], y: +crp[3]};
          }
        } else {
          if (iLen - 4 === i) {
            p[3] = p[2];
          } else if (!i) {
            p[0] = {x: +crp[i], y: +crp[i + 1]};
          }
        }
        d.push(
          [
            (-p[0].x + 6 * p[1].x + p[2].x) / 6,
            (-p[0].y + 6 * p[1].y + p[2].y) / 6,
            (p[1].x + 6 * p[2].x - p[3].x) / 6,
            (p[1].y + 6 * p[2].y - p[3].y) / 6,
            p[2].x,
            p[2].y
          ]
        );
      }

      return d;
    };

  }(window, document, Chartist));
  ;/**
   * Chartist path interpolation functions.
   *
   * @module Chartist.Interpolation
   */
  /* global Chartist */
  (function(window, document, Chartist) {
    'use strict';

    Chartist.Interpolation = {};

    /**
     * This interpolation function does not smooth the path and the result is only containing lines and no curves.
     *
     * @memberof Chartist.Interpolation
     * @return {Function}
     */
    Chartist.Interpolation.none = function() {
      return function cardinal(pathCoordinates) {
        var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1]);

        for(var i = 3; i < pathCoordinates.length; i += 2) {
          path.line(pathCoordinates[i - 1], pathCoordinates[i]);
        }

        return path;
      };
    };

    /**
     * Simple smoothing creates horizontal handles that are positioned with a fraction of the length between two data points. You can use the divisor option to specify the amount of smoothing.
     *
     * Simple smoothing can be used instead of `Chartist.Smoothing.cardinal` if you'd like to get rid of the artifacts it produces sometimes. Simple smoothing produces less flowing lines but is accurate by hitting the points and it also doesn't swing below or above the given data point.
     *
     * All smoothing functions within Chartist are factory functions that accept an options parameter. The simple interpolation function accepts one configuration parameter `divisor`, between 1 and ∞, which controls the smoothing characteristics.
     *
     * @example
     * var chart = new Chartist.Line('.ct-chart', {
     *   labels: [1, 2, 3, 4, 5],
     *   series: [[1, 2, 8, 1, 7]]
     * }, {
     *   lineSmooth: Chartist.Interpolation.simple({
     *     divisor: 2
     *   })
     * });
     *
     *
     * @memberof Chartist.Interpolation
     * @param {Object} options The options of the simple interpolation factory function.
     * @return {Function}
     */
    Chartist.Interpolation.simple = function(options) {
      var defaultOptions = {
        divisor: 2
      };
      options = Chartist.extend({}, defaultOptions, options);

      var d = 1 / Math.max(1, options.divisor);

      return function simple(pathCoordinates) {
        var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1]);

        for(var i = 2; i < pathCoordinates.length; i += 2) {
          var prevX = pathCoordinates[i - 2],
              prevY = pathCoordinates[i - 1],
              currX = pathCoordinates[i],
              currY = pathCoordinates[i + 1],
              length = (currX - prevX) * d;

          path.curve(
            prevX + length,
            prevY,
            currX - length,
            currY,
            currX,
            currY
          );
        }

        return path;
      };
    };

    /**
     * Cardinal / Catmull-Rome spline interpolation is the default smoothing function in Chartist. It produces nice results where the splines will always meet the points. It produces some artifacts though when data values are increased or decreased rapidly. The line may not follow a very accurate path and if the line should be accurate this smoothing function does not produce the best results.
     *
     * Cardinal splines can only be created if there are more than two data points. If this is not the case this smoothing will fallback to `Chartist.Smoothing.none`.
     *
     * All smoothing functions within Chartist are factory functions that accept an options parameter. The cardinal interpolation function accepts one configuration parameter `tension`, between 0 and 1, which controls the smoothing intensity.
     *
     * @example
     * var chart = new Chartist.Line('.ct-chart', {
     *   labels: [1, 2, 3, 4, 5],
     *   series: [[1, 2, 8, 1, 7]]
     * }, {
     *   lineSmooth: Chartist.Interpolation.cardinal({
     *     tension: 1
     *   })
     * });
     *
     * @memberof Chartist.Interpolation
     * @param {Object} options The options of the cardinal factory function.
     * @return {Function}
     */
    Chartist.Interpolation.cardinal = function(options) {
      var defaultOptions = {
        tension: 1
      };

      options = Chartist.extend({}, defaultOptions, options);

      var t = Math.min(1, Math.max(0, options.tension)),
        c = 1 - t;

      return function cardinal(pathCoordinates) {
        // If less than two points we need to fallback to no smoothing
        if(pathCoordinates.length <= 4) {
          return Chartist.Interpolation.none()(pathCoordinates);
        }

        var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1]),
          z;

        for (var i = 0, iLen = pathCoordinates.length; iLen - 2 * !z > i; i += 2) {
          var p = [
            {x: +pathCoordinates[i - 2], y: +pathCoordinates[i - 1]},
            {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]},
            {x: +pathCoordinates[i + 2], y: +pathCoordinates[i + 3]},
            {x: +pathCoordinates[i + 4], y: +pathCoordinates[i + 5]}
          ];
          if (z) {
            if (!i) {
              p[0] = {x: +pathCoordinates[iLen - 2], y: +pathCoordinates[iLen - 1]};
            } else if (iLen - 4 === i) {
              p[3] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
            } else if (iLen - 2 === i) {
              p[2] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
              p[3] = {x: +pathCoordinates[2], y: +pathCoordinates[3]};
            }
          } else {
            if (iLen - 4 === i) {
              p[3] = p[2];
            } else if (!i) {
              p[0] = {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]};
            }
          }

          path.curve(
            (t * (-p[0].x + 6 * p[1].x + p[2].x) / 6) + (c * p[2].x),
            (t * (-p[0].y + 6 * p[1].y + p[2].y) / 6) + (c * p[2].y),
            (t * (p[1].x + 6 * p[2].x - p[3].x) / 6) + (c * p[2].x),
            (t * (p[1].y + 6 * p[2].y - p[3].y) / 6) + (c * p[2].y),
            p[2].x,
            p[2].y
          );
        }

        return path;
      };
    };

  }(window, document, Chartist));
  ;/**
   * A very basic event module that helps to generate and catch events.
   *
   * @module Chartist.Event
   */
  /* global Chartist */
  (function (window, document, Chartist) {
    'use strict';

    Chartist.EventEmitter = function () {
      var handlers = [];

      /**
       * Add an event handler for a specific event
       *
       * @memberof Chartist.Event
       * @param {String} event The event name
       * @param {Function} handler A event handler function
       */
      function addEventHandler(event, handler) {
        handlers[event] = handlers[event] || [];
        handlers[event].push(handler);
      }

      /**
       * Remove an event handler of a specific event name or remove all event handlers for a specific event.
       *
       * @memberof Chartist.Event
       * @param {String} event The event name where a specific or all handlers should be removed
       * @param {Function} [handler] An optional event handler function. If specified only this specific handler will be removed and otherwise all handlers are removed.
       */
      function removeEventHandler(event, handler) {
        // Only do something if there are event handlers with this name existing
        if(handlers[event]) {
          // If handler is set we will look for a specific handler and only remove this
          if(handler) {
            handlers[event].splice(handlers[event].indexOf(handler), 1);
            if(handlers[event].length === 0) {
              delete handlers[event];
            }
          } else {
            // If no handler is specified we remove all handlers for this event
            delete handlers[event];
          }
        }
      }

      /**
       * Use this function to emit an event. All handlers that are listening for this event will be triggered with the data parameter.
       *
       * @memberof Chartist.Event
       * @param {String} event The event name that should be triggered
       * @param {*} data Arbitrary data that will be passed to the event handler callback functions
       */
      function emit(event, data) {
        // Only do something if there are event handlers with this name existing
        if(handlers[event]) {
          handlers[event].forEach(function(handler) {
            handler(data);
          });
        }

        // Emit event to star event handlers
        if(handlers['*']) {
          handlers['*'].forEach(function(starHandler) {
            starHandler(event, data);
          });
        }
      }

      return {
        addEventHandler: addEventHandler,
        removeEventHandler: removeEventHandler,
        emit: emit
      };
    };

  }(window, document, Chartist));
  ;/**
   * This module provides some basic prototype inheritance utilities.
   *
   * @module Chartist.Class
   */
  /* global Chartist */
  (function(window, document, Chartist) {
    'use strict';

    function listToArray(list) {
      var arr = [];
      if (list.length) {
        for (var i = 0; i < list.length; i++) {
          arr.push(list[i]);
        }
      }
      return arr;
    }

    /**
     * Method to extend from current prototype.
     *
     * @memberof Chartist.Class
     * @param {Object} properties The object that serves as definition for the prototype that gets created for the new class. This object should always contain a constructor property that is the desired constructor for the newly created class.
     * @param {Object} [superProtoOverride] By default extens will use the current class prototype or Chartist.class. With this parameter you can specify any super prototype that will be used.
     * @return {Function} Constructor function of the new class
     *
     * @example
     * var Fruit = Class.extend({
       * color: undefined,
       *   sugar: undefined,
       *
       *   constructor: function(color, sugar) {
       *     this.color = color;
       *     this.sugar = sugar;
       *   },
       *
       *   eat: function() {
       *     this.sugar = 0;
       *     return this;
       *   }
       * });
     *
     * var Banana = Fruit.extend({
       *   length: undefined,
       *
       *   constructor: function(length, sugar) {
       *     Banana.super.constructor.call(this, 'Yellow', sugar);
       *     this.length = length;
       *   }
       * });
     *
     * var banana = new Banana(20, 40);
     * console.log('banana instanceof Fruit', banana instanceof Fruit);
     * console.log('Fruit is prototype of banana', Fruit.prototype.isPrototypeOf(banana));
     * console.log('bananas prototype is Fruit', Object.getPrototypeOf(banana) === Fruit.prototype);
     * console.log(banana.sugar);
     * console.log(banana.eat().sugar);
     * console.log(banana.color);
     */
    function extend(properties, superProtoOverride) {
      var superProto = superProtoOverride || this.prototype || Chartist.Class;
      var proto = Object.create(superProto);

      Chartist.Class.cloneDefinitions(proto, properties);

      var constr = function() {
        var fn = proto.constructor || function () {},
          instance;

        // If this is linked to the Chartist namespace the constructor was not called with new
        // To provide a fallback we will instantiate here and return the instance
        instance = this === Chartist ? Object.create(proto) : this;
        fn.apply(instance, Array.prototype.slice.call(arguments, 0));

        // If this constructor was not called with new we need to return the instance
        // This will not harm when the constructor has been called with new as the returned value is ignored
        return instance;
      };

      constr.prototype = proto;
      constr.super = superProto;
      constr.extend = this.extend;

      return constr;
    }

    // Variable argument list clones args > 0 into args[0] and retruns modified args[0]
    function cloneDefinitions() {
      var args = listToArray(arguments);
      var target = args[0];

      args.splice(1, args.length - 1).forEach(function (source) {
        Object.getOwnPropertyNames(source).forEach(function (propName) {
          // If this property already exist in target we delete it first
          delete target[propName];
          // Define the property with the descriptor from source
          Object.defineProperty(target, propName,
            Object.getOwnPropertyDescriptor(source, propName));
        });
      });

      return target;
    }

    Chartist.Class = {
      extend: extend,
      cloneDefinitions: cloneDefinitions
    };

  }(window, document, Chartist));
  ;/**
   * Base for all chart types. The methods in Chartist.Base are inherited to all chart types.
   *
   * @module Chartist.Base
   */
  /* global Chartist */
  (function(window, document, Chartist) {
    'use strict';

    // TODO: Currently we need to re-draw the chart on window resize. This is usually very bad and will affect performance.
    // This is done because we can't work with relative coordinates when drawing the chart because SVG Path does not
    // work with relative positions yet. We need to check if we can do a viewBox hack to switch to percentage.
    // See http://mozilla.6506.n7.nabble.com/Specyfing-paths-with-percentages-unit-td247474.html
    // Update: can be done using the above method tested here: http://codepen.io/gionkunz/pen/KDvLj
    // The problem is with the label offsets that can't be converted into percentage and affecting the chart container
    /**
     * Updates the chart which currently does a full reconstruction of the SVG DOM
     *
     * @param {Object} [data] Optional data you'd like to set for the chart before it will update. If not specified the update method will use the data that is already configured with the chart.
     * @param {Object} [options] Optional options you'd like to add to the previous options for the chart before it will update. If not specified the update method will use the options that have been already configured with the chart.
     * @param {Boolean} [extendObjects] If set to true, the passed options will be used to extend the options that have been configured already.
     * @memberof Chartist.Base
     */
    function update(data, options, extendObjects) {
      if(data) {
        this.data = data;
        // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
        this.eventEmitter.emit('data', {
          type: 'update',
          data: this.data
        });
      }

      if(options) {
        this.options = Chartist.extend({}, extendObjects ? this.options : {}, options);

        // If chartist was not initialized yet, we just set the options and leave the rest to the initialization
        if(!this.initializeTimeoutId) {
          this.optionsProvider.removeMediaQueryListeners();
          this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
        }
      }

      // Only re-created the chart if it has been initialized yet
      if(!this.initializeTimeoutId) {
        this.createChart(this.optionsProvider.currentOptions);
      }

      // Return a reference to the chart object to chain up calls
      return this;
    }

    /**
     * This method can be called on the API object of each chart and will un-register all event listeners that were added to other components. This currently includes a window.resize listener as well as media query listeners if any responsive options have been provided. Use this function if you need to destroy and recreate Chartist charts dynamically.
     *
     * @memberof Chartist.Base
     */
    function detach() {
      window.removeEventListener('resize', this.resizeListener);
      this.optionsProvider.removeMediaQueryListeners();
      return this;
    }

    /**
     * Use this function to register event handlers. The handler callbacks are synchronous and will run in the main thread rather than the event loop.
     *
     * @memberof Chartist.Base
     * @param {String} event Name of the event. Check the examples for supported events.
     * @param {Function} handler The handler function that will be called when an event with the given name was emitted. This function will receive a data argument which contains event data. See the example for more details.
     */
    function on(event, handler) {
      this.eventEmitter.addEventHandler(event, handler);
      return this;
    }

    /**
     * Use this function to un-register event handlers. If the handler function parameter is omitted all handlers for the given event will be un-registered.
     *
     * @memberof Chartist.Base
     * @param {String} event Name of the event for which a handler should be removed
     * @param {Function} [handler] The handler function that that was previously used to register a new event handler. This handler will be removed from the event handler list. If this parameter is omitted then all event handlers for the given event are removed from the list.
     */
    function off(event, handler) {
      this.eventEmitter.removeEventHandler(event, handler);
      return this;
    }

    function initialize() {
      // Add window resize listener that re-creates the chart
      window.addEventListener('resize', this.resizeListener);

      // Obtain current options based on matching media queries (if responsive options are given)
      // This will also register a listener that is re-creating the chart based on media changes
      this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
      // Register options change listener that will trigger a chart update
      this.eventEmitter.addEventHandler('optionsChanged', function() {
        this.update();
      }.bind(this));

      // Before the first chart creation we need to register us with all plugins that are configured
      // Initialize all relevant plugins with our chart object and the plugin options specified in the config
      if(this.options.plugins) {
        this.options.plugins.forEach(function(plugin) {
          if(plugin instanceof Array) {
            plugin[0](this, plugin[1]);
          } else {
            plugin(this);
          }
        }.bind(this));
      }

      // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
      this.eventEmitter.emit('data', {
        type: 'initial',
        data: this.data
      });

      // Create the first chart
      this.createChart(this.optionsProvider.currentOptions);

      // As chart is initialized from the event loop now we can reset our timeout reference
      // This is important if the chart gets initialized on the same element twice
      this.initializeTimeoutId = undefined;
    }

    /**
     * Constructor of chart base class.
     *
     * @param query
     * @param data
     * @param options
     * @param responsiveOptions
     * @constructor
     */
    function Base(query, data, options, responsiveOptions) {
      this.container = Chartist.querySelector(query);
      this.data = data;
      this.options = options;
      this.responsiveOptions = responsiveOptions;
      this.eventEmitter = Chartist.EventEmitter();
      this.supportsForeignObject = Chartist.Svg.isSupported('Extensibility');
      this.supportsAnimations = Chartist.Svg.isSupported('AnimationEventsAttribute');
      this.resizeListener = function resizeListener(){
        this.update();
      }.bind(this);

      if(this.container) {
        // If chartist was already initialized in this container we are detaching all event listeners first
        if(this.container.__chartist__) {
          if(this.container.__chartist__.initializeTimeoutId) {
            // If the initializeTimeoutId is still set we can safely assume that the initialization function has not
            // been called yet from the event loop. Therefore we should cancel the timeout and don't need to detach
            window.clearTimeout(this.container.__chartist__.initializeTimeoutId);
          } else {
            // The timeout reference has already been reset which means we need to detach the old chart first
            this.container.__chartist__.detach();
          }
        }

        this.container.__chartist__ = this;
      }

      // Using event loop for first draw to make it possible to register event listeners in the same call stack where
      // the chart was created.
      this.initializeTimeoutId = setTimeout(initialize.bind(this), 0);
    }

    // Creating the chart base class
    Chartist.Base = Chartist.Class.extend({
      constructor: Base,
      optionsProvider: undefined,
      container: undefined,
      svg: undefined,
      eventEmitter: undefined,
      createChart: function() {
        throw new Error('Base chart type can\'t be instantiated!');
      },
      update: update,
      detach: detach,
      on: on,
      off: off,
      version: Chartist.version,
      supportsForeignObject: false
    });

  }(window, document, Chartist));
  ;/**
   * Chartist SVG module for simple SVG DOM abstraction
   *
   * @module Chartist.Svg
   */
  /* global Chartist */
  (function(window, document, Chartist) {
    'use strict';

    var svgNs = 'http://www.w3.org/2000/svg',
      xmlNs = 'http://www.w3.org/2000/xmlns/',
      xhtmlNs = 'http://www.w3.org/1999/xhtml';

    Chartist.xmlNs = {
      qualifiedName: 'xmlns:ct',
      prefix: 'ct',
      uri: 'http://gionkunz.github.com/chartist-js/ct'
    };

    /**
     * Chartist.Svg creates a new SVG object wrapper with a starting element. You can use the wrapper to fluently create sub-elements and modify them.
     *
     * @memberof Chartist.Svg
     * @constructor
     * @param {String|SVGElement} name The name of the SVG element to create or an SVG dom element which should be wrapped into Chartist.Svg
     * @param {Object} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
     * @param {String} className This class or class list will be added to the SVG element
     * @param {Object} parent The parent SVG wrapper object where this newly created wrapper and it's element will be attached to as child
     * @param {Boolean} insertFirst If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
     */
    function Svg(name, attributes, className, parent, insertFirst) {
      // If Svg is getting called with an SVG element we just return the wrapper
      if(name instanceof SVGElement) {
        this._node = name;
      } else {
        this._node = document.createElementNS(svgNs, name);

        // If this is an SVG element created then custom namespace
        if(name === 'svg') {
          this._node.setAttributeNS(xmlNs, Chartist.xmlNs.qualifiedName, Chartist.xmlNs.uri);
        }

        if(attributes) {
          this.attr(attributes);
        }

        if(className) {
          this.addClass(className);
        }

        if(parent) {
          if (insertFirst && parent._node.firstChild) {
            parent._node.insertBefore(this._node, parent._node.firstChild);
          } else {
            parent._node.appendChild(this._node);
          }
        }
      }
    }

    /**
     * Set attributes on the current SVG element of the wrapper you're currently working on.
     *
     * @memberof Chartist.Svg
     * @param {Object|String} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added. If this parameter is a String then the function is used as a getter and will return the attribute value.
     * @param {String} ns If specified, the attributes will be set as namespace attributes with ns as prefix.
     * @return {Object|String} The current wrapper object will be returned so it can be used for chaining or the attribute value if used as getter function.
     */
    function attr(attributes, ns) {
      if(typeof attributes === 'string') {
        if(ns) {
          return this._node.getAttributeNS(ns, attributes);
        } else {
          return this._node.getAttribute(attributes);
        }
      }

      Object.keys(attributes).forEach(function(key) {
        // If the attribute value is undefined we can skip this one
        if(attributes[key] === undefined) {
          return;
        }

        if(ns) {
          this._node.setAttributeNS(ns, [Chartist.xmlNs.prefix, ':', key].join(''), attributes[key]);
        } else {
          this._node.setAttribute(key, attributes[key]);
        }
      }.bind(this));

      return this;
    }

    /**
     * Create a new SVG element whose wrapper object will be selected for further operations. This way you can also create nested groups easily.
     *
     * @memberof Chartist.Svg
     * @param {String} name The name of the SVG element that should be created as child element of the currently selected element wrapper
     * @param {Object} [attributes] An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
     * @param {String} [className] This class or class list will be added to the SVG element
     * @param {Boolean} [insertFirst] If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
     * @return {Chartist.Svg} Returns a Chartist.Svg wrapper object that can be used to modify the containing SVG data
     */
    function elem(name, attributes, className, insertFirst) {
      return new Chartist.Svg(name, attributes, className, this, insertFirst);
    }

    /**
     * Returns the parent Chartist.SVG wrapper object
     *
     * @return {Chartist.Svg} Returns a Chartist.Svg wrapper around the parent node of the current node. If the parent node is not existing or it's not an SVG node then this function will return null.
     */
    function parent() {
      return this._node.parentNode instanceof SVGElement ? new Chartist.Svg(this._node.parentNode) : null;
    }

    /**
     * This method returns a Chartist.Svg wrapper around the root SVG element of the current tree.
     *
     * @return {Chartist.Svg} The root SVG element wrapped in a Chartist.Svg element
     */
    function root() {
      var node = this._node;
      while(node.nodeName !== 'svg') {
        node = node.parentNode;
      }
      return new Chartist.Svg(node);
    }

    /**
     * Find the first child SVG element of the current element that matches a CSS selector. The returned object is a Chartist.Svg wrapper.
     *
     * @param {String} selector A CSS selector that is used to query for child SVG elements
     * @return {Chartist.Svg} The SVG wrapper for the element found or null if no element was found
     */
    function querySelector(selector) {
      var foundNode = this._node.querySelector(selector);
      return foundNode ? new Chartist.Svg(foundNode) : null;
    }

    /**
     * Find the all child SVG elements of the current element that match a CSS selector. The returned object is a Chartist.Svg.List wrapper.
     *
     * @param {String} selector A CSS selector that is used to query for child SVG elements
     * @return {Chartist.Svg.List} The SVG wrapper list for the element found or null if no element was found
     */
    function querySelectorAll(selector) {
      var foundNodes = this._node.querySelectorAll(selector);
      return foundNodes.length ? new Chartist.Svg.List(foundNodes) : null;
    }

    /**
     * This method creates a foreignObject (see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) that allows to embed HTML content into a SVG graphic. With the help of foreignObjects you can enable the usage of regular HTML elements inside of SVG where they are subject for SVG positioning and transformation but the Browser will use the HTML rendering capabilities for the containing DOM.
     *
     * @memberof Chartist.Svg
     * @param {Node|String} content The DOM Node, or HTML string that will be converted to a DOM Node, that is then placed into and wrapped by the foreignObject
     * @param {String} [attributes] An object with properties that will be added as attributes to the foreignObject element that is created. Attributes with undefined values will not be added.
     * @param {String} [className] This class or class list will be added to the SVG element
     * @param {Boolean} [insertFirst] Specifies if the foreignObject should be inserted as first child
     * @return {Chartist.Svg} New wrapper object that wraps the foreignObject element
     */
    function foreignObject(content, attributes, className, insertFirst) {
      // If content is string then we convert it to DOM
      // TODO: Handle case where content is not a string nor a DOM Node
      if(typeof content === 'string') {
        var container = document.createElement('div');
        container.innerHTML = content;
        content = container.firstChild;
      }

      // Adding namespace to content element
      content.setAttribute('xmlns', xhtmlNs);

      // Creating the foreignObject without required extension attribute (as described here
      // http://www.w3.org/TR/SVG/extend.html#ForeignObjectElement)
      var fnObj = this.elem('foreignObject', attributes, className, insertFirst);

      // Add content to foreignObjectElement
      fnObj._node.appendChild(content);

      return fnObj;
    }

    /**
     * This method adds a new text element to the current Chartist.Svg wrapper.
     *
     * @memberof Chartist.Svg
     * @param {String} t The text that should be added to the text element that is created
     * @return {Chartist.Svg} The same wrapper object that was used to add the newly created element
     */
    function text(t) {
      this._node.appendChild(document.createTextNode(t));
      return this;
    }

    /**
     * This method will clear all child nodes of the current wrapper object.
     *
     * @memberof Chartist.Svg
     * @return {Chartist.Svg} The same wrapper object that got emptied
     */
    function empty() {
      while (this._node.firstChild) {
        this._node.removeChild(this._node.firstChild);
      }

      return this;
    }

    /**
     * This method will cause the current wrapper to remove itself from its parent wrapper. Use this method if you'd like to get rid of an element in a given DOM structure.
     *
     * @memberof Chartist.Svg
     * @return {Chartist.Svg} The parent wrapper object of the element that got removed
     */
    function remove() {
      this._node.parentNode.removeChild(this._node);
      return this.parent();
    }

    /**
     * This method will replace the element with a new element that can be created outside of the current DOM.
     *
     * @memberof Chartist.Svg
     * @param {Chartist.Svg} newElement The new Chartist.Svg object that will be used to replace the current wrapper object
     * @return {Chartist.Svg} The wrapper of the new element
     */
    function replace(newElement) {
      this._node.parentNode.replaceChild(newElement._node, this._node);
      return newElement;
    }

    /**
     * This method will append an element to the current element as a child.
     *
     * @memberof Chartist.Svg
     * @param {Chartist.Svg} element The Chartist.Svg element that should be added as a child
     * @param {Boolean} [insertFirst] Specifies if the element should be inserted as first child
     * @return {Chartist.Svg} The wrapper of the appended object
     */
    function append(element, insertFirst) {
      if(insertFirst && this._node.firstChild) {
        this._node.insertBefore(element._node, this._node.firstChild);
      } else {
        this._node.appendChild(element._node);
      }

      return this;
    }

    /**
     * Returns an array of class names that are attached to the current wrapper element. This method can not be chained further.
     *
     * @memberof Chartist.Svg
     * @return {Array} A list of classes or an empty array if there are no classes on the current element
     */
    function classes() {
      return this._node.getAttribute('class') ? this._node.getAttribute('class').trim().split(/\s+/) : [];
    }

    /**
     * Adds one or a space separated list of classes to the current element and ensures the classes are only existing once.
     *
     * @memberof Chartist.Svg
     * @param {String} names A white space separated list of class names
     * @return {Chartist.Svg} The wrapper of the current element
     */
    function addClass(names) {
      this._node.setAttribute('class',
        this.classes(this._node)
          .concat(names.trim().split(/\s+/))
          .filter(function(elem, pos, self) {
            return self.indexOf(elem) === pos;
          }).join(' ')
      );

      return this;
    }

    /**
     * Removes one or a space separated list of classes from the current element.
     *
     * @memberof Chartist.Svg
     * @param {String} names A white space separated list of class names
     * @return {Chartist.Svg} The wrapper of the current element
     */
    function removeClass(names) {
      var removedClasses = names.trim().split(/\s+/);

      this._node.setAttribute('class', this.classes(this._node).filter(function(name) {
        return removedClasses.indexOf(name) === -1;
      }).join(' '));

      return this;
    }

    /**
     * Removes all classes from the current element.
     *
     * @memberof Chartist.Svg
     * @return {Chartist.Svg} The wrapper of the current element
     */
    function removeAllClasses() {
      this._node.setAttribute('class', '');

      return this;
    }

    /**
     * Get element height with fallback to svg BoundingBox or parent container dimensions:
     * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
     *
     * @memberof Chartist.Svg
     * @return {Number} The elements height in pixels
     */
    function height() {
      return this._node.clientHeight || Math.round(this._node.getBBox().height) || this._node.parentNode.clientHeight;
    }

    /**
     * Get element width with fallback to svg BoundingBox or parent container dimensions:
     * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
     *
     * @memberof Chartist.Core
     * @return {Number} The elements width in pixels
     */
    function width() {
      return this._node.clientWidth || Math.round(this._node.getBBox().width) || this._node.parentNode.clientWidth;
    }

    /**
     * The animate function lets you animate the current element with SMIL animations. You can add animations for multiple attributes at the same time by using an animation definition object. This object should contain SMIL animation attributes. Please refer to http://www.w3.org/TR/SVG/animate.html for a detailed specification about the available animation attributes. Additionally an easing property can be passed in the animation definition object. This can be a string with a name of an easing function in `Chartist.Svg.Easing` or an array with four numbers specifying a cubic Bézier curve.
     * **An animations object could look like this:**
     * ```javascript
     * element.animate({
     *   opacity: {
     *     dur: 1000,
     *     from: 0,
     *     to: 1
     *   },
     *   x1: {
     *     dur: '1000ms',
     *     from: 100,
     *     to: 200,
     *     easing: 'easeOutQuart'
     *   },
     *   y1: {
     *     dur: '2s',
     *     from: 0,
     *     to: 100
     *   }
     * });
     * ```
     * **Automatic unit conversion**
     * For the `dur` and the `begin` animate attribute you can also omit a unit by passing a number. The number will automatically be converted to milli seconds.
     * **Guided mode**
     * The default behavior of SMIL animations with offset using the `begin` attribute is that the attribute will keep it's original value until the animation starts. Mostly this behavior is not desired as you'd like to have your element attributes already initialized with the animation `from` value even before the animation starts. Also if you don't specify `fill="freeze"` on an animate element or if you delete the animation after it's done (which is done in guided mode) the attribute will switch back to the initial value. This behavior is also not desired when performing simple one-time animations. For one-time animations you'd want to trigger animations immediately instead of relative to the document begin time. That's why in guided mode Chartist.Svg will also use the `begin` property to schedule a timeout and manually start the animation after the timeout. If you're using multiple SMIL definition objects for an attribute (in an array), guided mode will be disabled for this attribute, even if you explicitly enabled it.
     * If guided mode is enabled the following behavior is added:
     * - Before the animation starts (even when delayed with `begin`) the animated attribute will be set already to the `from` value of the animation
     * - `begin` is explicitly set to `indefinite` so it can be started manually without relying on document begin time (creation)
     * - The animate element will be forced to use `fill="freeze"`
     * - The animation will be triggered with `beginElement()` in a timeout where `begin` of the definition object is interpreted in milli seconds. If no `begin` was specified the timeout is triggered immediately.
     * - After the animation the element attribute value will be set to the `to` value of the animation
     * - The animate element is deleted from the DOM
     *
     * @memberof Chartist.Svg
     * @param {Object} animations An animations object where the property keys are the attributes you'd like to animate. The properties should be objects again that contain the SMIL animation attributes (usually begin, dur, from, and to). The property begin and dur is auto converted (see Automatic unit conversion). You can also schedule multiple animations for the same attribute by passing an Array of SMIL definition objects. Attributes that contain an array of SMIL definition objects will not be executed in guided mode.
     * @param {Boolean} guided Specify if guided mode should be activated for this animation (see Guided mode). If not otherwise specified, guided mode will be activated.
     * @param {Object} eventEmitter If specified, this event emitter will be notified when an animation starts or ends.
     * @return {Chartist.Svg} The current element where the animation was added
     */
    function animate(animations, guided, eventEmitter) {
      if(guided === undefined) {
        guided = true;
      }

      Object.keys(animations).forEach(function createAnimateForAttributes(attribute) {

        function createAnimate(animationDefinition, guided) {
          var attributeProperties = {},
            animate,
            timeout,
            easing;

          // Check if an easing is specified in the definition object and delete it from the object as it will not
          // be part of the animate element attributes.
          if(animationDefinition.easing) {
            // If already an easing Bézier curve array we take it or we lookup a easing array in the Easing object
            easing = animationDefinition.easing instanceof Array ?
              animationDefinition.easing :
              Chartist.Svg.Easing[animationDefinition.easing];
            delete animationDefinition.easing;
          }

          // If numeric dur or begin was provided we assume milli seconds
          animationDefinition.begin = Chartist.ensureUnit(animationDefinition.begin, 'ms');
          animationDefinition.dur = Chartist.ensureUnit(animationDefinition.dur, 'ms');

          if(easing) {
            animationDefinition.calcMode = 'spline';
            animationDefinition.keySplines = easing.join(' ');
            animationDefinition.keyTimes = '0;1';
          }

          // Adding "fill: freeze" if we are in guided mode and set initial attribute values
          if(guided) {
            animationDefinition.fill = 'freeze';
            // Animated property on our element should already be set to the animation from value in guided mode
            attributeProperties[attribute] = animationDefinition.from;
            this.attr(attributeProperties);

            // In guided mode we also set begin to indefinite so we can trigger the start manually and put the begin
            // which needs to be in ms aside
            timeout = Chartist.stripUnit(animationDefinition.begin || 0);
            animationDefinition.begin = 'indefinite';
          }

          animate = this.elem('animate', Chartist.extend({
            attributeName: attribute
          }, animationDefinition));

          if(guided) {
            // If guided we take the value that was put aside in timeout and trigger the animation manually with a timeout
            setTimeout(function() {
              // If beginElement fails we set the animated attribute to the end position and remove the animate element
              // This happens if the SMIL ElementTimeControl interface is not supported or any other problems occured in
              // the browser. (Currently FF 34 does not support animate elements in foreignObjects)
              try {
                animate._node.beginElement();
              } catch(err) {
                // Set animated attribute to current animated value
                attributeProperties[attribute] = animationDefinition.to;
                this.attr(attributeProperties);
                // Remove the animate element as it's no longer required
                animate.remove();
              }
            }.bind(this), timeout);
          }

          if(eventEmitter) {
            animate._node.addEventListener('beginEvent', function handleBeginEvent() {
              eventEmitter.emit('animationBegin', {
                element: this,
                animate: animate._node,
                params: animationDefinition
              });
            }.bind(this));
          }

          animate._node.addEventListener('endEvent', function handleEndEvent() {
            if(eventEmitter) {
              eventEmitter.emit('animationEnd', {
                element: this,
                animate: animate._node,
                params: animationDefinition
              });
            }

            if(guided) {
              // Set animated attribute to current animated value
              attributeProperties[attribute] = animationDefinition.to;
              this.attr(attributeProperties);
              // Remove the animate element as it's no longer required
              animate.remove();
            }
          }.bind(this));
        }

        // If current attribute is an array of definition objects we create an animate for each and disable guided mode
        if(animations[attribute] instanceof Array) {
          animations[attribute].forEach(function(animationDefinition) {
            createAnimate.bind(this)(animationDefinition, false);
          }.bind(this));
        } else {
          createAnimate.bind(this)(animations[attribute], guided);
        }

      }.bind(this));

      return this;
    }

    Chartist.Svg = Chartist.Class.extend({
      constructor: Svg,
      attr: attr,
      elem: elem,
      parent: parent,
      root: root,
      querySelector: querySelector,
      querySelectorAll: querySelectorAll,
      foreignObject: foreignObject,
      text: text,
      empty: empty,
      remove: remove,
      replace: replace,
      append: append,
      classes: classes,
      addClass: addClass,
      removeClass: removeClass,
      removeAllClasses: removeAllClasses,
      height: height,
      width: width,
      animate: animate
    });

    /**
     * This method checks for support of a given SVG feature like Extensibility, SVG-animation or the like. Check http://www.w3.org/TR/SVG11/feature for a detailed list.
     *
     * @memberof Chartist.Svg
     * @param {String} feature The SVG 1.1 feature that should be checked for support.
     * @return {Boolean} True of false if the feature is supported or not
     */
    Chartist.Svg.isSupported = function(feature) {
      return document.implementation.hasFeature('www.http://w3.org/TR/SVG11/feature#' + feature, '1.1');
    };

    /**
     * This Object contains some standard easing cubic bezier curves. Then can be used with their name in the `Chartist.Svg.animate`. You can also extend the list and use your own name in the `animate` function. Click the show code button to see the available bezier functions.
     *
     * @memberof Chartist.Svg
     */
    var easingCubicBeziers = {
      easeInSine: [0.47, 0, 0.745, 0.715],
      easeOutSine: [0.39, 0.575, 0.565, 1],
      easeInOutSine: [0.445, 0.05, 0.55, 0.95],
      easeInQuad: [0.55, 0.085, 0.68, 0.53],
      easeOutQuad: [0.25, 0.46, 0.45, 0.94],
      easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
      easeInCubic: [0.55, 0.055, 0.675, 0.19],
      easeOutCubic: [0.215, 0.61, 0.355, 1],
      easeInOutCubic: [0.645, 0.045, 0.355, 1],
      easeInQuart: [0.895, 0.03, 0.685, 0.22],
      easeOutQuart: [0.165, 0.84, 0.44, 1],
      easeInOutQuart: [0.77, 0, 0.175, 1],
      easeInQuint: [0.755, 0.05, 0.855, 0.06],
      easeOutQuint: [0.23, 1, 0.32, 1],
      easeInOutQuint: [0.86, 0, 0.07, 1],
      easeInExpo: [0.95, 0.05, 0.795, 0.035],
      easeOutExpo: [0.19, 1, 0.22, 1],
      easeInOutExpo: [1, 0, 0, 1],
      easeInCirc: [0.6, 0.04, 0.98, 0.335],
      easeOutCirc: [0.075, 0.82, 0.165, 1],
      easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
      easeInBack: [0.6, -0.28, 0.735, 0.045],
      easeOutBack: [0.175, 0.885, 0.32, 1.275],
      easeInOutBack: [0.68, -0.55, 0.265, 1.55]
    };

    Chartist.Svg.Easing = easingCubicBeziers;

    /**
     * This helper class is to wrap multiple `Chartist.Svg` elements into a list where you can call the `Chartist.Svg` functions on all elements in the list with one call. This is helpful when you'd like to perform calls with `Chartist.Svg` on multiple elements.
     * An instance of this class is also returned by `Chartist.Svg.querySelectorAll`.
     *
     * @memberof Chartist.Svg
     * @param {Array<Node>|NodeList} nodeList An Array of SVG DOM nodes or a SVG DOM NodeList (as returned by document.querySelectorAll)
     * @constructor
     */
    function SvgList(nodeList) {
      var list = this;

      this.svgElements = [];
      for(var i = 0; i < nodeList.length; i++) {
        this.svgElements.push(new Chartist.Svg(nodeList[i]));
      }

      // Add delegation methods for Chartist.Svg
      Object.keys(Chartist.Svg.prototype).filter(function(prototypeProperty) {
        return ['constructor',
            'parent',
            'querySelector',
            'querySelectorAll',
            'replace',
            'append',
            'classes',
            'height',
            'width'].indexOf(prototypeProperty) === -1;
      }).forEach(function(prototypeProperty) {
        list[prototypeProperty] = function() {
          var args = Array.prototype.slice.call(arguments, 0);
          list.svgElements.forEach(function(element) {
            Chartist.Svg.prototype[prototypeProperty].apply(element, args);
          });
          return list;
        };
      });
    }

    Chartist.Svg.List = Chartist.Class.extend({
      constructor: SvgList
    });
  }(window, document, Chartist));
  ;/**
   * Chartist SVG path module for SVG path description creation and modification.
   *
   * @module Chartist.Svg.Path
   */
  /* global Chartist */
  (function(window, document, Chartist) {
    'use strict';

    /**
     * Contains the descriptors of supported element types in a SVG path. Currently only move, line and curve are supported.
     *
     * @memberof Chartist.Svg.Path
     * @type {Object}
     */
    var elementDescriptions = {
      m: ['x', 'y'],
      l: ['x', 'y'],
      c: ['x1', 'y1', 'x2', 'y2', 'x', 'y']
    };

    /**
     * Default options for newly created SVG path objects.
     *
     * @memberof Chartist.Svg.Path
     * @type {Object}
     */
    var defaultOptions = {
      // The accuracy in digit count after the decimal point. This will be used to round numbers in the SVG path. If this option is set to false then no rounding will be performed.
      accuracy: 3
    };

    function element(command, params, pathElements, pos, relative) {
      pathElements.splice(pos, 0, Chartist.extend({
        command: relative ? command.toLowerCase() : command.toUpperCase()
      }, params));
    }

    function forEachParam(pathElements, cb) {
      pathElements.forEach(function(pathElement, pathElementIndex) {
        elementDescriptions[pathElement.command.toLowerCase()].forEach(function(paramName, paramIndex) {
          cb(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
        });
      });
    }

    /**
     * Used to construct a new path object.
     *
     * @memberof Chartist.Svg.Path
     * @param {Boolean} close If set to true then this path will be closed when stringified (with a Z at the end)
     * @param {Object} options Options object that overrides the default objects. See default options for more details.
     * @constructor
     */
    function SvgPath(close, options) {
      this.pathElements = [];
      this.pos = 0;
      this.close = close;
      this.options = Chartist.extend({}, defaultOptions, options);
    }

    /**
     * Gets or sets the current position (cursor) inside of the path. You can move around the cursor freely but limited to 0 or the count of existing elements. All modifications with element functions will insert new elements at the position of this cursor.
     *
     * @memberof Chartist.Svg.Path
     * @param {Number} [position] If a number is passed then the cursor is set to this position in the path element array.
     * @return {Chartist.Svg.Path|Number} If the position parameter was passed then the return value will be the path object for easy call chaining. If no position parameter was passed then the current position is returned.
     */
    function position(pos) {
      if(pos !== undefined) {
        this.pos = Math.max(0, Math.min(this.pathElements.length, pos));
        return this;
      } else {
        return this.pos;
      }
    }

    /**
     * Removes elements from the path starting at the current position.
     *
     * @memberof Chartist.Svg.Path
     * @param {Number} count Number of path elements that should be removed from the current position.
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function remove(count) {
      this.pathElements.splice(this.pos, count);
      return this;
    }

    /**
     * Use this function to add a new move SVG path element.
     *
     * @memberof Chartist.Svg.Path
     * @param {Number} x The x coordinate for the move element.
     * @param {Number} y The y coordinate for the move element.
     * @param {Boolean} relative If set to true the move element will be created with relative coordinates (lowercase letter)
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function move(x, y, relative) {
      element('M', {
        x: +x,
        y: +y
      }, this.pathElements, this.pos++, relative);
      return this;
    }

    /**
     * Use this function to add a new line SVG path element.
     *
     * @memberof Chartist.Svg.Path
     * @param {Number} x The x coordinate for the line element.
     * @param {Number} y The y coordinate for the line element.
     * @param {Boolean} relative If set to true the line element will be created with relative coordinates (lowercase letter)
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function line(x, y, relative) {
      element('L', {
        x: +x,
        y: +y
      }, this.pathElements, this.pos++, relative);
      return this;
    }

    /**
     * Use this function to add a new curve SVG path element.
     *
     * @memberof Chartist.Svg.Path
     * @param {Number} x1 The x coordinate for the first control point of the bezier curve.
     * @param {Number} y1 The y coordinate for the first control point of the bezier curve.
     * @param {Number} x2 The x coordinate for the second control point of the bezier curve.
     * @param {Number} y2 The y coordinate for the second control point of the bezier curve.
     * @param {Number} x The x coordinate for the target point of the curve element.
     * @param {Number} y The y coordinate for the target point of the curve element.
     * @param {Boolean} relative If set to true the curve element will be created with relative coordinates (lowercase letter)
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function curve(x1, y1, x2, y2, x, y, relative) {
      element('C', {
        x1: +x1,
        y1: +y1,
        x2: +x2,
        y2: +y2,
        x: +x,
        y: +y
      }, this.pathElements, this.pos++, relative);
      return this;
    }

    /**
     * Parses an SVG path seen in the d attribute of path elements, and inserts the parsed elements into the existing path object at the current cursor position. Any closing path indicators (Z at the end of the path) will be ignored by the parser as this is provided by the close option in the options of the path object.
     *
     * @memberof Chartist.Svg.Path
     * @param {String} path Any SVG path that contains move (m), line (l) or curve (c) components.
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function parse(path) {
      // Parsing the SVG path string into an array of arrays [['M', '10', '10'], ['L', '100', '100']]
      var chunks = path.replace(/([A-Za-z])([0-9])/g, '$1 $2')
        .replace(/([0-9])([A-Za-z])/g, '$1 $2')
        .split(/[\s,]+/)
        .reduce(function(result, element) {
          if(element.match(/[A-Za-z]/)) {
            result.push([]);
          }

          result[result.length - 1].push(element);
          return result;
        }, []);

      // If this is a closed path we remove the Z at the end because this is determined by the close option
      if(chunks[chunks.length - 1][0].toUpperCase() === 'Z') {
        chunks.pop();
      }

      // Using svgPathElementDescriptions to map raw path arrays into objects that contain the command and the parameters
      // For example {command: 'M', x: '10', y: '10'}
      var elements = chunks.map(function(chunk) {
          var command = chunk.shift(),
            description = elementDescriptions[command.toLowerCase()];

          return Chartist.extend({
            command: command
          }, description.reduce(function(result, paramName, index) {
            result[paramName] = +chunk[index];
            return result;
          }, {}));
        });

      // Preparing a splice call with the elements array as var arg params and insert the parsed elements at the current position
      var spliceArgs = [this.pos, 0];
      Array.prototype.push.apply(spliceArgs, elements);
      Array.prototype.splice.apply(this.pathElements, spliceArgs);
      // Increase the internal position by the element count
      this.pos += elements.length;

      return this;
    }

    /**
     * This function renders to current SVG path object into a final SVG string that can be used in the d attribute of SVG path elements. It uses the accuracy option to round big decimals. If the close parameter was set in the constructor of this path object then a path closing Z will be appended to the output string.
     *
     * @memberof Chartist.Svg.Path
     * @return {String}
     */
    function stringify() {
      var accuracyMultiplier = Math.pow(10, this.options.accuracy);

      return this.pathElements.reduce(function(path, pathElement) {
          var params = elementDescriptions[pathElement.command.toLowerCase()].map(function(paramName) {
            return this.options.accuracy ?
              (Math.round(pathElement[paramName] * accuracyMultiplier) / accuracyMultiplier) :
              pathElement[paramName];
          }.bind(this));

          return path + pathElement.command + params.join(',');
        }.bind(this), '') + (this.close ? 'Z' : '');
    }

    /**
     * Scales all elements in the current SVG path object. There is an individual parameter for each coordinate. Scaling will also be done for control points of curves, affecting the given coordinate.
     *
     * @memberof Chartist.Svg.Path
     * @param {Number} x The number which will be used to scale the x, x1 and x2 of all path elements.
     * @param {Number} y The number which will be used to scale the y, y1 and y2 of all path elements.
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function scale(x, y) {
      forEachParam(this.pathElements, function(pathElement, paramName) {
        pathElement[paramName] *= paramName[0] === 'x' ? x : y;
      });
      return this;
    }

    /**
     * Translates all elements in the current SVG path object. The translation is relative and there is an individual parameter for each coordinate. Translation will also be done for control points of curves, affecting the given coordinate.
     *
     * @memberof Chartist.Svg.Path
     * @param {Number} x The number which will be used to translate the x, x1 and x2 of all path elements.
     * @param {Number} y The number which will be used to translate the y, y1 and y2 of all path elements.
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function translate(x, y) {
      forEachParam(this.pathElements, function(pathElement, paramName) {
        pathElement[paramName] += paramName[0] === 'x' ? x : y;
      });
      return this;
    }

    /**
     * This function will run over all existing path elements and then loop over their attributes. The callback function will be called for every path element attribute that exists in the current path.
     * The method signature of the callback function looks like this:
     * ```javascript
     * function(pathElement, paramName, pathElementIndex, paramIndex, pathElements)
     * ```
     * If something else than undefined is returned by the callback function, this value will be used to replace the old value. This allows you to build custom transformations of path objects that can't be achieved using the basic transformation functions scale and translate.
     *
     * @memberof Chartist.Svg.Path
     * @param {Function} transformFnc The callback function for the transformation. Check the signature in the function description.
     * @return {Chartist.Svg.Path} The current path object for easy call chaining.
     */
    function transform(transformFnc) {
      forEachParam(this.pathElements, function(pathElement, paramName, pathElementIndex, paramIndex, pathElements) {
        var transformed = transformFnc(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
        if(transformed || transformed === 0) {
          pathElement[paramName] = transformed;
        }
      });
      return this;
    }

    /**
     * This function clones a whole path object with all its properties. This is a deep clone and path element objects will also be cloned.
     *
     * @memberof Chartist.Svg.Path
     * @return {Chartist.Svg.Path}
     */
    function clone() {
      var c = new Chartist.Svg.Path(this.close);
      c.pos = this.pos;
      c.pathElements = this.pathElements.slice().map(function cloneElements(pathElement) {
        return Chartist.extend({}, pathElement);
      });
      c.options = Chartist.extend({}, this.options);
      return c;
    }

    Chartist.Svg.Path = Chartist.Class.extend({
      constructor: SvgPath,
      position: position,
      remove: remove,
      move: move,
      line: line,
      curve: curve,
      scale: scale,
      translate: translate,
      transform: transform,
      parse: parse,
      stringify: stringify,
      clone: clone
    });

    Chartist.Svg.Path.elementDescriptions = elementDescriptions;
  }(window, document, Chartist));
  ;/**
   * Axis base class used to implement different axis types
   *
   * @module Chartist.Axis
   */
  /* global Chartist */
  (function (window, document, Chartist) {
    'use strict';

    var axisUnits = {
      x: {
        pos: 'x',
        len: 'width',
        dir: 'horizontal',
        rectStart: 'x1',
        rectEnd: 'x2',
        rectOffset: 'y2'
      },
      y: {
        pos: 'y',
        len: 'height',
        dir: 'vertical',
        rectStart: 'y2',
        rectEnd: 'y1',
        rectOffset: 'x1'
      }
    };

    function Axis(units, chartRect, transform, labelOffset, options) {
      this.units = units;
      this.counterUnits = units === axisUnits.x ? axisUnits.y : axisUnits.x;
      this.chartRect = chartRect;
      this.axisLength = chartRect[units.rectEnd] - chartRect[units.rectStart];
      this.gridOffset = chartRect[units.rectOffset];
      this.transform = transform;
      this.labelOffset = labelOffset;
      this.options = options;
    }

    Chartist.Axis = Chartist.Class.extend({
      constructor: Axis,
      projectValue: function(value, index, data) {
        throw new Error('Base axis can\'t be instantiated!');
      }
    });

    Chartist.Axis.units = axisUnits;

  }(window, document, Chartist));
  ;/**
   * The linear scale axis uses standard linear scale projection of values along an axis.
   *
   * @module Chartist.LinearScaleAxis
   */
  /* global Chartist */
  (function (window, document, Chartist) {
    'use strict';

    function LinearScaleAxis(axisUnit, chartRect, transform, labelOffset, options) {
      Chartist.LinearScaleAxis.super.constructor.call(this,
        axisUnit,
        chartRect,
        transform,
        labelOffset,
        options);

      this.bounds = Chartist.getBounds(this.axisLength, options.highLow, options.scaleMinSpace, options.referenceValue);
    }

    function projectValue(value) {
      return {
        pos: this.axisLength * (value - this.bounds.min) / (this.bounds.range + this.bounds.step),
        len: Chartist.projectLength(this.axisLength, this.bounds.step, this.bounds)
      };
    }

    Chartist.LinearScaleAxis = Chartist.Axis.extend({
      constructor: LinearScaleAxis,
      projectValue: projectValue
    });

  }(window, document, Chartist));
  ;/**
   * Step axis for step based charts like bar chart or step based line chart
   *
   * @module Chartist.StepAxis
   */
  /* global Chartist */
  (function (window, document, Chartist) {
    'use strict';

    function StepAxis(axisUnit, chartRect, transform, labelOffset, options) {
      Chartist.StepAxis.super.constructor.call(this,
        axisUnit,
        chartRect,
        transform,
        labelOffset,
        options);

      this.stepLength = this.axisLength / (options.stepCount - (options.stretch ? 1 : 0));
    }

    function projectValue(value, index) {
      return {
        pos: this.stepLength * index,
        len: this.stepLength
      };
    }

    Chartist.StepAxis = Chartist.Axis.extend({
      constructor: StepAxis,
      projectValue: projectValue
    });

  }(window, document, Chartist));
  ;/**
   * The Chartist line chart can be used to draw Line or Scatter charts. If used in the browser you can access the global `Chartist` namespace where you find the `Line` function as a main entry point.
   *
   * For examples on how to use the line chart please check the examples of the `Chartist.Line` method.
   *
   * @module Chartist.Line
   */
  /* global Chartist */
  (function(window, document, Chartist){
    'use strict';

    /**
     * Default options in line charts. Expand the code view to see a detailed list of options with comments.
     *
     * @memberof Chartist.Line
     */
    var defaultOptions = {
      // Options for X-Axis
      axisX: {
        // The offset of the labels to the chart area
        offset: 30,
        // Allows you to correct label positioning on this axis by positive or negative x and y offset.
        labelOffset: {
          x: 0,
          y: 0
        },
        // If labels should be shown or not
        showLabel: true,
        // If the axis grid should be drawn or not
        showGrid: true,
        // Interpolation function that allows you to intercept the value from the axis label
        labelInterpolationFnc: Chartist.noop
      },
      // Options for Y-Axis
      axisY: {
        // The offset of the labels to the chart area
        offset: 40,
        // Allows you to correct label positioning on this axis by positive or negative x and y offset.
        labelOffset: {
          x: 0,
          y: 0
        },
        // If labels should be shown or not
        showLabel: true,
        // If the axis grid should be drawn or not
        showGrid: true,
        // Interpolation function that allows you to intercept the value from the axis label
        labelInterpolationFnc: Chartist.noop,
        // This value specifies the minimum height in pixel of the scale steps
        scaleMinSpace: 20
      },
      // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
      width: undefined,
      // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
      height: undefined,
      // If the line should be drawn or not
      showLine: true,
      // If dots should be drawn or not
      showPoint: true,
      // If the line chart should draw an area
      showArea: false,
      // The base for the area chart that will be used to close the area shape (is normally 0)
      areaBase: 0,
      // Specify if the lines should be smoothed. This value can be true or false where true will result in smoothing using the default smoothing interpolation function Chartist.Interpolation.cardinal and false results in Chartist.Interpolation.none. You can also choose other smoothing / interpolation functions available in the Chartist.Interpolation module, or write your own interpolation function. Check the examples for a brief description.
      lineSmooth: true,
      // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
      low: undefined,
      // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
      high: undefined,
      // Padding of the chart drawing area to the container element and labels
      chartPadding: 5,
      // When set to true, the last grid line on the x-axis is not drawn and the chart elements will expand to the full available width of the chart. For the last label to be drawn correctly you might need to add chart padding or offset the last label with a draw event handler.
      fullWidth: false,
      // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
      reverseData: false,
      // Override the class names that get used to generate the SVG structure of the chart
      classNames: {
        chart: 'ct-chart-line',
        label: 'ct-label',
        labelGroup: 'ct-labels',
        series: 'ct-series',
        line: 'ct-line',
        point: 'ct-point',
        area: 'ct-area',
        grid: 'ct-grid',
        gridGroup: 'ct-grids',
        vertical: 'ct-vertical',
        horizontal: 'ct-horizontal'
      }
    };

    /**
     * Creates a new chart
     *
     */
    function createChart(options) {
      var seriesGroups = [],
        normalizedData = Chartist.normalizeDataArray(Chartist.getDataArray(this.data, options.reverseData), this.data.labels.length);

      // Create new svg object
      this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);

      var chartRect = Chartist.createChartRect(this.svg, options);

      var highLow = Chartist.getHighLow(normalizedData);
      // Overrides of high / low from settings
      highLow.high = +options.high || (options.high === 0 ? 0 : highLow.high);
      highLow.low = +options.low || (options.low === 0 ? 0 : highLow.low);

      var axisX = new Chartist.StepAxis(
        Chartist.Axis.units.x,
        chartRect,
        function xAxisTransform(projectedValue) {
          projectedValue.pos = chartRect.x1 + projectedValue.pos;
          return projectedValue;
        },
        {
          x: options.axisX.labelOffset.x,
          y: chartRect.y1 + options.axisX.labelOffset.y + (this.supportsForeignObject ? 5 : 20)
        },
        {
          stepCount: this.data.labels.length,
          stretch: options.fullWidth
        }
      );

      var axisY = new Chartist.LinearScaleAxis(
        Chartist.Axis.units.y,
        chartRect,
        function yAxisTransform(projectedValue) {
          projectedValue.pos = chartRect.y1 - projectedValue.pos;
          return projectedValue;
        },
        {
          x: options.chartPadding + options.axisY.labelOffset.x + (this.supportsForeignObject ? -10 : 0),
          y: options.axisY.labelOffset.y + (this.supportsForeignObject ? -15 : 0)
        },
        {
          highLow: highLow,
          scaleMinSpace: options.axisY.scaleMinSpace
        }
      );

      // Start drawing
      var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup),
        gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);

      Chartist.createAxis(
        axisX,
        this.data.labels,
        chartRect,
        gridGroup,
        labelGroup,
        this.supportsForeignObject,
        options,
        this.eventEmitter
      );

      Chartist.createAxis(
        axisY,
        axisY.bounds.values,
        chartRect,
        gridGroup,
        labelGroup,
        this.supportsForeignObject,
        options,
        this.eventEmitter
      );

      // Draw the series
      this.data.series.forEach(function(series, seriesIndex) {
        seriesGroups[seriesIndex] = this.svg.elem('g');

        // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
        seriesGroups[seriesIndex].attr({
          'series-name': series.name,
          'meta': Chartist.serialize(series.meta)
        }, Chartist.xmlNs.uri);

        // Use series class from series data or if not set generate one
        seriesGroups[seriesIndex].addClass([
          options.classNames.series,
          (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
        ].join(' '));

        var pathCoordinates = [];

        normalizedData[seriesIndex].forEach(function(value, valueIndex) {
          var p = {
            x: chartRect.x1 + axisX.projectValue(value, valueIndex,  normalizedData[seriesIndex]).pos,
            y: chartRect.y1 - axisY.projectValue(value, valueIndex,  normalizedData[seriesIndex]).pos
          };
          pathCoordinates.push(p.x, p.y);

          //If we should show points we need to create them now to avoid secondary loop
          // Small offset for Firefox to render squares correctly
          if (options.showPoint) {
            var point = seriesGroups[seriesIndex].elem('line', {
              x1: p.x,
              y1: p.y,
              x2: p.x + 0.01,
              y2: p.y
            }, options.classNames.point).attr({
              'value': value,
              'meta': Chartist.getMetaData(series, valueIndex)
            }, Chartist.xmlNs.uri);

            this.eventEmitter.emit('draw', {
              type: 'point',
              value: value,
              index: valueIndex,
              group: seriesGroups[seriesIndex],
              element: point,
              x: p.x,
              y: p.y
            });
          }
        }.bind(this));

        // TODO: Nicer handling of conditions, maybe composition?
        if (options.showLine || options.showArea) {
          var smoothing = typeof options.lineSmooth === 'function' ?
            options.lineSmooth : (options.lineSmooth ? Chartist.Interpolation.cardinal() : Chartist.Interpolation.none()),
            path = smoothing(pathCoordinates);

          if(options.showLine) {
            var line = seriesGroups[seriesIndex].elem('path', {
              d: path.stringify()
            }, options.classNames.line, true).attr({
              'values': normalizedData[seriesIndex]
            }, Chartist.xmlNs.uri);

            this.eventEmitter.emit('draw', {
              type: 'line',
              values: normalizedData[seriesIndex],
              path: path.clone(),
              chartRect: chartRect,
              index: seriesIndex,
              group: seriesGroups[seriesIndex],
              element: line
            });
          }

          if(options.showArea) {
            // If areaBase is outside the chart area (< low or > high) we need to set it respectively so that
            // the area is not drawn outside the chart area.
            var areaBase = Math.max(Math.min(options.areaBase, axisY.bounds.max), axisY.bounds.min);

            // We project the areaBase value into screen coordinates
            var areaBaseProjected = chartRect.y1 - axisY.projectValue(areaBase).pos;

            // Clone original path and splice our new area path to add the missing path elements to close the area shape
            var areaPath = path.clone();
            // Modify line path and add missing elements for area
            areaPath.position(0)
              .remove(1)
              .move(chartRect.x1, areaBaseProjected)
              .line(pathCoordinates[0], pathCoordinates[1])
              .position(areaPath.pathElements.length)
              .line(pathCoordinates[pathCoordinates.length - 2], areaBaseProjected);

            // Create the new path for the area shape with the area class from the options
            var area = seriesGroups[seriesIndex].elem('path', {
              d: areaPath.stringify()
            }, options.classNames.area, true).attr({
              'values': normalizedData[seriesIndex]
            }, Chartist.xmlNs.uri);

            this.eventEmitter.emit('draw', {
              type: 'area',
              values: normalizedData[seriesIndex],
              path: areaPath.clone(),
              chartRect: chartRect,
              index: seriesIndex,
              group: seriesGroups[seriesIndex],
              element: area
            });
          }
        }
      }.bind(this));

      this.eventEmitter.emit('created', {
        bounds: axisY.bounds,
        chartRect: chartRect,
        svg: this.svg,
        options: options
      });
    }

    /**
     * This method creates a new line chart.
     *
     * @memberof Chartist.Line
     * @param {String|Node} query A selector query string or directly a DOM element
     * @param {Object} data The data object that needs to consist of a labels and a series array
     * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
     * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
     * @return {Object} An object which exposes the API for the created chart
     *
     * @example
     * // Create a simple line chart
     * var data = {
     *   // A labels array that can contain any sort of values
     *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
     *   // Our series array that contains series objects or in this case series data arrays
     *   series: [
     *     [5, 2, 4, 2, 0]
     *   ]
     * };
     *
     * // As options we currently only set a static size of 300x200 px
     * var options = {
     *   width: '300px',
     *   height: '200px'
     * };
     *
     * // In the global name space Chartist we call the Line function to initialize a line chart. As a first parameter we pass in a selector where we would like to get our chart created. Second parameter is the actual data object and as a third parameter we pass in our options
     * new Chartist.Line('.ct-chart', data, options);
     *
     * @example
     * // Use specific interpolation function with configuration from the Chartist.Interpolation module
     *
     * var chart = new Chartist.Line('.ct-chart', {
     *   labels: [1, 2, 3, 4, 5],
     *   series: [
     *     [1, 1, 8, 1, 7]
     *   ]
     * }, {
     *   lineSmooth: Chartist.Interpolation.cardinal({
     *     tension: 0.2
     *   })
     * });
     *
     * @example
     * // Create a line chart with responsive options
     *
     * var data = {
     *   // A labels array that can contain any sort of values
     *   labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
     *   // Our series array that contains series objects or in this case series data arrays
     *   series: [
     *     [5, 2, 4, 2, 0]
     *   ]
     * };
     *
     * // In adition to the regular options we specify responsive option overrides that will override the default configutation based on the matching media queries.
     * var responsiveOptions = [
     *   ['screen and (min-width: 641px) and (max-width: 1024px)', {
     *     showPoint: false,
     *     axisX: {
     *       labelInterpolationFnc: function(value) {
     *         // Will return Mon, Tue, Wed etc. on medium screens
     *         return value.slice(0, 3);
     *       }
     *     }
     *   }],
     *   ['screen and (max-width: 640px)', {
     *     showLine: false,
     *     axisX: {
     *       labelInterpolationFnc: function(value) {
     *         // Will return M, T, W etc. on small screens
     *         return value[0];
     *       }
     *     }
     *   }]
     * ];
     *
     * new Chartist.Line('.ct-chart', data, null, responsiveOptions);
     *
     */
    function Line(query, data, options, responsiveOptions) {
      Chartist.Line.super.constructor.call(this,
        query,
        data,
        Chartist.extend({}, defaultOptions, options),
        responsiveOptions);
    }

    // Creating line chart type in Chartist namespace
    Chartist.Line = Chartist.Base.extend({
      constructor: Line,
      createChart: createChart
    });

  }(window, document, Chartist));
  ;/**
   * The bar chart module of Chartist that can be used to draw unipolar or bipolar bar and grouped bar charts.
   *
   * @module Chartist.Bar
   */
  /* global Chartist */
  (function(window, document, Chartist){
    'use strict';

    /**
     * Default options in bar charts. Expand the code view to see a detailed list of options with comments.
     *
     * @memberof Chartist.Bar
     */
    var defaultOptions = {
      // Options for X-Axis
      axisX: {
        // The offset of the chart drawing area to the border of the container
        offset: 30,
        // Allows you to correct label positioning on this axis by positive or negative x and y offset.
        labelOffset: {
          x: 0,
          y: 0
        },
        // If labels should be shown or not
        showLabel: true,
        // If the axis grid should be drawn or not
        showGrid: true,
        // Interpolation function that allows you to intercept the value from the axis label
        labelInterpolationFnc: Chartist.noop,
        // This value specifies the minimum width in pixel of the scale steps
        scaleMinSpace: 40
      },
      // Options for Y-Axis
      axisY: {
        // The offset of the chart drawing area to the border of the container
        offset: 40,
        // Allows you to correct label positioning on this axis by positive or negative x and y offset.
        labelOffset: {
          x: 0,
          y: 0
        },
        // If labels should be shown or not
        showLabel: true,
        // If the axis grid should be drawn or not
        showGrid: true,
        // Interpolation function that allows you to intercept the value from the axis label
        labelInterpolationFnc: Chartist.noop,
        // This value specifies the minimum height in pixel of the scale steps
        scaleMinSpace: 20
      },
      // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
      width: undefined,
      // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
      height: undefined,
      // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
      high: undefined,
      // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
      low: undefined,
      // Padding of the chart drawing area to the container element and labels
      chartPadding: 5,
      // Specify the distance in pixel of bars in a group
      seriesBarDistance: 15,
      // If set to true this property will cause the series bars to be stacked and form a total for each series point. This will also influence the y-axis and the overall bounds of the chart. In stacked mode the seriesBarDistance property will have no effect.
      stackBars: false,
      // Inverts the axes of the bar chart in order to draw a horizontal bar chart. Be aware that you also need to invert your axis settings as the Y Axis will now display the labels and the X Axis the values.
      horizontalBars: false,
      // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
      reverseData: false,
      // Override the class names that get used to generate the SVG structure of the chart
      classNames: {
        chart: 'ct-chart-bar',
        label: 'ct-label',
        labelGroup: 'ct-labels',
        series: 'ct-series',
        bar: 'ct-bar',
        grid: 'ct-grid',
        gridGroup: 'ct-grids',
        vertical: 'ct-vertical',
        horizontal: 'ct-horizontal'
      }
    };

    /**
     * Creates a new chart
     *
     */
    function createChart(options) {
      var seriesGroups = [],
        normalizedData = Chartist.normalizeDataArray(Chartist.getDataArray(this.data, options.reverseData), this.data.labels.length),
        highLow;

      // Create new svg element
      this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);

      if(options.stackBars) {
        // If stacked bars we need to calculate the high low from stacked values from each series
        var serialSums = Chartist.serialMap(normalizedData, function serialSums() {
          return Array.prototype.slice.call(arguments).reduce(Chartist.sum, 0);
        });

        highLow = Chartist.getHighLow([serialSums]);
      } else {
        highLow = Chartist.getHighLow(normalizedData);
      }
      // Overrides of high / low from settings
      highLow.high = +options.high || (options.high === 0 ? 0 : highLow.high);
      highLow.low = +options.low || (options.low === 0 ? 0 : highLow.low);

      var chartRect = Chartist.createChartRect(this.svg, options);

      var valueAxis,
        labelAxis;

      if(options.horizontalBars) {
        labelAxis = new Chartist.StepAxis(
          Chartist.Axis.units.y,
          chartRect,
          function timeAxisTransform(projectedValue) {
            projectedValue.pos = chartRect.y1 - projectedValue.pos;
            return projectedValue;
          },
          {
            x: options.chartPadding + options.axisY.labelOffset.x + (this.supportsForeignObject ? -10 : 0),
            y: options.axisY.labelOffset.y - chartRect.height() / this.data.labels.length
          },
          {
            stepCount: this.data.labels.length,
            stretch: options.fullHeight
          }
        );

        valueAxis = new Chartist.LinearScaleAxis(
          Chartist.Axis.units.x,
          chartRect,
          function valueAxisTransform(projectedValue) {
            projectedValue.pos = chartRect.x1 + projectedValue.pos;
            return projectedValue;
          },
          {
            x: options.axisX.labelOffset.x,
            y: chartRect.y1 + options.axisX.labelOffset.y + (this.supportsForeignObject ? 5 : 20)
          },
          {
            highLow: highLow,
            scaleMinSpace: options.axisX.scaleMinSpace,
            referenceValue: 0
          }
        );
      } else {
        labelAxis = new Chartist.StepAxis(
          Chartist.Axis.units.x,
          chartRect,
          function timeAxisTransform(projectedValue) {
            projectedValue.pos = chartRect.x1 + projectedValue.pos;
            return projectedValue;
          },
          {
            x: options.axisX.labelOffset.x,
            y: chartRect.y1 + options.axisX.labelOffset.y + (this.supportsForeignObject ? 5 : 20)
          },
          {
            stepCount: this.data.labels.length
          }
        );

        valueAxis = new Chartist.LinearScaleAxis(
          Chartist.Axis.units.y,
          chartRect,
          function valueAxisTransform(projectedValue) {
            projectedValue.pos = chartRect.y1 - projectedValue.pos;
            return projectedValue;
          },
          {
            x: options.chartPadding + options.axisY.labelOffset.x + (this.supportsForeignObject ? -10 : 0),
            y: options.axisY.labelOffset.y + (this.supportsForeignObject ? -15 : 0)
          },
          {
            highLow: highLow,
            scaleMinSpace: options.axisY.scaleMinSpace,
            referenceValue: 0
          }
        );
      }

      // Start drawing
      var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup),
        gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup),
        // Projected 0 point
        zeroPoint = options.horizontalBars ? (chartRect.x1 + valueAxis.projectValue(0).pos) : (chartRect.y1 - valueAxis.projectValue(0).pos),
        // Used to track the screen coordinates of stacked bars
        stackedBarValues = [];

      Chartist.createAxis(
        labelAxis,
        this.data.labels,
        chartRect,
        gridGroup,
        labelGroup,
        this.supportsForeignObject,
        options,
        this.eventEmitter
      );

      Chartist.createAxis(
        valueAxis,
        valueAxis.bounds.values,
        chartRect,
        gridGroup,
        labelGroup,
        this.supportsForeignObject,
        options,
        this.eventEmitter
      );

      // Draw the series
      this.data.series.forEach(function(series, seriesIndex) {
        // Calculating bi-polar value of index for seriesOffset. For i = 0..4 biPol will be -1.5, -0.5, 0.5, 1.5 etc.
        var biPol = seriesIndex - (this.data.series.length - 1) / 2,
        // Half of the period width between vertical grid lines used to position bars
          periodHalfLength = chartRect[labelAxis.units.len]() / normalizedData[seriesIndex].length / 2;

        seriesGroups[seriesIndex] = this.svg.elem('g');

        // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
        seriesGroups[seriesIndex].attr({
          'series-name': series.name,
          'meta': Chartist.serialize(series.meta)
        }, Chartist.xmlNs.uri);

        // Use series class from series data or if not set generate one
        seriesGroups[seriesIndex].addClass([
          options.classNames.series,
          (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
        ].join(' '));

        normalizedData[seriesIndex].forEach(function(value, valueIndex) {
          var projected = {
              x: chartRect.x1 + (options.horizontalBars ? valueAxis : labelAxis).projectValue(value, valueIndex, normalizedData[seriesIndex]).pos,
              y: chartRect.y1 - (options.horizontalBars ? labelAxis : valueAxis).projectValue(value, valueIndex, normalizedData[seriesIndex]).pos
            },
            bar,
            previousStack;

          // Offset to center bar between grid lines
          projected[labelAxis.units.pos] += periodHalfLength * (options.horizontalBars ? -1 : 1);
          // Using bi-polar offset for multiple series if no stacked bars are used
          projected[labelAxis.units.pos] += options.stackBars ? 0 : biPol * options.seriesBarDistance * (options.horizontalBars ? -1 : 1);

          // Enter value in stacked bar values used to remember previous screen value for stacking up bars
          previousStack = stackedBarValues[valueIndex] || zeroPoint;
          stackedBarValues[valueIndex] = previousStack - (zeroPoint - projected[labelAxis.counterUnits.pos]);

          var positions = {};
          positions[labelAxis.units.pos + '1'] = projected[labelAxis.units.pos];
          positions[labelAxis.units.pos + '2'] = projected[labelAxis.units.pos];
          // If bars are stacked we use the stackedBarValues reference and otherwise base all bars off the zero line
          positions[labelAxis.counterUnits.pos + '1'] = options.stackBars ? previousStack : zeroPoint;
          positions[labelAxis.counterUnits.pos + '2'] = options.stackBars ? stackedBarValues[valueIndex] : projected[labelAxis.counterUnits.pos];

          bar = seriesGroups[seriesIndex].elem('line', positions, options.classNames.bar).attr({
            'value': value,
            'meta': Chartist.getMetaData(series, valueIndex)
          }, Chartist.xmlNs.uri);

          this.eventEmitter.emit('draw', Chartist.extend({
            type: 'bar',
            value: value,
            index: valueIndex,
            chartRect: chartRect,
            group: seriesGroups[seriesIndex],
            element: bar
          }, positions));
        }.bind(this));
      }.bind(this));

      this.eventEmitter.emit('created', {
        bounds: valueAxis.bounds,
        chartRect: chartRect,
        svg: this.svg,
        options: options
      });
    }

    /**
     * This method creates a new bar chart and returns API object that you can use for later changes.
     *
     * @memberof Chartist.Bar
     * @param {String|Node} query A selector query string or directly a DOM element
     * @param {Object} data The data object that needs to consist of a labels and a series array
     * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
     * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
     * @return {Object} An object which exposes the API for the created chart
     *
     * @example
     * // Create a simple bar chart
     * var data = {
     *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
     *   series: [
     *     [5, 2, 4, 2, 0]
     *   ]
     * };
     *
     * // In the global name space Chartist we call the Bar function to initialize a bar chart. As a first parameter we pass in a selector where we would like to get our chart created and as a second parameter we pass our data object.
     * new Chartist.Bar('.ct-chart', data);
     *
     * @example
     * // This example creates a bipolar grouped bar chart where the boundaries are limitted to -10 and 10
     * new Chartist.Bar('.ct-chart', {
     *   labels: [1, 2, 3, 4, 5, 6, 7],
     *   series: [
     *     [1, 3, 2, -5, -3, 1, -6],
     *     [-5, -2, -4, -1, 2, -3, 1]
     *   ]
     * }, {
     *   seriesBarDistance: 12,
     *   low: -10,
     *   high: 10
     * });
     *
     */
    function Bar(query, data, options, responsiveOptions) {
      Chartist.Bar.super.constructor.call(this,
        query,
        data,
        Chartist.extend({}, defaultOptions, options),
        responsiveOptions);
    }

    // Creating bar chart type in Chartist namespace
    Chartist.Bar = Chartist.Base.extend({
      constructor: Bar,
      createChart: createChart
    });

  }(window, document, Chartist));
  ;/**
   * The pie chart module of Chartist that can be used to draw pie, donut or gauge charts
   *
   * @module Chartist.Pie
   */
  /* global Chartist */
  (function(window, document, Chartist) {
    'use strict';

    /**
     * Default options in line charts. Expand the code view to see a detailed list of options with comments.
     *
     * @memberof Chartist.Pie
     */
    var defaultOptions = {
      // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
      width: undefined,
      // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
      height: undefined,
      // Padding of the chart drawing area to the container element and labels
      chartPadding: 5,
      // Override the class names that get used to generate the SVG structure of the chart
      classNames: {
        chart: 'ct-chart-pie',
        series: 'ct-series',
        slice: 'ct-slice',
        donut: 'ct-donut',
        label: 'ct-label'
      },
      // The start angle of the pie chart in degrees where 0 points north. A higher value offsets the start angle clockwise.
      startAngle: 0,
      // An optional total you can specify. By specifying a total value, the sum of the values in the series must be this total in order to draw a full pie. You can use this parameter to draw only parts of a pie or gauge charts.
      total: undefined,
      // If specified the donut CSS classes will be used and strokes will be drawn instead of pie slices.
      donut: false,
      // Specify the donut stroke width, currently done in javascript for convenience. May move to CSS styles in the future.
      donutWidth: 60,
      // If a label should be shown or not
      showLabel: true,
      // Label position offset from the standard position which is half distance of the radius. This value can be either positive or negative. Positive values will position the label away from the center.
      labelOffset: 0,
      // An interpolation function for the label value
      labelInterpolationFnc: Chartist.noop,
      // Label direction can be 'neutral', 'explode' or 'implode'. The labels anchor will be positioned based on those settings as well as the fact if the labels are on the right or left side of the center of the chart. Usually explode is useful when labels are positioned far away from the center.
      labelDirection: 'neutral',
      // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
      reverseData: false
    };

    /**
     * Determines SVG anchor position based on direction and center parameter
     *
     * @param center
     * @param label
     * @param direction
     * @return {string}
     */
    function determineAnchorPosition(center, label, direction) {
      var toTheRight = label.x > center.x;

      if(toTheRight && direction === 'explode' ||
        !toTheRight && direction === 'implode') {
        return 'start';
      } else if(toTheRight && direction === 'implode' ||
        !toTheRight && direction === 'explode') {
        return 'end';
      } else {
        return 'middle';
      }
    }

    /**
     * Creates the pie chart
     *
     * @param options
     */
    function createChart(options) {
      var seriesGroups = [],
        chartRect,
        radius,
        labelRadius,
        totalDataSum,
        startAngle = options.startAngle,
        dataArray = Chartist.getDataArray(this.data, options.reverseData);

      // Create SVG.js draw
      this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);
      // Calculate charting rect
      chartRect = Chartist.createChartRect(this.svg, options, 0, 0);
      // Get biggest circle radius possible within chartRect
      radius = Math.min(chartRect.width() / 2, chartRect.height() / 2);
      // Calculate total of all series to get reference value or use total reference from optional options
      totalDataSum = options.total || dataArray.reduce(function(previousValue, currentValue) {
        return previousValue + currentValue;
      }, 0);

      // If this is a donut chart we need to adjust our radius to enable strokes to be drawn inside
      // Unfortunately this is not possible with the current SVG Spec
      // See this proposal for more details: http://lists.w3.org/Archives/Public/www-svg/2003Oct/0000.html
      radius -= options.donut ? options.donutWidth / 2  : 0;

      // If a donut chart then the label position is at the radius, if regular pie chart it's half of the radius
      // see https://github.com/gionkunz/chartist-js/issues/21
      labelRadius = options.donut ? radius : radius / 2;
      // Add the offset to the labelRadius where a negative offset means closed to the center of the chart
      labelRadius += options.labelOffset;

      // Calculate end angle based on total sum and current data value and offset with padding
      var center = {
        x: chartRect.x1 + chartRect.width() / 2,
        y: chartRect.y2 + chartRect.height() / 2
      };

      // Check if there is only one non-zero value in the series array.
      var hasSingleValInSeries = this.data.series.filter(function(val) {
        return val !== 0;
      }).length === 1;

      // Draw the series
      // initialize series groups
      for (var i = 0; i < this.data.series.length; i++) {
        seriesGroups[i] = this.svg.elem('g', null, null, true);

        // If the series is an object and contains a name we add a custom attribute
        if(this.data.series[i].name) {
          seriesGroups[i].attr({
            'series-name': this.data.series[i].name,
            'meta': Chartist.serialize(this.data.series[i].meta)
          }, Chartist.xmlNs.uri);
        }

        // Use series class from series data or if not set generate one
        seriesGroups[i].addClass([
          options.classNames.series,
          (this.data.series[i].className || options.classNames.series + '-' + Chartist.alphaNumerate(i))
        ].join(' '));

        var endAngle = startAngle + dataArray[i] / totalDataSum * 360;
        // If we need to draw the arc for all 360 degrees we need to add a hack where we close the circle
        // with Z and use 359.99 degrees
        if(endAngle - startAngle === 360) {
          endAngle -= 0.01;
        }

        var start = Chartist.polarToCartesian(center.x, center.y, radius, startAngle - (i === 0 || hasSingleValInSeries ? 0 : 0.2)),
          end = Chartist.polarToCartesian(center.x, center.y, radius, endAngle),
          arcSweep = endAngle - startAngle <= 180 ? '0' : '1',
          d = [
            // Start at the end point from the cartesian coordinates
            'M', end.x, end.y,
            // Draw arc
            'A', radius, radius, 0, arcSweep, 0, start.x, start.y
          ];

        // If regular pie chart (no donut) we add a line to the center of the circle for completing the pie
        if(options.donut === false) {
          d.push('L', center.x, center.y);
        }

        // Create the SVG path
        // If this is a donut chart we add the donut class, otherwise just a regular slice
        var path = seriesGroups[i].elem('path', {
          d: d.join(' ')
        }, options.classNames.slice + (options.donut ? ' ' + options.classNames.donut : ''));

        // Adding the pie series value to the path
        path.attr({
          'value': dataArray[i]
        }, Chartist.xmlNs.uri);

        // If this is a donut, we add the stroke-width as style attribute
        if(options.donut === true) {
          path.attr({
            'style': 'stroke-width: ' + (+options.donutWidth) + 'px'
          });
        }

        // Fire off draw event
        this.eventEmitter.emit('draw', {
          type: 'slice',
          value: dataArray[i],
          totalDataSum: totalDataSum,
          index: i,
          group: seriesGroups[i],
          element: path,
          center: center,
          radius: radius,
          startAngle: startAngle,
          endAngle: endAngle
        });

        // If we need to show labels we need to add the label for this slice now
        if(options.showLabel) {
          // Position at the labelRadius distance from center and between start and end angle
          var labelPosition = Chartist.polarToCartesian(center.x, center.y, labelRadius, startAngle + (endAngle - startAngle) / 2),
            interpolatedValue = options.labelInterpolationFnc(this.data.labels ? this.data.labels[i] : dataArray[i], i);

          var labelElement = seriesGroups[i].elem('text', {
            dx: labelPosition.x,
            dy: labelPosition.y,
            'text-anchor': determineAnchorPosition(center, labelPosition, options.labelDirection)
          }, options.classNames.label).text('' + interpolatedValue);

          // Fire off draw event
          this.eventEmitter.emit('draw', {
            type: 'label',
            index: i,
            group: seriesGroups[i],
            element: labelElement,
            text: '' + interpolatedValue,
            x: labelPosition.x,
            y: labelPosition.y
          });
        }

        // Set next startAngle to current endAngle. Use slight offset so there are no transparent hairline issues
        // (except for last slice)
        startAngle = endAngle;
      }

      this.eventEmitter.emit('created', {
        chartRect: chartRect,
        svg: this.svg,
        options: options
      });
    }

    /**
     * This method creates a new pie chart and returns an object that can be used to redraw the chart.
     *
     * @memberof Chartist.Pie
     * @param {String|Node} query A selector query string or directly a DOM element
     * @param {Object} data The data object in the pie chart needs to have a series property with a one dimensional data array. The values will be normalized against each other and don't necessarily need to be in percentage. The series property can also be an array of objects that contain a data property with the value and a className property to override the CSS class name for the series group.
     * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
     * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
     * @return {Object} An object with a version and an update method to manually redraw the chart
     *
     * @example
     * // Simple pie chart example with four series
     * new Chartist.Pie('.ct-chart', {
     *   series: [10, 2, 4, 3]
     * });
     *
     * @example
     * // Drawing a donut chart
     * new Chartist.Pie('.ct-chart', {
     *   series: [10, 2, 4, 3]
     * }, {
     *   donut: true
     * });
     *
     * @example
     * // Using donut, startAngle and total to draw a gauge chart
     * new Chartist.Pie('.ct-chart', {
     *   series: [20, 10, 30, 40]
     * }, {
     *   donut: true,
     *   donutWidth: 20,
     *   startAngle: 270,
     *   total: 200
     * });
     *
     * @example
     * // Drawing a pie chart with padding and labels that are outside the pie
     * new Chartist.Pie('.ct-chart', {
     *   series: [20, 10, 30, 40]
     * }, {
     *   chartPadding: 30,
     *   labelOffset: 50,
     *   labelDirection: 'explode'
     * });
     *
     * @example
     * // Overriding the class names for individual series
     * new Chartist.Pie('.ct-chart', {
     *   series: [{
     *     data: 20,
     *     className: 'my-custom-class-one'
     *   }, {
     *     data: 10,
     *     className: 'my-custom-class-two'
     *   }, {
     *     data: 70,
     *     className: 'my-custom-class-three'
     *   }]
     * });
     */
    function Pie(query, data, options, responsiveOptions) {
      Chartist.Pie.super.constructor.call(this,
        query,
        data,
        Chartist.extend({}, defaultOptions, options),
        responsiveOptions);
    }

    // Creating pie chart type in Chartist namespace
    Chartist.Pie = Chartist.Base.extend({
      constructor: Pie,
      createChart: createChart,
      determineAnchorPosition: determineAnchorPosition
    });

  }(window, document, Chartist));

  return Chartist;

}));

},{}],3:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.req.method !='HEAD' 
     ? this.xhr.responseText 
     : null;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self); 
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
    }

    self.callback(err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":4,"reduce":5}],4:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],5:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS96enRvcDQyMC9EZXZlbG9wbWVudC9jaGFydGluZy1kZW1vL2NsaWVudC9zY3JpcHRzL21haW4uanMiLCJub2RlX21vZHVsZXMvY2hhcnRpc3QvZGlzdC9jaGFydGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9jbGllbnQuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvcmVkdWNlLWNvbXBvbmVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQztBQUNiLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkM7QUFDQTs7QUFFQSxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksRUFBRTtBQUM5QyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTs7UUFFVCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1lBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFDdkIsTUFBTSxFQUFFO2dCQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRztnQkFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO2FBQ2hCO1NBQ0osRUFBRTtZQUNDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsS0FBSyxFQUFFO2dCQUNILHFCQUFxQixFQUFFLFNBQVMsS0FBSyxFQUFFO29CQUNuQyxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUM7aUJBQ3ZCO2FBQ0o7U0FDSixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLElBQUksRUFBRTtZQUN6QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFO2dCQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDZCxLQUFLLEVBQUUsbUJBQW1CO2lCQUM3QixDQUFDLENBQUM7YUFDTjtTQUNKLENBQUMsQ0FBQztLQUNOO0FBQ0wsQ0FBQyxDQUFDLENBQUM7O0FBRUg7OztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzF5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6akNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBDaGFydGlzdCA9IHJlcXVpcmUoJ2NoYXJ0aXN0Jyk7XG52YXIgc3VwZXJBZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxuXG5cbnN1cGVyQWdlbnQuZ2V0KCcvZ2V0dGVtcCcpLmVuZChmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEub2spIHtcblxuICAgICAgICBuZXcgQ2hhcnRpc3QuQmFyKCcuY3QtY2hhcnQnLCB7XG4gICAgICAgICAgICBsYWJlbHM6IGRhdGEuYm9keS5kYXRlcyxcbiAgICAgICAgICAgIHNlcmllczogW1xuICAgICAgICAgICAgICAgIGRhdGEuYm9keS5tYXgsXG4gICAgICAgICAgICAgICAgZGF0YS5ib2R5LmF2ZyxcbiAgICAgICAgICAgICAgICBkYXRhLmJvZHkubWluXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHN0YWNrQmFyczogdHJ1ZSxcbiAgICAgICAgICAgIGF4aXNZOiB7XG4gICAgICAgICAgICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyAnIGMnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkub24oJ2RyYXcnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnYmFyJykge1xuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdzdHJva2Utd2lkdGg6IDVweCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWRISmhibk5tYjNKdFpXUXVhbk1pTENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDNwNmRHOXdOREl3TDBSbGRtVnNiM0J0Wlc1MEwyTm9ZWEowYVc1bkxXUmxiVzh2WTJ4cFpXNTBMM05qY21sd2RITXZiV0ZwYmk1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3haUVVGWkxFTkJRVU03UVVGRFlpeEpRVUZKTEZGQlFWRXNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03UVVGRGJrTXNTVUZCU1N4VlFVRlZMRWRCUVVjc1QwRkJUeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzBGQlEzWkRPMEZCUTBFN08wRkJSVUVzVlVGQlZTeERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eEpRVUZKTEVWQlFVVTdRVUZET1VNc1NVRkJTU3hKUVVGSkxFbEJRVWtzUTBGQlF5eEZRVUZGTEVWQlFVVTdPMUZCUlZRc1NVRkJTU3hSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NSVUZCUlR0WlFVTXhRaXhOUVVGTkxFVkJRVVVzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxPMWxCUTNaQ0xFMUJRVTBzUlVGQlJUdG5Ra0ZEU2l4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWM3WjBKQlEySXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSE8yZENRVU5pTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSenRoUVVOb1FqdFRRVU5LTEVWQlFVVTdXVUZEUXl4VFFVRlRMRVZCUVVVc1NVRkJTVHRaUVVObUxFdEJRVXNzUlVGQlJUdG5Ra0ZEU0N4eFFrRkJjVUlzUlVGQlJTeFRRVUZUTEV0QlFVc3NSVUZCUlR0dlFrRkRia01zVDBGQlR5eExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOMlFqdGhRVU5LTzFOQlEwb3NRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhOUVVGTkxFVkJRVVVzVTBGQlV5eEpRVUZKTEVWQlFVVTdXVUZEZWtJc1NVRkJTU3hKUVVGSkxFTkJRVU1zU1VGQlNTeExRVUZMTEV0QlFVc3NSVUZCUlR0blFrRkRja0lzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNN2IwSkJRMlFzUzBGQlN5eEZRVUZGTEcxQ1FVRnRRanRwUWtGRE4wSXNRMEZCUXl4RFFVRkRPMkZCUTA0N1UwRkRTaXhEUVVGRExFTkJRVU03UzBGRFRqdERRVU5LTEVOQlFVTXNRMEZCUXlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpZDFjMlVnYzNSeWFXTjBKenRjYm5aaGNpQkRhR0Z5ZEdsemRDQTlJSEpsY1hWcGNtVW9KMk5vWVhKMGFYTjBKeWs3WEc1MllYSWdjM1Z3WlhKQloyVnVkQ0E5SUhKbGNYVnBjbVVvSjNOMWNHVnlZV2RsYm5RbktUdGNibHh1WEc1Y2JuTjFjR1Z5UVdkbGJuUXVaMlYwS0NjdloyVjBkR1Z0Y0NjcExtVnVaQ2htZFc1amRHbHZiaWhrWVhSaEtTQjdYRzRnSUNBZ2FXWWdLR1JoZEdFdWIyc3BJSHRjYmx4dUlDQWdJQ0FnSUNCdVpYY2dRMmhoY25ScGMzUXVRbUZ5S0NjdVkzUXRZMmhoY25RbkxDQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCc1lXSmxiSE02SUdSaGRHRXVZbTlrZVM1a1lYUmxjeXhjYmlBZ0lDQWdJQ0FnSUNBZ0lITmxjbWxsY3pvZ1cxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHUmhkR0V1WW05a2VTNXRZWGdzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlTNWliMlI1TG1GMlp5eGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoTG1KdlpIa3ViV2x1WEc0Z0lDQWdJQ0FnSUNBZ0lDQmRYRzRnSUNBZ0lDQWdJSDBzSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSE4wWVdOclFtRnljem9nZEhKMVpTeGNiaUFnSUNBZ0lDQWdJQ0FnSUdGNGFYTlpPaUI3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYkdGaVpXeEpiblJsY25CdmJHRjBhVzl1Um01ak9pQm1kVzVqZEdsdmJpaDJZV3gxWlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdkbUZzZFdVZ0t5QW5JR01uTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlNrdWIyNG9KMlJ5WVhjbkxDQm1kVzVqZEdsdmJpaGtZWFJoS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1pHRjBZUzUwZVhCbElEMDlQU0FuWW1GeUp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1JoZEdFdVpXeGxiV1Z1ZEM1aGRIUnlLSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2MzUjViR1U2SUNkemRISnZhMlV0ZDJsa2RHZzZJRFZ3ZUNkY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZWeHVmU2s3WEc0aVhYMD0iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAocm9vdC5yZXR1cm5FeHBvcnRzR2xvYmFsID0gZmFjdG9yeSgpKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICByb290WydDaGFydGlzdCddID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuICAvKiBDaGFydGlzdC5qcyAwLjcuMlxuICAgKiBDb3B5cmlnaHQgwqkgMjAxNSBHaW9uIEt1bnpcbiAgICogRnJlZSB0byB1c2UgdW5kZXIgdGhlIFdURlBMIGxpY2Vuc2UuXG4gICAqIGh0dHA6Ly93d3cud3RmcGwubmV0L1xuICAgKi9cbiAgLyoqXG4gICAqIFRoZSBjb3JlIG1vZHVsZSBvZiBDaGFydGlzdCB0aGF0IGlzIG1haW5seSBwcm92aWRpbmcgc3RhdGljIGZ1bmN0aW9ucyBhbmQgaGlnaGVyIGxldmVsIGZ1bmN0aW9ucyBmb3IgY2hhcnQgbW9kdWxlcy5cbiAgICpcbiAgICogQG1vZHVsZSBDaGFydGlzdC5Db3JlXG4gICAqL1xuICB2YXIgQ2hhcnRpc3QgPSB7XG4gICAgdmVyc2lvbjogJzAuNy4xJ1xuICB9O1xuXG4gIChmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBIZWxwcyB0byBzaW1wbGlmeSBmdW5jdGlvbmFsIHN0eWxlIGNvZGVcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIHsqfSBuIFRoaXMgZXhhY3QgdmFsdWUgd2lsbCBiZSByZXR1cm5lZCBieSB0aGUgbm9vcCBmdW5jdGlvblxuICAgICAqIEByZXR1cm4geyp9IFRoZSBzYW1lIHZhbHVlIHRoYXQgd2FzIHByb3ZpZGVkIHRvIHRoZSBuIHBhcmFtZXRlclxuICAgICAqL1xuICAgIENoYXJ0aXN0Lm5vb3AgPSBmdW5jdGlvbiAobikge1xuICAgICAgcmV0dXJuIG47XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhLXogZnJvbSBhIG51bWJlciAwIHRvIDI2XG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBuIEEgbnVtYmVyIGZyb20gMCB0byAyNiB0aGF0IHdpbGwgcmVzdWx0IGluIGEgbGV0dGVyIGEtelxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gQSBjaGFyYWN0ZXIgZnJvbSBhLXogYmFzZWQgb24gdGhlIGlucHV0IG51bWJlciBuXG4gICAgICovXG4gICAgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZSA9IGZ1bmN0aW9uIChuKSB7XG4gICAgICAvLyBMaW1pdCB0byBhLXpcbiAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDk3ICsgbiAlIDI2KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2ltcGxlIHJlY3Vyc2l2ZSBvYmplY3QgZXh0ZW5kXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGFyZ2V0IG9iamVjdCB3aGVyZSB0aGUgc291cmNlIHdpbGwgYmUgbWVyZ2VkIGludG9cbiAgICAgKiBAcGFyYW0ge09iamVjdC4uLn0gc291cmNlcyBUaGlzIG9iamVjdCAob2JqZWN0cykgd2lsbCBiZSBtZXJnZWQgaW50byB0YXJnZXQgYW5kIHRoZW4gdGFyZ2V0IGlzIHJldHVybmVkXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3QgdGhhdCBoYXMgdGhlIHNhbWUgcmVmZXJlbmNlIGFzIHRhcmdldCBidXQgaXMgZXh0ZW5kZWQgYW5kIG1lcmdlZCB3aXRoIHRoZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZVxuICAgICAqL1xuICAgIENoYXJ0aXN0LmV4dGVuZCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcblxuICAgICAgdmFyIHNvdXJjZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlW3Byb3BdID09PSAnb2JqZWN0JyAmJiAhKHNvdXJjZVtwcm9wXSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gQ2hhcnRpc3QuZXh0ZW5kKHRhcmdldFtwcm9wXSwgc291cmNlW3Byb3BdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlcGxhY2VzIGFsbCBvY2N1cnJlbmNlcyBvZiBzdWJTdHIgaW4gc3RyIHdpdGggbmV3U3ViU3RyIGFuZCByZXR1cm5zIGEgbmV3IHN0cmluZy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdWJTdHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmV3U3ViU3RyXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIENoYXJ0aXN0LnJlcGxhY2VBbGwgPSBmdW5jdGlvbihzdHIsIHN1YlN0ciwgbmV3U3ViU3RyKSB7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChzdWJTdHIsICdnJyksIG5ld1N1YlN0cik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGEgc3RyaW5nIHRvIGEgbnVtYmVyIHdoaWxlIHJlbW92aW5nIHRoZSB1bml0IGlmIHByZXNlbnQuIElmIGEgbnVtYmVyIGlzIHBhc3NlZCB0aGVuIHRoaXMgd2lsbCBiZSByZXR1cm5lZCB1bm1vZGlmaWVkLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBSZXR1cm5zIHRoZSBzdHJpbmcgYXMgbnVtYmVyIG9yIE5hTiBpZiB0aGUgcGFzc2VkIGxlbmd0aCBjb3VsZCBub3QgYmUgY29udmVydGVkIHRvIHBpeGVsXG4gICAgICovXG4gICAgQ2hhcnRpc3Quc3RyaXBVbml0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXjAtOVxcKy1cXC5dL2csICcnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICt2YWx1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBudW1iZXIgdG8gYSBzdHJpbmcgd2l0aCBhIHVuaXQuIElmIGEgc3RyaW5nIGlzIHBhc3NlZCB0aGVuIHRoaXMgd2lsbCBiZSByZXR1cm5lZCB1bm1vZGlmaWVkLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdW5pdFxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gUmV0dXJucyB0aGUgcGFzc2VkIG51bWJlciB2YWx1ZSB3aXRoIHVuaXQuXG4gICAgICovXG4gICAgQ2hhcnRpc3QuZW5zdXJlVW5pdCA9IGZ1bmN0aW9uKHZhbHVlLCB1bml0KSB7XG4gICAgICBpZih0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgKyB1bml0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYSB3cmFwcGVyIGFyb3VuZCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIHRoYXQgd2lsbCByZXR1cm4gdGhlIHF1ZXJ5IGlmIGl0J3MgYWxyZWFkeSBvZiB0eXBlIE5vZGVcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIHtTdHJpbmd8Tm9kZX0gcXVlcnkgVGhlIHF1ZXJ5IHRvIHVzZSBmb3Igc2VsZWN0aW5nIGEgTm9kZSBvciBhIERPTSBub2RlIHRoYXQgd2lsbCBiZSByZXR1cm5lZCBkaXJlY3RseVxuICAgICAqIEByZXR1cm4ge05vZGV9XG4gICAgICovXG4gICAgQ2hhcnRpc3QucXVlcnlTZWxlY3RvciA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gcXVlcnkgaW5zdGFuY2VvZiBOb2RlID8gcXVlcnkgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHF1ZXJ5KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb25hbCBzdHlsZSBoZWxwZXIgdG8gcHJvZHVjZSBhcnJheSB3aXRoIGdpdmVuIGxlbmd0aCBpbml0aWFsaXplZCB3aXRoIHVuZGVmaW5lZCB2YWx1ZXNcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIGxlbmd0aFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIENoYXJ0aXN0LnRpbWVzID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuYXBwbHkobnVsbCwgbmV3IEFycmF5KGxlbmd0aCkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdW0gaGVscGVyIHRvIGJlIHVzZWQgaW4gcmVkdWNlIGZ1bmN0aW9uc1xuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0gcHJldmlvdXNcbiAgICAgKiBAcGFyYW0gY3VycmVudFxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgQ2hhcnRpc3Quc3VtID0gZnVuY3Rpb24ocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICAgIHJldHVybiBwcmV2aW91cyArIGN1cnJlbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1hcCBmb3IgbXVsdGkgZGltZW5zaW9uYWwgYXJyYXlzIHdoZXJlIHRoZWlyIG5lc3RlZCBhcnJheXMgd2lsbCBiZSBtYXBwZWQgaW4gc2VyaWFsLiBUaGUgb3V0cHV0IGFycmF5IHdpbGwgaGF2ZSB0aGUgbGVuZ3RoIG9mIHRoZSBsYXJnZXN0IG5lc3RlZCBhcnJheS4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHZhcmlhYmxlIGFyZ3VtZW50cyB3aGVyZSBlYWNoIGFyZ3VtZW50IGlzIHRoZSBuZXN0ZWQgYXJyYXkgdmFsdWUgKG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gbW9yZSB2YWx1ZXMpLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0gYXJyXG4gICAgICogQHBhcmFtIGNiXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgQ2hhcnRpc3Quc2VyaWFsTWFwID0gZnVuY3Rpb24oYXJyLCBjYikge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgICAgIGxlbmd0aCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGFyci5tYXAoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIGUubGVuZ3RoO1xuICAgICAgICAgIH0pKTtcblxuICAgICAgQ2hhcnRpc3QudGltZXMobGVuZ3RoKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGluZGV4KSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyLm1hcChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIGVbaW5kZXhdO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXN1bHRbaW5kZXhdID0gY2IuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQSBtYXAgd2l0aCBjaGFyYWN0ZXJzIHRvIGVzY2FwZSBmb3Igc3RyaW5ncyB0byBiZSBzYWZlbHkgdXNlZCBhcyBhdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIENoYXJ0aXN0LmVzY2FwaW5nTWFwID0ge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgJ1xcJyc6ICcmIzAzOTsnXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gc2VyaWFsaXplcyBhcmJpdHJhcnkgZGF0YSB0byBhIHN0cmluZy4gSW4gY2FzZSBvZiBkYXRhIHRoYXQgY2FuJ3QgYmUgZWFzaWx5IGNvbnZlcnRlZCB0byBhIHN0cmluZywgdGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSBhIHdyYXBwZXIgb2JqZWN0IGFuZCBzZXJpYWxpemUgdGhlIGRhdGEgdXNpbmcgSlNPTi5zdHJpbmdpZnkuIFRoZSBvdXRjb21pbmcgc3RyaW5nIHdpbGwgYWx3YXlzIGJlIGVzY2FwZWQgdXNpbmcgQ2hhcnRpc3QuZXNjYXBpbmdNYXAuXG4gICAgICogSWYgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQgdGhlIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIGltbWVkaWF0ZWx5IHdpdGggbnVsbCBvciB1bmRlZmluZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ3xPYmplY3R9IGRhdGFcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgQ2hhcnRpc3Quc2VyaWFsaXplID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgaWYoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9IGVsc2UgaWYodHlwZW9mIGRhdGEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGRhdGEgPSAnJytkYXRhO1xuICAgICAgfSBlbHNlIGlmKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoe2RhdGE6IGRhdGF9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKENoYXJ0aXN0LmVzY2FwaW5nTWFwKS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIENoYXJ0aXN0LnJlcGxhY2VBbGwocmVzdWx0LCBrZXksIENoYXJ0aXN0LmVzY2FwaW5nTWFwW2tleV0pO1xuICAgICAgfSwgZGF0YSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gZGUtc2VyaWFsaXplcyBhIHN0cmluZyBwcmV2aW91c2x5IHNlcmlhbGl6ZWQgd2l0aCBDaGFydGlzdC5zZXJpYWxpemUuIFRoZSBzdHJpbmcgd2lsbCBhbHdheXMgYmUgdW5lc2NhcGVkIHVzaW5nIENoYXJ0aXN0LmVzY2FwaW5nTWFwIGJlZm9yZSBpdCdzIHJldHVybmVkLiBCYXNlZCBvbiB0aGUgaW5wdXQgdmFsdWUgdGhlIHJldHVybiB0eXBlIGNhbiBiZSBOdW1iZXIsIFN0cmluZyBvciBPYmplY3QuIEpTT04ucGFyc2UgaXMgdXNlZCB3aXRoIHRyeSAvIGNhdGNoIHRvIHNlZSBpZiB0aGUgdW5lc2NhcGVkIHN0cmluZyBjYW4gYmUgcGFyc2VkIGludG8gYW4gT2JqZWN0IGFuZCB0aGlzIE9iamVjdCB3aWxsIGJlIHJldHVybmVkIG9uIHN1Y2Nlc3MuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhXG4gICAgICogQHJldHVybiB7U3RyaW5nfE51bWJlcnxPYmplY3R9XG4gICAgICovXG4gICAgQ2hhcnRpc3QuZGVzZXJpYWxpemUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZih0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIGRhdGEgPSBPYmplY3Qua2V5cyhDaGFydGlzdC5lc2NhcGluZ01hcCkucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgICAgIHJldHVybiBDaGFydGlzdC5yZXBsYWNlQWxsKHJlc3VsdCwgQ2hhcnRpc3QuZXNjYXBpbmdNYXBba2V5XSwga2V5KTtcbiAgICAgIH0sIGRhdGEpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgZGF0YSA9IGRhdGEuZGF0YSAhPT0gdW5kZWZpbmVkID8gZGF0YS5kYXRhIDogZGF0YTtcbiAgICAgIH0gY2F0Y2goZSkge31cblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBvciByZWluaXRpYWxpemUgdGhlIFNWRyBlbGVtZW50IGZvciB0aGUgY2hhcnRcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIHtOb2RlfSBjb250YWluZXIgVGhlIGNvbnRhaW5pbmcgRE9NIE5vZGUgb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIHBsYW50IHRoZSBTVkcgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB3aWR0aCBTZXQgdGhlIHdpZHRoIG9mIHRoZSBTVkcgZWxlbWVudC4gRGVmYXVsdCBpcyAxMDAlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGhlaWdodCBTZXQgdGhlIGhlaWdodCBvZiB0aGUgU1ZHIGVsZW1lbnQuIERlZmF1bHQgaXMgMTAwJVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgU3BlY2lmeSBhIGNsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBTVkcgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNyZWF0ZWQvcmVpbml0aWFsaXplZCBTVkcgZWxlbWVudFxuICAgICAqL1xuICAgIENoYXJ0aXN0LmNyZWF0ZVN2ZyA9IGZ1bmN0aW9uIChjb250YWluZXIsIHdpZHRoLCBoZWlnaHQsIGNsYXNzTmFtZSkge1xuICAgICAgdmFyIHN2ZztcblxuICAgICAgd2lkdGggPSB3aWR0aCB8fCAnMTAwJSc7XG4gICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgJzEwMCUnO1xuXG4gICAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHByZXZpb3VzIFNWRyBlbGVtZW50IGluIHRoZSBjb250YWluZXIgdGhhdCBjb250YWlucyB0aGUgQ2hhcnRpc3QgWE1MIG5hbWVzcGFjZSBhbmQgcmVtb3ZlIGl0XG4gICAgICAvLyBTaW5jZSB0aGUgRE9NIEFQSSBkb2VzIG5vdCBzdXBwb3J0IG5hbWVzcGFjZXMgd2UgbmVlZCB0byBtYW51YWxseSBzZWFyY2ggdGhlIHJldHVybmVkIGxpc3QgaHR0cDovL3d3dy53My5vcmcvVFIvc2VsZWN0b3JzLWFwaS9cbiAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdzdmcnKSkuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckNoYXJ0aXN0U3ZnT2JqZWN0cyhzdmcpIHtcbiAgICAgICAgcmV0dXJuIHN2Zy5nZXRBdHRyaWJ1dGUoQ2hhcnRpc3QueG1sTnMucXVhbGlmaWVkTmFtZSk7XG4gICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uIHJlbW92ZVByZXZpb3VzRWxlbWVudChzdmcpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHN2Zyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gQ3JlYXRlIHN2ZyBvYmplY3Qgd2l0aCB3aWR0aCBhbmQgaGVpZ2h0IG9yIHVzZSAxMDAlIGFzIGRlZmF1bHRcbiAgICAgIHN2ZyA9IG5ldyBDaGFydGlzdC5TdmcoJ3N2ZycpLmF0dHIoe1xuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICB9KS5hZGRDbGFzcyhjbGFzc05hbWUpLmF0dHIoe1xuICAgICAgICBzdHlsZTogJ3dpZHRoOiAnICsgd2lkdGggKyAnOyBoZWlnaHQ6ICcgKyBoZWlnaHQgKyAnOydcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgdGhlIERPTSBub2RlIHRvIG91ciBjb250YWluZXJcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzdmcuX25vZGUpO1xuXG4gICAgICByZXR1cm4gc3ZnO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJldmVyc2VzIHRoZSBzZXJpZXMsIGxhYmVscyBhbmQgc2VyaWVzIGRhdGEgYXJyYXlzLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqL1xuICAgIENoYXJ0aXN0LnJldmVyc2VEYXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGF0YS5sYWJlbHMucmV2ZXJzZSgpO1xuICAgICAgZGF0YS5zZXJpZXMucmV2ZXJzZSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZih0eXBlb2YoZGF0YS5zZXJpZXNbaV0pID09PSAnb2JqZWN0JyAmJiBkYXRhLnNlcmllc1tpXS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhLnNlcmllc1tpXS5kYXRhLnJldmVyc2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRhLnNlcmllc1tpXS5yZXZlcnNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBkYXRhIHNlcmllcyBpbnRvIHBsYWluIGFycmF5XG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBzZXJpZXMgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgdG8gYmUgdmlzdWFsaXplZCBpbiB0aGUgY2hhcnRcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJldmVyc2UgSWYgdHJ1ZSB0aGUgd2hvbGUgZGF0YSBpcyByZXZlcnNlZCBieSB0aGUgZ2V0RGF0YUFycmF5IGNhbGwuIFRoaXMgd2lsbCBtb2RpZnkgdGhlIGRhdGEgb2JqZWN0IHBhc3NlZCBhcyBmaXJzdCBwYXJhbWV0ZXIuIFRoZSBsYWJlbHMgYXMgd2VsbCBhcyB0aGUgc2VyaWVzIG9yZGVyIGlzIHJldmVyc2VkLiBUaGUgd2hvbGUgc2VyaWVzIGRhdGEgYXJyYXlzIGFyZSByZXZlcnNlZCB0b28uXG4gICAgICogQHJldHVybiB7QXJyYXl9IEEgcGxhaW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgZGF0YSB0byBiZSB2aXN1YWxpemVkIGluIHRoZSBjaGFydFxuICAgICAqL1xuICAgIENoYXJ0aXN0LmdldERhdGFBcnJheSA9IGZ1bmN0aW9uIChkYXRhLCByZXZlcnNlKSB7XG4gICAgICB2YXIgYXJyYXkgPSBbXSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGxvY2FsRGF0YTtcblxuICAgICAgLy8gSWYgdGhlIGRhdGEgc2hvdWxkIGJlIHJldmVyc2VkIGJ1dCBpc24ndCB3ZSBuZWVkIHRvIHJldmVyc2UgaXRcbiAgICAgIC8vIElmIGl0J3MgcmV2ZXJzZWQgYnV0IGl0IHNob3VsZG4ndCB3ZSBuZWVkIHRvIHJldmVyc2UgaXQgYmFja1xuICAgICAgLy8gVGhhdCdzIHJlcXVpcmVkIHRvIGhhbmRsZSBkYXRhIHVwZGF0ZXMgY29ycmVjdGx5IGFuZCB0byByZWZsZWN0IHRoZSByZXNwb25zaXZlIGNvbmZpZ3VyYXRpb25zXG4gICAgICBpZihyZXZlcnNlICYmICFkYXRhLnJldmVyc2VkIHx8ICFyZXZlcnNlICYmIGRhdGEucmV2ZXJzZWQpIHtcbiAgICAgICAgQ2hhcnRpc3QucmV2ZXJzZURhdGEoZGF0YSk7XG4gICAgICAgIGRhdGEucmV2ZXJzZWQgPSAhZGF0YS5yZXZlcnNlZDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBJZiB0aGUgc2VyaWVzIGFycmF5IGNvbnRhaW5zIGFuIG9iamVjdCB3aXRoIGEgZGF0YSBwcm9wZXJ0eSB3ZSB3aWxsIHVzZSB0aGUgcHJvcGVydHlcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHRoZSB2YWx1ZSBkaXJlY3RseSAoYXJyYXkgb3IgbnVtYmVyKS5cbiAgICAgICAgLy8gV2UgY3JlYXRlIGEgY29weSBvZiB0aGUgb3JpZ2luYWwgZGF0YSBhcnJheSB3aXRoIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5XG4gICAgICAgIGxvY2FsRGF0YSA9IHR5cGVvZihkYXRhLnNlcmllc1tpXSkgPT09ICdvYmplY3QnICYmIGRhdGEuc2VyaWVzW2ldLmRhdGEgIT09IHVuZGVmaW5lZCA/IGRhdGEuc2VyaWVzW2ldLmRhdGEgOiBkYXRhLnNlcmllc1tpXTtcbiAgICAgICAgaWYobG9jYWxEYXRhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICBhcnJheVtpXSA9IFtdO1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGFycmF5W2ldLCBsb2NhbERhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFycmF5W2ldID0gbG9jYWxEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCBvYmplY3QgdmFsdWVzIHRvIG51bWJlcnNcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhcnJheVtpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHZhbHVlID0gYXJyYXlbaV1bal07XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZS52YWx1ZSA9PT0gMCA/IDAgOiAodmFsdWUudmFsdWUgfHwgdmFsdWUpO1xuICAgICAgICAgIGFycmF5W2ldW2pdID0gK3ZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBtaXNzaW5nIHZhbHVlcyBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS4gVGhpcyBhcnJheSBjb250YWlucyB0aGUgZGF0YSwgdGhhdCB3aWxsIGJlIHZpc3VhbGl6ZWQgaW4gdGhlIGNoYXJ0XG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFBcnJheSBUaGUgYXJyYXkgdGhhdCBjb250YWlucyB0aGUgZGF0YSB0byBiZSB2aXN1YWxpemVkIGluIHRoZSBjaGFydC4gVGhlIGFycmF5IGluIHRoaXMgcGFyYW1ldGVyIHdpbGwgYmUgbW9kaWZpZWQgYnkgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSB4LWF4aXMgZGF0YSBhcnJheS5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIGFycmF5IHRoYXQgZ290IHVwZGF0ZWQgd2l0aCBtaXNzaW5nIHZhbHVlcy5cbiAgICAgKi9cbiAgICBDaGFydGlzdC5ub3JtYWxpemVEYXRhQXJyYXkgPSBmdW5jdGlvbiAoZGF0YUFycmF5LCBsZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhQXJyYXlbaV0ubGVuZ3RoID09PSBsZW5ndGgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGogPSBkYXRhQXJyYXlbaV0ubGVuZ3RoOyBqIDwgbGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBkYXRhQXJyYXlbaV1bal0gPSAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRhQXJyYXk7XG4gICAgfTtcblxuICAgIENoYXJ0aXN0LmdldE1ldGFEYXRhID0gZnVuY3Rpb24oc2VyaWVzLCBpbmRleCkge1xuICAgICAgdmFyIHZhbHVlID0gc2VyaWVzLmRhdGEgPyBzZXJpZXMuZGF0YVtpbmRleF0gOiBzZXJpZXNbaW5kZXhdO1xuICAgICAgcmV0dXJuIHZhbHVlID8gQ2hhcnRpc3Quc2VyaWFsaXplKHZhbHVlLm1ldGEpIDogdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIG9yZGVyIG9mIG1hZ25pdHVkZSBmb3IgdGhlIGNoYXJ0IHNjYWxlXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBUaGUgdmFsdWUgUmFuZ2Ugb2YgdGhlIGNoYXJ0XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgb3JkZXIgb2YgbWFnbml0dWRlXG4gICAgICovXG4gICAgQ2hhcnRpc3Qub3JkZXJPZk1hZ25pdHVkZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5sb2coTWF0aC5hYnModmFsdWUpKSAvIE1hdGguTE4xMCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFByb2plY3QgYSBkYXRhIGxlbmd0aCBpbnRvIHNjcmVlbiBjb29yZGluYXRlcyAocGl4ZWxzKVxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXhpc0xlbmd0aCBUaGUgc3ZnIGVsZW1lbnQgZm9yIHRoZSBjaGFydFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggU2luZ2xlIGRhdGEgdmFsdWUgZnJvbSBhIHNlcmllcyBhcnJheVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBib3VuZHMgQWxsIHRoZSB2YWx1ZXMgdG8gc2V0IHRoZSBib3VuZHMgb2YgdGhlIGNoYXJ0XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgcHJvamVjdGVkIGRhdGEgbGVuZ3RoIGluIHBpeGVsc1xuICAgICAqL1xuICAgIENoYXJ0aXN0LnByb2plY3RMZW5ndGggPSBmdW5jdGlvbiAoYXhpc0xlbmd0aCwgbGVuZ3RoLCBib3VuZHMpIHtcbiAgICAgIHJldHVybiBsZW5ndGggLyBib3VuZHMucmFuZ2UgKiBheGlzTGVuZ3RoO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGhlaWdodCBvZiB0aGUgYXJlYSBpbiB0aGUgY2hhcnQgZm9yIHRoZSBkYXRhIHNlcmllc1xuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3ZnIFRoZSBzdmcgZWxlbWVudCBmb3IgdGhlIGNoYXJ0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIE9iamVjdCB0aGF0IGNvbnRhaW5zIGFsbCB0aGUgb3B0aW9uYWwgdmFsdWVzIGZvciB0aGUgY2hhcnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBoZWlnaHQgb2YgdGhlIGFyZWEgaW4gdGhlIGNoYXJ0IGZvciB0aGUgZGF0YSBzZXJpZXNcbiAgICAgKi9cbiAgICBDaGFydGlzdC5nZXRBdmFpbGFibGVIZWlnaHQgPSBmdW5jdGlvbiAoc3ZnLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoKENoYXJ0aXN0LnN0cmlwVW5pdChvcHRpb25zLmhlaWdodCkgfHwgc3ZnLmhlaWdodCgpKSAtIChvcHRpb25zLmNoYXJ0UGFkZGluZyAqIDIpIC0gb3B0aW9ucy5heGlzWC5vZmZzZXQsIDApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgaGlnaGVzdCBhbmQgbG93ZXN0IHZhbHVlIG9mIGRhdGEgYXJyYXkuIFRoaXMgQXJyYXkgY29udGFpbnMgdGhlIGRhdGEgdGhhdCB3aWxsIGJlIHZpc3VhbGl6ZWQgaW4gdGhlIGNoYXJ0LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhQXJyYXkgVGhlIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgdG8gYmUgdmlzdWFsaXplZCBpbiB0aGUgY2hhcnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3QgdmFsdWUgdGhhdCB3aWxsIGJlIHZpc3VhbGl6ZWQgb24gdGhlIGNoYXJ0LlxuICAgICAqL1xuICAgIENoYXJ0aXN0LmdldEhpZ2hMb3cgPSBmdW5jdGlvbiAoZGF0YUFycmF5KSB7XG4gICAgICB2YXIgaSxcbiAgICAgICAgaixcbiAgICAgICAgaGlnaExvdyA9IHtcbiAgICAgICAgICBoaWdoOiAtTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICBsb3c6IE51bWJlci5NQVhfVkFMVUVcbiAgICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGFBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgZGF0YUFycmF5W2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGRhdGFBcnJheVtpXVtqXSA+IGhpZ2hMb3cuaGlnaCkge1xuICAgICAgICAgICAgaGlnaExvdy5oaWdoID0gZGF0YUFycmF5W2ldW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkYXRhQXJyYXlbaV1bal0gPCBoaWdoTG93Lmxvdykge1xuICAgICAgICAgICAgaGlnaExvdy5sb3cgPSBkYXRhQXJyYXlbaV1bal07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBoaWdoTG93O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgYW5kIHJldHJpZXZlIGFsbCB0aGUgYm91bmRzIGZvciB0aGUgY2hhcnQgYW5kIHJldHVybiB0aGVtIGluIG9uZSBhcnJheVxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYXhpc0xlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSBBeGlzIHVzZWQgZm9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGhpZ2hMb3cgQW4gb2JqZWN0IGNvbnRhaW5pbmcgYSBoaWdoIGFuZCBsb3cgcHJvcGVydHkgaW5kaWNhdGluZyB0aGUgdmFsdWUgcmFuZ2Ugb2YgdGhlIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZU1pblNwYWNlIFRoZSBtaW5pbXVtIHByb2plY3RlZCBsZW5ndGggYSBzdGVwIHNob3VsZCByZXN1bHQgaW5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmVmZXJlbmNlVmFsdWUgVGhlIHJlZmVyZW5jZSB2YWx1ZSBmb3IgdGhlIGNoYXJ0LlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQWxsIHRoZSB2YWx1ZXMgdG8gc2V0IHRoZSBib3VuZHMgb2YgdGhlIGNoYXJ0XG4gICAgICovXG4gICAgQ2hhcnRpc3QuZ2V0Qm91bmRzID0gZnVuY3Rpb24gKGF4aXNMZW5ndGgsIGhpZ2hMb3csIHNjYWxlTWluU3BhY2UsIHJlZmVyZW5jZVZhbHVlKSB7XG4gICAgICB2YXIgaSxcbiAgICAgICAgbmV3TWluLFxuICAgICAgICBuZXdNYXgsXG4gICAgICAgIGJvdW5kcyA9IHtcbiAgICAgICAgICBoaWdoOiBoaWdoTG93LmhpZ2gsXG4gICAgICAgICAgbG93OiBoaWdoTG93Lmxvd1xuICAgICAgICB9O1xuXG4gICAgICAvLyBJZiBoaWdoIGFuZCBsb3cgYXJlIHRoZSBzYW1lIGJlY2F1c2Ugb2YgbWlzY29uZmlndXJhdGlvbiBvciBmbGF0IGRhdGEgKG9ubHkgdGhlIHNhbWUgdmFsdWUpIHdlIG5lZWRcbiAgICAgIC8vIHRvIHNldCB0aGUgaGlnaCBvciBsb3cgdG8gMCBkZXBlbmRpbmcgb24gdGhlIHBvbGFyaXR5XG4gICAgICBpZihib3VuZHMuaGlnaCA9PT0gYm91bmRzLmxvdykge1xuICAgICAgICAvLyBJZiBib3RoIHZhbHVlcyBhcmUgMCB3ZSBzZXQgaGlnaCB0byAxXG4gICAgICAgIGlmKGJvdW5kcy5sb3cgPT09IDApIHtcbiAgICAgICAgICBib3VuZHMuaGlnaCA9IDE7XG4gICAgICAgIH0gZWxzZSBpZihib3VuZHMubG93IDwgMCkge1xuICAgICAgICAgIC8vIElmIHdlIGhhdmUgdGhlIHNhbWUgbmVnYXRpdmUgdmFsdWUgZm9yIHRoZSBib3VuZHMgd2Ugc2V0IGJvdW5kcy5oaWdoIHRvIDBcbiAgICAgICAgICBib3VuZHMuaGlnaCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSB0aGUgc2FtZSBwb3NpdGl2ZSB2YWx1ZSBmb3IgdGhlIGJvdW5kcyB3ZSBzZXQgYm91bmRzLmxvdyB0byAwXG4gICAgICAgICAgYm91bmRzLmxvdyA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGVzIG9mIGhpZ2ggLyBsb3cgYmFzZWQgb24gcmVmZXJlbmNlIHZhbHVlLCBpdCB3aWxsIG1ha2Ugc3VyZSB0aGF0IHRoZSBpbnZpc2libGUgcmVmZXJlbmNlIHZhbHVlIGlzXG4gICAgICAvLyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBjaGFydC4gVGhpcyBpcyB1c2VmdWwgd2hlbiB0aGUgY2hhcnQgYWx3YXlzIG5lZWRzIHRvIGNvbnRhaW4gdGhlIHBvc2l0aW9uIG9mIHRoZVxuICAgICAgLy8gaW52aXNpYmxlIHJlZmVyZW5jZSB2YWx1ZSBpbiB0aGUgdmlldyBpLmUuIGZvciBiaXBvbGFyIHNjYWxlcy5cbiAgICAgIGlmIChyZWZlcmVuY2VWYWx1ZSB8fCByZWZlcmVuY2VWYWx1ZSA9PT0gMCkge1xuICAgICAgICBib3VuZHMuaGlnaCA9IE1hdGgubWF4KHJlZmVyZW5jZVZhbHVlLCBib3VuZHMuaGlnaCk7XG4gICAgICAgIGJvdW5kcy5sb3cgPSBNYXRoLm1pbihyZWZlcmVuY2VWYWx1ZSwgYm91bmRzLmxvdyk7XG4gICAgICB9XG5cbiAgICAgIGJvdW5kcy52YWx1ZVJhbmdlID0gYm91bmRzLmhpZ2ggLSBib3VuZHMubG93O1xuICAgICAgYm91bmRzLm9vbSA9IENoYXJ0aXN0Lm9yZGVyT2ZNYWduaXR1ZGUoYm91bmRzLnZhbHVlUmFuZ2UpO1xuICAgICAgYm91bmRzLm1pbiA9IE1hdGguZmxvb3IoYm91bmRzLmxvdyAvIE1hdGgucG93KDEwLCBib3VuZHMub29tKSkgKiBNYXRoLnBvdygxMCwgYm91bmRzLm9vbSk7XG4gICAgICBib3VuZHMubWF4ID0gTWF0aC5jZWlsKGJvdW5kcy5oaWdoIC8gTWF0aC5wb3coMTAsIGJvdW5kcy5vb20pKSAqIE1hdGgucG93KDEwLCBib3VuZHMub29tKTtcbiAgICAgIGJvdW5kcy5yYW5nZSA9IGJvdW5kcy5tYXggLSBib3VuZHMubWluO1xuICAgICAgYm91bmRzLnN0ZXAgPSBNYXRoLnBvdygxMCwgYm91bmRzLm9vbSk7XG4gICAgICBib3VuZHMubnVtYmVyT2ZTdGVwcyA9IE1hdGgucm91bmQoYm91bmRzLnJhbmdlIC8gYm91bmRzLnN0ZXApO1xuXG4gICAgICAvLyBPcHRpbWl6ZSBzY2FsZSBzdGVwIGJ5IGNoZWNraW5nIGlmIHN1YmRpdmlzaW9uIGlzIHBvc3NpYmxlIGJhc2VkIG9uIGhvcml6b250YWxHcmlkTWluU3BhY2VcbiAgICAgIC8vIElmIHdlIGFyZSBhbHJlYWR5IGJlbG93IHRoZSBzY2FsZU1pblNwYWNlIHZhbHVlIHdlIHdpbGwgc2NhbGUgdXBcbiAgICAgIHZhciBsZW5ndGggPSBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKGF4aXNMZW5ndGgsIGJvdW5kcy5zdGVwLCBib3VuZHMpLFxuICAgICAgICBzY2FsZVVwID0gbGVuZ3RoIDwgc2NhbGVNaW5TcGFjZTtcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgaWYgKHNjYWxlVXAgJiYgQ2hhcnRpc3QucHJvamVjdExlbmd0aChheGlzTGVuZ3RoLCBib3VuZHMuc3RlcCwgYm91bmRzKSA8PSBzY2FsZU1pblNwYWNlKSB7XG4gICAgICAgICAgYm91bmRzLnN0ZXAgKj0gMjtcbiAgICAgICAgfSBlbHNlIGlmICghc2NhbGVVcCAmJiBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKGF4aXNMZW5ndGgsIGJvdW5kcy5zdGVwIC8gMiwgYm91bmRzKSA+PSBzY2FsZU1pblNwYWNlKSB7XG4gICAgICAgICAgYm91bmRzLnN0ZXAgLz0gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBOYXJyb3cgbWluIGFuZCBtYXggYmFzZWQgb24gbmV3IHN0ZXBcbiAgICAgIG5ld01pbiA9IGJvdW5kcy5taW47XG4gICAgICBuZXdNYXggPSBib3VuZHMubWF4O1xuICAgICAgZm9yIChpID0gYm91bmRzLm1pbjsgaSA8PSBib3VuZHMubWF4OyBpICs9IGJvdW5kcy5zdGVwKSB7XG4gICAgICAgIGlmIChpICsgYm91bmRzLnN0ZXAgPCBib3VuZHMubG93KSB7XG4gICAgICAgICAgbmV3TWluICs9IGJvdW5kcy5zdGVwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGkgLSBib3VuZHMuc3RlcCA+PSBib3VuZHMuaGlnaCkge1xuICAgICAgICAgIG5ld01heCAtPSBib3VuZHMuc3RlcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYm91bmRzLm1pbiA9IG5ld01pbjtcbiAgICAgIGJvdW5kcy5tYXggPSBuZXdNYXg7XG4gICAgICBib3VuZHMucmFuZ2UgPSBib3VuZHMubWF4IC0gYm91bmRzLm1pbjtcblxuICAgICAgYm91bmRzLnZhbHVlcyA9IFtdO1xuICAgICAgZm9yIChpID0gYm91bmRzLm1pbjsgaSA8PSBib3VuZHMubWF4OyBpICs9IGJvdW5kcy5zdGVwKSB7XG4gICAgICAgIGJvdW5kcy52YWx1ZXMucHVzaChpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGNhcnRlc2lhbiBjb29yZGluYXRlcyBvZiBwb2xhciBjb29yZGluYXRlc1xuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY2VudGVyWCBYLWF4aXMgY29vcmRpbmF0ZXMgb2YgY2VudGVyIHBvaW50IG9mIGNpcmNsZSBzZWdtZW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGNlbnRlclkgWC1heGlzIGNvb3JkaW5hdGVzIG9mIGNlbnRlciBwb2ludCBvZiBjaXJjbGUgc2VnbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByYWRpdXMgUmFkaXVzIG9mIGNpcmNsZSBzZWdtZW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGFuZ2xlSW5EZWdyZWVzIEFuZ2xlIG9mIGNpcmNsZSBzZWdtZW50IGluIGRlZ3JlZXNcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IENvb3JkaW5hdGVzIG9mIHBvaW50IG9uIGNpcmN1bWZlcmVuY2VcbiAgICAgKi9cbiAgICBDaGFydGlzdC5wb2xhclRvQ2FydGVzaWFuID0gZnVuY3Rpb24gKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgYW5nbGVJbkRlZ3JlZXMpIHtcbiAgICAgIHZhciBhbmdsZUluUmFkaWFucyA9IChhbmdsZUluRGVncmVlcyAtIDkwKSAqIE1hdGguUEkgLyAxODAuMDtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogY2VudGVyWCArIChyYWRpdXMgKiBNYXRoLmNvcyhhbmdsZUluUmFkaWFucykpLFxuICAgICAgICB5OiBjZW50ZXJZICsgKHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKSlcbiAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgY2hhcnQgZHJhd2luZyByZWN0YW5nbGUgKGFyZWEgd2hlcmUgY2hhcnQgaXMgZHJhd24pIHgxLHkxID0gYm90dG9tIGxlZnQgLyB4Mix5MiA9IHRvcCByaWdodFxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3ZnIFRoZSBzdmcgZWxlbWVudCBmb3IgdGhlIGNoYXJ0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVGhlIE9iamVjdCB0aGF0IGNvbnRhaW5zIGFsbCB0aGUgb3B0aW9uYWwgdmFsdWVzIGZvciB0aGUgY2hhcnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjaGFydCByZWN0YW5nbGVzIGNvb3JkaW5hdGVzIGluc2lkZSB0aGUgc3ZnIGVsZW1lbnQgcGx1cyB0aGUgcmVjdGFuZ2xlcyBtZWFzdXJlbWVudHNcbiAgICAgKi9cbiAgICBDaGFydGlzdC5jcmVhdGVDaGFydFJlY3QgPSBmdW5jdGlvbiAoc3ZnLCBvcHRpb25zKSB7XG4gICAgICB2YXIgeU9mZnNldCA9IG9wdGlvbnMuYXhpc1kgPyBvcHRpb25zLmF4aXNZLm9mZnNldCB8fCAwIDogMCxcbiAgICAgICAgeE9mZnNldCA9IG9wdGlvbnMuYXhpc1ggPyBvcHRpb25zLmF4aXNYLm9mZnNldCB8fCAwIDogMCxcbiAgICAgICAgdyA9IENoYXJ0aXN0LnN0cmlwVW5pdChvcHRpb25zLndpZHRoKSB8fCBzdmcud2lkdGgoKSxcbiAgICAgICAgaCA9IENoYXJ0aXN0LnN0cmlwVW5pdChvcHRpb25zLmhlaWdodCkgfHwgc3ZnLmhlaWdodCgpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4MTogb3B0aW9ucy5jaGFydFBhZGRpbmcgKyB5T2Zmc2V0LFxuICAgICAgICB5MTogTWF0aC5tYXgoaCAtIG9wdGlvbnMuY2hhcnRQYWRkaW5nIC0geE9mZnNldCwgb3B0aW9ucy5jaGFydFBhZGRpbmcpLFxuICAgICAgICB4MjogTWF0aC5tYXgodyAtIG9wdGlvbnMuY2hhcnRQYWRkaW5nLCBvcHRpb25zLmNoYXJ0UGFkZGluZyArIHlPZmZzZXQpLFxuICAgICAgICB5Mjogb3B0aW9ucy5jaGFydFBhZGRpbmcsXG4gICAgICAgIHdpZHRoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMueDIgLSB0aGlzLngxO1xuICAgICAgICB9LFxuICAgICAgICBoZWlnaHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy55MSAtIHRoaXMueTI7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBncmlkIGxpbmUgYmFzZWQgb24gYSBwcm9qZWN0ZWQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQ29yZVxuICAgICAqIEBwYXJhbSBwcm9qZWN0ZWRWYWx1ZVxuICAgICAqIEBwYXJhbSBpbmRleFxuICAgICAqIEBwYXJhbSBheGlzXG4gICAgICogQHBhcmFtIG9mZnNldFxuICAgICAqIEBwYXJhbSBsZW5ndGhcbiAgICAgKiBAcGFyYW0gZ3JvdXBcbiAgICAgKiBAcGFyYW0gY2xhc3Nlc1xuICAgICAqIEBwYXJhbSBldmVudEVtaXR0ZXJcbiAgICAgKi9cbiAgICBDaGFydGlzdC5jcmVhdGVHcmlkID0gZnVuY3Rpb24ocHJvamVjdGVkVmFsdWUsIGluZGV4LCBheGlzLCBvZmZzZXQsIGxlbmd0aCwgZ3JvdXAsIGNsYXNzZXMsIGV2ZW50RW1pdHRlcikge1xuICAgICAgdmFyIHBvc2l0aW9uYWxEYXRhID0ge307XG4gICAgICBwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLnBvcyArICcxJ10gPSBwcm9qZWN0ZWRWYWx1ZS5wb3M7XG4gICAgICBwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLnBvcyArICcyJ10gPSBwcm9qZWN0ZWRWYWx1ZS5wb3M7XG4gICAgICBwb3NpdGlvbmFsRGF0YVtheGlzLmNvdW50ZXJVbml0cy5wb3MgKyAnMSddID0gb2Zmc2V0O1xuICAgICAgcG9zaXRpb25hbERhdGFbYXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzInXSA9IG9mZnNldCArIGxlbmd0aDtcblxuICAgICAgdmFyIGdyaWRFbGVtZW50ID0gZ3JvdXAuZWxlbSgnbGluZScsIHBvc2l0aW9uYWxEYXRhLCBjbGFzc2VzLmpvaW4oJyAnKSk7XG5cbiAgICAgIC8vIEV2ZW50IGZvciBncmlkIGRyYXdcbiAgICAgIGV2ZW50RW1pdHRlci5lbWl0KCdkcmF3JyxcbiAgICAgICAgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgICB0eXBlOiAnZ3JpZCcsXG4gICAgICAgICAgYXhpczogYXhpcy51bml0cy5wb3MsXG4gICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgIGdyb3VwOiBncm91cCxcbiAgICAgICAgICBlbGVtZW50OiBncmlkRWxlbWVudFxuICAgICAgICB9LCBwb3NpdGlvbmFsRGF0YSlcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBsYWJlbCBiYXNlZCBvbiBhIHByb2plY3RlZCB2YWx1ZSBhbmQgYW4gYXhpcy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIHByb2plY3RlZFZhbHVlXG4gICAgICogQHBhcmFtIGluZGV4XG4gICAgICogQHBhcmFtIGxhYmVsc1xuICAgICAqIEBwYXJhbSBheGlzXG4gICAgICogQHBhcmFtIGF4aXNPZmZzZXRcbiAgICAgKiBAcGFyYW0gbGFiZWxPZmZzZXRcbiAgICAgKiBAcGFyYW0gZ3JvdXBcbiAgICAgKiBAcGFyYW0gY2xhc3Nlc1xuICAgICAqIEBwYXJhbSB1c2VGb3JlaWduT2JqZWN0XG4gICAgICogQHBhcmFtIGV2ZW50RW1pdHRlclxuICAgICAqL1xuICAgIENoYXJ0aXN0LmNyZWF0ZUxhYmVsID0gZnVuY3Rpb24ocHJvamVjdGVkVmFsdWUsIGluZGV4LCBsYWJlbHMsIGF4aXMsIGF4aXNPZmZzZXQsIGxhYmVsT2Zmc2V0LCBncm91cCwgY2xhc3NlcywgdXNlRm9yZWlnbk9iamVjdCwgZXZlbnRFbWl0dGVyKSB7XG4gICAgICB2YXIgbGFiZWxFbGVtZW50LFxuICAgICAgICBwb3NpdGlvbmFsRGF0YSA9IHt9O1xuICAgICAgcG9zaXRpb25hbERhdGFbYXhpcy51bml0cy5wb3NdID0gcHJvamVjdGVkVmFsdWUucG9zICsgbGFiZWxPZmZzZXRbYXhpcy51bml0cy5wb3NdO1xuICAgICAgcG9zaXRpb25hbERhdGFbYXhpcy5jb3VudGVyVW5pdHMucG9zXSA9IGxhYmVsT2Zmc2V0W2F4aXMuY291bnRlclVuaXRzLnBvc107XG4gICAgICBwb3NpdGlvbmFsRGF0YVtheGlzLnVuaXRzLmxlbl0gPSBwcm9qZWN0ZWRWYWx1ZS5sZW47XG4gICAgICBwb3NpdGlvbmFsRGF0YVtheGlzLmNvdW50ZXJVbml0cy5sZW5dID0gYXhpc09mZnNldDtcblxuICAgICAgaWYodXNlRm9yZWlnbk9iamVjdCkge1xuICAgICAgICB2YXIgY29udGVudCA9ICc8c3BhbiBjbGFzcz1cIicgKyBjbGFzc2VzLmpvaW4oJyAnKSArICdcIj4nICsgbGFiZWxzW2luZGV4XSArICc8L3NwYW4+JztcbiAgICAgICAgbGFiZWxFbGVtZW50ID0gZ3JvdXAuZm9yZWlnbk9iamVjdChjb250ZW50LCBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICAgIHN0eWxlOiAnb3ZlcmZsb3c6IHZpc2libGU7J1xuICAgICAgICB9LCBwb3NpdGlvbmFsRGF0YSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFiZWxFbGVtZW50ID0gZ3JvdXAuZWxlbSgndGV4dCcsIHBvc2l0aW9uYWxEYXRhLCBjbGFzc2VzLmpvaW4oJyAnKSkudGV4dChsYWJlbHNbaW5kZXhdKTtcbiAgICAgIH1cblxuICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICB0eXBlOiAnbGFiZWwnLFxuICAgICAgICBheGlzOiBheGlzLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGdyb3VwOiBncm91cCxcbiAgICAgICAgZWxlbWVudDogbGFiZWxFbGVtZW50LFxuICAgICAgICB0ZXh0OiBsYWJlbHNbaW5kZXhdXG4gICAgICB9LCBwb3NpdGlvbmFsRGF0YSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZXMgYSB3aG9sZSBheGlzIHdpdGggaXRzIGdyaWQgbGluZXMgYW5kIGxhYmVscyBiYXNlZCBvbiBhbiBheGlzIG1vZGVsIGFuZCBhIGNoYXJ0UmVjdC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIGF4aXNcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEBwYXJhbSBjaGFydFJlY3RcbiAgICAgKiBAcGFyYW0gZ3JpZEdyb3VwXG4gICAgICogQHBhcmFtIGxhYmVsR3JvdXBcbiAgICAgKiBAcGFyYW0gdXNlRm9yZWlnbk9iamVjdFxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHBhcmFtIGV2ZW50RW1pdHRlclxuICAgICAqL1xuICAgIENoYXJ0aXN0LmNyZWF0ZUF4aXMgPSBmdW5jdGlvbihheGlzLCBkYXRhLCBjaGFydFJlY3QsIGdyaWRHcm91cCwgbGFiZWxHcm91cCwgdXNlRm9yZWlnbk9iamVjdCwgb3B0aW9ucywgZXZlbnRFbWl0dGVyKSB7XG4gICAgICB2YXIgYXhpc09wdGlvbnMgPSBvcHRpb25zWydheGlzJyArIGF4aXMudW5pdHMucG9zLnRvVXBwZXJDYXNlKCldLFxuICAgICAgICBwcm9qZWN0ZWRWYWx1ZXMgPSBkYXRhLm1hcChheGlzLnByb2plY3RWYWx1ZS5iaW5kKGF4aXMpKS5tYXAoYXhpcy50cmFuc2Zvcm0pLFxuICAgICAgICBsYWJlbFZhbHVlcyA9IGRhdGEubWFwKGF4aXNPcHRpb25zLmxhYmVsSW50ZXJwb2xhdGlvbkZuYyk7XG5cbiAgICAgIHByb2plY3RlZFZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2plY3RlZFZhbHVlLCBpbmRleCkge1xuICAgICAgICAvLyBTa2lwIGdyaWQgbGluZXMgYW5kIGxhYmVscyB3aGVyZSBpbnRlcnBvbGF0ZWQgbGFiZWwgdmFsdWVzIGFyZSBmYWxzZXkgKGV4ZWNwdCBmb3IgMClcbiAgICAgICAgaWYoIWxhYmVsVmFsdWVzW2luZGV4XSAmJiBsYWJlbFZhbHVlc1tpbmRleF0gIT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihheGlzT3B0aW9ucy5zaG93R3JpZCkge1xuICAgICAgICAgIENoYXJ0aXN0LmNyZWF0ZUdyaWQocHJvamVjdGVkVmFsdWUsIGluZGV4LCBheGlzLCBheGlzLmdyaWRPZmZzZXQsIGNoYXJ0UmVjdFtheGlzLmNvdW50ZXJVbml0cy5sZW5dKCksIGdyaWRHcm91cCwgW1xuICAgICAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLmdyaWQsXG4gICAgICAgICAgICBvcHRpb25zLmNsYXNzTmFtZXNbYXhpcy51bml0cy5kaXJdXG4gICAgICAgICAgXSwgZXZlbnRFbWl0dGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGF4aXNPcHRpb25zLnNob3dMYWJlbCkge1xuICAgICAgICAgIENoYXJ0aXN0LmNyZWF0ZUxhYmVsKHByb2plY3RlZFZhbHVlLCBpbmRleCwgbGFiZWxWYWx1ZXMsIGF4aXMsIGF4aXNPcHRpb25zLm9mZnNldCwgYXhpcy5sYWJlbE9mZnNldCwgbGFiZWxHcm91cCwgW1xuICAgICAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLmxhYmVsLFxuICAgICAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzW2F4aXMudW5pdHMuZGlyXVxuICAgICAgICAgIF0sIHVzZUZvcmVpZ25PYmplY3QsIGV2ZW50RW1pdHRlcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQcm92aWRlcyBvcHRpb25zIGhhbmRsaW5nIGZ1bmN0aW9uYWxpdHkgd2l0aCBjYWxsYmFjayBmb3Igb3B0aW9ucyBjaGFuZ2VzIHRyaWdnZXJlZCBieSByZXNwb25zaXZlIG9wdGlvbnMgYW5kIG1lZGlhIHF1ZXJ5IG1hdGNoZXNcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5Db3JlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBzZXQgYnkgdXNlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHJlc3BvbnNpdmVPcHRpb25zIE9wdGlvbmFsIGZ1bmN0aW9ucyB0byBhZGQgcmVzcG9uc2l2ZSBiZWhhdmlvciB0byBjaGFydFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudEVtaXR0ZXIgVGhlIGV2ZW50IGVtaXR0ZXIgdGhhdCB3aWxsIGJlIHVzZWQgdG8gZW1pdCB0aGUgb3B0aW9ucyBjaGFuZ2VkIGV2ZW50c1xuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNvbnNvbGlkYXRlZCBvcHRpb25zIG9iamVjdCBmcm9tIHRoZSBkZWZhdWx0cywgYmFzZSBhbmQgbWF0Y2hpbmcgcmVzcG9uc2l2ZSBvcHRpb25zXG4gICAgICovXG4gICAgQ2hhcnRpc3Qub3B0aW9uc1Byb3ZpZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zLCBldmVudEVtaXR0ZXIpIHtcbiAgICAgIHZhciBiYXNlT3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgb3B0aW9ucyksXG4gICAgICAgIGN1cnJlbnRPcHRpb25zLFxuICAgICAgICBtZWRpYVF1ZXJ5TGlzdGVuZXJzID0gW10sXG4gICAgICAgIGk7XG5cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZUN1cnJlbnRPcHRpb25zKCkge1xuICAgICAgICB2YXIgcHJldmlvdXNPcHRpb25zID0gY3VycmVudE9wdGlvbnM7XG4gICAgICAgIGN1cnJlbnRPcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBiYXNlT3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNpdmVPcHRpb25zKSB7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IHJlc3BvbnNpdmVPcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbXFsID0gd2luZG93Lm1hdGNoTWVkaWEocmVzcG9uc2l2ZU9wdGlvbnNbaV1bMF0pO1xuICAgICAgICAgICAgaWYgKG1xbC5tYXRjaGVzKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRPcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKGN1cnJlbnRPcHRpb25zLCByZXNwb25zaXZlT3B0aW9uc1tpXVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoZXZlbnRFbWl0dGVyKSB7XG4gICAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ29wdGlvbnNDaGFuZ2VkJywge1xuICAgICAgICAgICAgcHJldmlvdXNPcHRpb25zOiBwcmV2aW91c09wdGlvbnMsXG4gICAgICAgICAgICBjdXJyZW50T3B0aW9uczogY3VycmVudE9wdGlvbnNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzKCkge1xuICAgICAgICBtZWRpYVF1ZXJ5TGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obXFsKSB7XG4gICAgICAgICAgbXFsLnJlbW92ZUxpc3RlbmVyKHVwZGF0ZUN1cnJlbnRPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghd2luZG93Lm1hdGNoTWVkaWEpIHtcbiAgICAgICAgdGhyb3cgJ3dpbmRvdy5tYXRjaE1lZGlhIG5vdCBmb3VuZCEgTWFrZSBzdXJlIHlvdVxcJ3JlIHVzaW5nIGEgcG9seWZpbGwuJztcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2l2ZU9wdGlvbnMpIHtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmVzcG9uc2l2ZU9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgbXFsID0gd2luZG93Lm1hdGNoTWVkaWEocmVzcG9uc2l2ZU9wdGlvbnNbaV1bMF0pO1xuICAgICAgICAgIG1xbC5hZGRMaXN0ZW5lcih1cGRhdGVDdXJyZW50T3B0aW9ucyk7XG4gICAgICAgICAgbWVkaWFRdWVyeUxpc3RlbmVycy5wdXNoKG1xbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEV4ZWN1dGUgaW5pdGlhbGx5IHNvIHdlIGdldCB0aGUgY29ycmVjdCBvcHRpb25zXG4gICAgICB1cGRhdGVDdXJyZW50T3B0aW9ucygpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBnZXQgY3VycmVudE9wdGlvbnMoKSB7XG4gICAgICAgICAgcmV0dXJuIENoYXJ0aXN0LmV4dGVuZCh7fSwgY3VycmVudE9wdGlvbnMpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzOiByZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzXG4gICAgICB9O1xuICAgIH07XG5cbiAgICAvL2h0dHA6Ly9zY2hlcGVycy5jYy9nZXR0aW5nLXRvLXRoZS1wb2ludFxuICAgIENoYXJ0aXN0LmNhdG11bGxSb20yYmV6aWVyID0gZnVuY3Rpb24gKGNycCwgeikge1xuICAgICAgdmFyIGQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gY3JwLmxlbmd0aDsgaUxlbiAtIDIgKiAheiA+IGk7IGkgKz0gMikge1xuICAgICAgICB2YXIgcCA9IFtcbiAgICAgICAgICB7eDogK2NycFtpIC0gMl0sIHk6ICtjcnBbaSAtIDFdfSxcbiAgICAgICAgICB7eDogK2NycFtpXSwgeTogK2NycFtpICsgMV19LFxuICAgICAgICAgIHt4OiArY3JwW2kgKyAyXSwgeTogK2NycFtpICsgM119LFxuICAgICAgICAgIHt4OiArY3JwW2kgKyA0XSwgeTogK2NycFtpICsgNV19XG4gICAgICAgIF07XG4gICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICBwWzBdID0ge3g6ICtjcnBbaUxlbiAtIDJdLCB5OiArY3JwW2lMZW4gLSAxXX07XG4gICAgICAgICAgfSBlbHNlIGlmIChpTGVuIC0gNCA9PT0gaSkge1xuICAgICAgICAgICAgcFszXSA9IHt4OiArY3JwWzBdLCB5OiArY3JwWzFdfTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGlMZW4gLSAyID09PSBpKSB7XG4gICAgICAgICAgICBwWzJdID0ge3g6ICtjcnBbMF0sIHk6ICtjcnBbMV19O1xuICAgICAgICAgICAgcFszXSA9IHt4OiArY3JwWzJdLCB5OiArY3JwWzNdfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGlMZW4gLSA0ID09PSBpKSB7XG4gICAgICAgICAgICBwWzNdID0gcFsyXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFpKSB7XG4gICAgICAgICAgICBwWzBdID0ge3g6ICtjcnBbaV0sIHk6ICtjcnBbaSArIDFdfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZC5wdXNoKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgICgtcFswXS54ICsgNiAqIHBbMV0ueCArIHBbMl0ueCkgLyA2LFxuICAgICAgICAgICAgKC1wWzBdLnkgKyA2ICogcFsxXS55ICsgcFsyXS55KSAvIDYsXG4gICAgICAgICAgICAocFsxXS54ICsgNiAqIHBbMl0ueCAtIHBbM10ueCkgLyA2LFxuICAgICAgICAgICAgKHBbMV0ueSArIDYgKiBwWzJdLnkgLSBwWzNdLnkpIC8gNixcbiAgICAgICAgICAgIHBbMl0ueCxcbiAgICAgICAgICAgIHBbMl0ueVxuICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGQ7XG4gICAgfTtcblxuICB9KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG4gIDsvKipcbiAgICogQ2hhcnRpc3QgcGF0aCBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogQG1vZHVsZSBDaGFydGlzdC5JbnRlcnBvbGF0aW9uXG4gICAqL1xuICAvKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbiAgKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbiA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIGRvZXMgbm90IHNtb290aCB0aGUgcGF0aCBhbmQgdGhlIHJlc3VsdCBpcyBvbmx5IGNvbnRhaW5pbmcgbGluZXMgYW5kIG5vIGN1cnZlcy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAgICovXG4gICAgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5ub25lID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gY2FyZGluYWwocGF0aENvb3JkaW5hdGVzKSB7XG4gICAgICAgIHZhciBwYXRoID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKCkubW92ZShwYXRoQ29vcmRpbmF0ZXNbMF0sIHBhdGhDb29yZGluYXRlc1sxXSk7XG5cbiAgICAgICAgZm9yKHZhciBpID0gMzsgaSA8IHBhdGhDb29yZGluYXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgIHBhdGgubGluZShwYXRoQ29vcmRpbmF0ZXNbaSAtIDFdLCBwYXRoQ29vcmRpbmF0ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTaW1wbGUgc21vb3RoaW5nIGNyZWF0ZXMgaG9yaXpvbnRhbCBoYW5kbGVzIHRoYXQgYXJlIHBvc2l0aW9uZWQgd2l0aCBhIGZyYWN0aW9uIG9mIHRoZSBsZW5ndGggYmV0d2VlbiB0d28gZGF0YSBwb2ludHMuIFlvdSBjYW4gdXNlIHRoZSBkaXZpc29yIG9wdGlvbiB0byBzcGVjaWZ5IHRoZSBhbW91bnQgb2Ygc21vb3RoaW5nLlxuICAgICAqXG4gICAgICogU2ltcGxlIHNtb290aGluZyBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIGBDaGFydGlzdC5TbW9vdGhpbmcuY2FyZGluYWxgIGlmIHlvdSdkIGxpa2UgdG8gZ2V0IHJpZCBvZiB0aGUgYXJ0aWZhY3RzIGl0IHByb2R1Y2VzIHNvbWV0aW1lcy4gU2ltcGxlIHNtb290aGluZyBwcm9kdWNlcyBsZXNzIGZsb3dpbmcgbGluZXMgYnV0IGlzIGFjY3VyYXRlIGJ5IGhpdHRpbmcgdGhlIHBvaW50cyBhbmQgaXQgYWxzbyBkb2Vzbid0IHN3aW5nIGJlbG93IG9yIGFib3ZlIHRoZSBnaXZlbiBkYXRhIHBvaW50LlxuICAgICAqXG4gICAgICogQWxsIHNtb290aGluZyBmdW5jdGlvbnMgd2l0aGluIENoYXJ0aXN0IGFyZSBmYWN0b3J5IGZ1bmN0aW9ucyB0aGF0IGFjY2VwdCBhbiBvcHRpb25zIHBhcmFtZXRlci4gVGhlIHNpbXBsZSBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIGFjY2VwdHMgb25lIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyIGBkaXZpc29yYCwgYmV0d2VlbiAxIGFuZCDiiJ4sIHdoaWNoIGNvbnRyb2xzIHRoZSBzbW9vdGhpbmcgY2hhcmFjdGVyaXN0aWNzLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgY2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0Jywge1xuICAgICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNV0sXG4gICAgICogICBzZXJpZXM6IFtbMSwgMiwgOCwgMSwgN11dXG4gICAgICogfSwge1xuICAgICAqICAgbGluZVNtb290aDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5zaW1wbGUoe1xuICAgICAqICAgICBkaXZpc29yOiAyXG4gICAgICogICB9KVxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9mIHRoZSBzaW1wbGUgaW50ZXJwb2xhdGlvbiBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgIENoYXJ0aXN0LkludGVycG9sYXRpb24uc2ltcGxlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgICBkaXZpc29yOiAyXG4gICAgICB9O1xuICAgICAgb3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICB2YXIgZCA9IDEgLyBNYXRoLm1heCgxLCBvcHRpb25zLmRpdmlzb3IpO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gc2ltcGxlKHBhdGhDb29yZGluYXRlcykge1xuICAgICAgICB2YXIgcGF0aCA9IG5ldyBDaGFydGlzdC5TdmcuUGF0aCgpLm1vdmUocGF0aENvb3JkaW5hdGVzWzBdLCBwYXRoQ29vcmRpbmF0ZXNbMV0pO1xuXG4gICAgICAgIGZvcih2YXIgaSA9IDI7IGkgPCBwYXRoQ29vcmRpbmF0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICB2YXIgcHJldlggPSBwYXRoQ29vcmRpbmF0ZXNbaSAtIDJdLFxuICAgICAgICAgICAgICBwcmV2WSA9IHBhdGhDb29yZGluYXRlc1tpIC0gMV0sXG4gICAgICAgICAgICAgIGN1cnJYID0gcGF0aENvb3JkaW5hdGVzW2ldLFxuICAgICAgICAgICAgICBjdXJyWSA9IHBhdGhDb29yZGluYXRlc1tpICsgMV0sXG4gICAgICAgICAgICAgIGxlbmd0aCA9IChjdXJyWCAtIHByZXZYKSAqIGQ7XG5cbiAgICAgICAgICBwYXRoLmN1cnZlKFxuICAgICAgICAgICAgcHJldlggKyBsZW5ndGgsXG4gICAgICAgICAgICBwcmV2WSxcbiAgICAgICAgICAgIGN1cnJYIC0gbGVuZ3RoLFxuICAgICAgICAgICAgY3VyclksXG4gICAgICAgICAgICBjdXJyWCxcbiAgICAgICAgICAgIGN1cnJZXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FyZGluYWwgLyBDYXRtdWxsLVJvbWUgc3BsaW5lIGludGVycG9sYXRpb24gaXMgdGhlIGRlZmF1bHQgc21vb3RoaW5nIGZ1bmN0aW9uIGluIENoYXJ0aXN0LiBJdCBwcm9kdWNlcyBuaWNlIHJlc3VsdHMgd2hlcmUgdGhlIHNwbGluZXMgd2lsbCBhbHdheXMgbWVldCB0aGUgcG9pbnRzLiBJdCBwcm9kdWNlcyBzb21lIGFydGlmYWN0cyB0aG91Z2ggd2hlbiBkYXRhIHZhbHVlcyBhcmUgaW5jcmVhc2VkIG9yIGRlY3JlYXNlZCByYXBpZGx5LiBUaGUgbGluZSBtYXkgbm90IGZvbGxvdyBhIHZlcnkgYWNjdXJhdGUgcGF0aCBhbmQgaWYgdGhlIGxpbmUgc2hvdWxkIGJlIGFjY3VyYXRlIHRoaXMgc21vb3RoaW5nIGZ1bmN0aW9uIGRvZXMgbm90IHByb2R1Y2UgdGhlIGJlc3QgcmVzdWx0cy5cbiAgICAgKlxuICAgICAqIENhcmRpbmFsIHNwbGluZXMgY2FuIG9ubHkgYmUgY3JlYXRlZCBpZiB0aGVyZSBhcmUgbW9yZSB0aGFuIHR3byBkYXRhIHBvaW50cy4gSWYgdGhpcyBpcyBub3QgdGhlIGNhc2UgdGhpcyBzbW9vdGhpbmcgd2lsbCBmYWxsYmFjayB0byBgQ2hhcnRpc3QuU21vb3RoaW5nLm5vbmVgLlxuICAgICAqXG4gICAgICogQWxsIHNtb290aGluZyBmdW5jdGlvbnMgd2l0aGluIENoYXJ0aXN0IGFyZSBmYWN0b3J5IGZ1bmN0aW9ucyB0aGF0IGFjY2VwdCBhbiBvcHRpb25zIHBhcmFtZXRlci4gVGhlIGNhcmRpbmFsIGludGVycG9sYXRpb24gZnVuY3Rpb24gYWNjZXB0cyBvbmUgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXIgYHRlbnNpb25gLCBiZXR3ZWVuIDAgYW5kIDEsIHdoaWNoIGNvbnRyb2xzIHRoZSBzbW9vdGhpbmcgaW50ZW5zaXR5LlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgY2hhcnQgPSBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0Jywge1xuICAgICAqICAgbGFiZWxzOiBbMSwgMiwgMywgNCwgNV0sXG4gICAgICogICBzZXJpZXM6IFtbMSwgMiwgOCwgMSwgN11dXG4gICAgICogfSwge1xuICAgICAqICAgbGluZVNtb290aDogQ2hhcnRpc3QuSW50ZXJwb2xhdGlvbi5jYXJkaW5hbCh7XG4gICAgICogICAgIHRlbnNpb246IDFcbiAgICAgKiAgIH0pXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuSW50ZXJwb2xhdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9mIHRoZSBjYXJkaW5hbCBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgIENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICAgIHRlbnNpb246IDFcbiAgICAgIH07XG5cbiAgICAgIG9wdGlvbnMgPSBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcblxuICAgICAgdmFyIHQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBvcHRpb25zLnRlbnNpb24pKSxcbiAgICAgICAgYyA9IDEgLSB0O1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gY2FyZGluYWwocGF0aENvb3JkaW5hdGVzKSB7XG4gICAgICAgIC8vIElmIGxlc3MgdGhhbiB0d28gcG9pbnRzIHdlIG5lZWQgdG8gZmFsbGJhY2sgdG8gbm8gc21vb3RoaW5nXG4gICAgICAgIGlmKHBhdGhDb29yZGluYXRlcy5sZW5ndGggPD0gNCkge1xuICAgICAgICAgIHJldHVybiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLm5vbmUoKShwYXRoQ29vcmRpbmF0ZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBhdGggPSBuZXcgQ2hhcnRpc3QuU3ZnLlBhdGgoKS5tb3ZlKHBhdGhDb29yZGluYXRlc1swXSwgcGF0aENvb3JkaW5hdGVzWzFdKSxcbiAgICAgICAgICB6O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gcGF0aENvb3JkaW5hdGVzLmxlbmd0aDsgaUxlbiAtIDIgKiAheiA+IGk7IGkgKz0gMikge1xuICAgICAgICAgIHZhciBwID0gW1xuICAgICAgICAgICAge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaSAtIDJdLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgLSAxXX0sXG4gICAgICAgICAgICB7eDogK3BhdGhDb29yZGluYXRlc1tpXSwgeTogK3BhdGhDb29yZGluYXRlc1tpICsgMV19LFxuICAgICAgICAgICAge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDJdLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgKyAzXX0sXG4gICAgICAgICAgICB7eDogK3BhdGhDb29yZGluYXRlc1tpICsgNF0sIHk6ICtwYXRoQ29vcmRpbmF0ZXNbaSArIDVdfVxuICAgICAgICAgIF07XG4gICAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgIGlmICghaSkge1xuICAgICAgICAgICAgICBwWzBdID0ge3g6ICtwYXRoQ29vcmRpbmF0ZXNbaUxlbiAtIDJdLCB5OiArcGF0aENvb3JkaW5hdGVzW2lMZW4gLSAxXX07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlMZW4gLSA0ID09PSBpKSB7XG4gICAgICAgICAgICAgIHBbM10gPSB7eDogK3BhdGhDb29yZGluYXRlc1swXSwgeTogK3BhdGhDb29yZGluYXRlc1sxXX07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlMZW4gLSAyID09PSBpKSB7XG4gICAgICAgICAgICAgIHBbMl0gPSB7eDogK3BhdGhDb29yZGluYXRlc1swXSwgeTogK3BhdGhDb29yZGluYXRlc1sxXX07XG4gICAgICAgICAgICAgIHBbM10gPSB7eDogK3BhdGhDb29yZGluYXRlc1syXSwgeTogK3BhdGhDb29yZGluYXRlc1szXX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpTGVuIC0gNCA9PT0gaSkge1xuICAgICAgICAgICAgICBwWzNdID0gcFsyXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWkpIHtcbiAgICAgICAgICAgICAgcFswXSA9IHt4OiArcGF0aENvb3JkaW5hdGVzW2ldLCB5OiArcGF0aENvb3JkaW5hdGVzW2kgKyAxXX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcGF0aC5jdXJ2ZShcbiAgICAgICAgICAgICh0ICogKC1wWzBdLnggKyA2ICogcFsxXS54ICsgcFsyXS54KSAvIDYpICsgKGMgKiBwWzJdLngpLFxuICAgICAgICAgICAgKHQgKiAoLXBbMF0ueSArIDYgKiBwWzFdLnkgKyBwWzJdLnkpIC8gNikgKyAoYyAqIHBbMl0ueSksXG4gICAgICAgICAgICAodCAqIChwWzFdLnggKyA2ICogcFsyXS54IC0gcFszXS54KSAvIDYpICsgKGMgKiBwWzJdLngpLFxuICAgICAgICAgICAgKHQgKiAocFsxXS55ICsgNiAqIHBbMl0ueSAtIHBbM10ueSkgLyA2KSArIChjICogcFsyXS55KSxcbiAgICAgICAgICAgIHBbMl0ueCxcbiAgICAgICAgICAgIHBbMl0ueVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgIH07XG4gICAgfTtcblxuICB9KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG4gIDsvKipcbiAgICogQSB2ZXJ5IGJhc2ljIGV2ZW50IG1vZHVsZSB0aGF0IGhlbHBzIHRvIGdlbmVyYXRlIGFuZCBjYXRjaCBldmVudHMuXG4gICAqXG4gICAqIEBtb2R1bGUgQ2hhcnRpc3QuRXZlbnRcbiAgICovXG4gIC8qIGdsb2JhbCBDaGFydGlzdCAqL1xuICAoZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgQ2hhcnRpc3QuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGhhbmRsZXJzID0gW107XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkIGFuIGV2ZW50IGhhbmRsZXIgZm9yIGEgc3BlY2lmaWMgZXZlbnRcbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuRXZlbnRcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBBIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gYWRkRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXJzW2V2ZW50XSA9IGhhbmRsZXJzW2V2ZW50XSB8fCBbXTtcbiAgICAgICAgaGFuZGxlcnNbZXZlbnRdLnB1c2goaGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXIgb2YgYSBzcGVjaWZpYyBldmVudCBuYW1lIG9yIHJlbW92ZSBhbGwgZXZlbnQgaGFuZGxlcnMgZm9yIGEgc3BlY2lmaWMgZXZlbnQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkV2ZW50XG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWUgd2hlcmUgYSBzcGVjaWZpYyBvciBhbGwgaGFuZGxlcnMgc2hvdWxkIGJlIHJlbW92ZWRcbiAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXSBBbiBvcHRpb25hbCBldmVudCBoYW5kbGVyIGZ1bmN0aW9uLiBJZiBzcGVjaWZpZWQgb25seSB0aGlzIHNwZWNpZmljIGhhbmRsZXIgd2lsbCBiZSByZW1vdmVkIGFuZCBvdGhlcndpc2UgYWxsIGhhbmRsZXJzIGFyZSByZW1vdmVkLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiByZW1vdmVFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgICAgLy8gT25seSBkbyBzb21ldGhpbmcgaWYgdGhlcmUgYXJlIGV2ZW50IGhhbmRsZXJzIHdpdGggdGhpcyBuYW1lIGV4aXN0aW5nXG4gICAgICAgIGlmKGhhbmRsZXJzW2V2ZW50XSkge1xuICAgICAgICAgIC8vIElmIGhhbmRsZXIgaXMgc2V0IHdlIHdpbGwgbG9vayBmb3IgYSBzcGVjaWZpYyBoYW5kbGVyIGFuZCBvbmx5IHJlbW92ZSB0aGlzXG4gICAgICAgICAgaWYoaGFuZGxlcikge1xuICAgICAgICAgICAgaGFuZGxlcnNbZXZlbnRdLnNwbGljZShoYW5kbGVyc1tldmVudF0uaW5kZXhPZihoYW5kbGVyKSwgMSk7XG4gICAgICAgICAgICBpZihoYW5kbGVyc1tldmVudF0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tldmVudF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIG5vIGhhbmRsZXIgaXMgc3BlY2lmaWVkIHdlIHJlbW92ZSBhbGwgaGFuZGxlcnMgZm9yIHRoaXMgZXZlbnRcbiAgICAgICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tldmVudF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gZW1pdCBhbiBldmVudC4gQWxsIGhhbmRsZXJzIHRoYXQgYXJlIGxpc3RlbmluZyBmb3IgdGhpcyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aXRoIHRoZSBkYXRhIHBhcmFtZXRlci5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuRXZlbnRcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZSB0aGF0IHNob3VsZCBiZSB0cmlnZ2VyZWRcbiAgICAgICAqIEBwYXJhbSB7Kn0gZGF0YSBBcmJpdHJhcnkgZGF0YSB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBldmVudCBoYW5kbGVyIGNhbGxiYWNrIGZ1bmN0aW9uc1xuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIC8vIE9ubHkgZG8gc29tZXRoaW5nIGlmIHRoZXJlIGFyZSBldmVudCBoYW5kbGVycyB3aXRoIHRoaXMgbmFtZSBleGlzdGluZ1xuICAgICAgICBpZihoYW5kbGVyc1tldmVudF0pIHtcbiAgICAgICAgICBoYW5kbGVyc1tldmVudF0uZm9yRWFjaChmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICAgICAgICBoYW5kbGVyKGRhdGEpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW1pdCBldmVudCB0byBzdGFyIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgIGlmKGhhbmRsZXJzWycqJ10pIHtcbiAgICAgICAgICBoYW5kbGVyc1snKiddLmZvckVhY2goZnVuY3Rpb24oc3RhckhhbmRsZXIpIHtcbiAgICAgICAgICAgIHN0YXJIYW5kbGVyKGV2ZW50LCBkYXRhKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBhZGRFdmVudEhhbmRsZXI6IGFkZEV2ZW50SGFuZGxlcixcbiAgICAgICAgcmVtb3ZlRXZlbnRIYW5kbGVyOiByZW1vdmVFdmVudEhhbmRsZXIsXG4gICAgICAgIGVtaXQ6IGVtaXRcbiAgICAgIH07XG4gICAgfTtcblxuICB9KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG4gIDsvKipcbiAgICogVGhpcyBtb2R1bGUgcHJvdmlkZXMgc29tZSBiYXNpYyBwcm90b3R5cGUgaW5oZXJpdGFuY2UgdXRpbGl0aWVzLlxuICAgKlxuICAgKiBAbW9kdWxlIENoYXJ0aXN0LkNsYXNzXG4gICAqL1xuICAvKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbiAgKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgZnVuY3Rpb24gbGlzdFRvQXJyYXkobGlzdCkge1xuICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgaWYgKGxpc3QubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGFyci5wdXNoKGxpc3RbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBleHRlbmQgZnJvbSBjdXJyZW50IHByb3RvdHlwZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5DbGFzc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzIFRoZSBvYmplY3QgdGhhdCBzZXJ2ZXMgYXMgZGVmaW5pdGlvbiBmb3IgdGhlIHByb3RvdHlwZSB0aGF0IGdldHMgY3JlYXRlZCBmb3IgdGhlIG5ldyBjbGFzcy4gVGhpcyBvYmplY3Qgc2hvdWxkIGFsd2F5cyBjb250YWluIGEgY29uc3RydWN0b3IgcHJvcGVydHkgdGhhdCBpcyB0aGUgZGVzaXJlZCBjb25zdHJ1Y3RvciBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgY2xhc3MuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtzdXBlclByb3RvT3ZlcnJpZGVdIEJ5IGRlZmF1bHQgZXh0ZW5zIHdpbGwgdXNlIHRoZSBjdXJyZW50IGNsYXNzIHByb3RvdHlwZSBvciBDaGFydGlzdC5jbGFzcy4gV2l0aCB0aGlzIHBhcmFtZXRlciB5b3UgY2FuIHNwZWNpZnkgYW55IHN1cGVyIHByb3RvdHlwZSB0aGF0IHdpbGwgYmUgdXNlZC5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQ29uc3RydWN0b3IgZnVuY3Rpb24gb2YgdGhlIG5ldyBjbGFzc1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgRnJ1aXQgPSBDbGFzcy5leHRlbmQoe1xuICAgICAgICogY29sb3I6IHVuZGVmaW5lZCxcbiAgICAgICAqICAgc3VnYXI6IHVuZGVmaW5lZCxcbiAgICAgICAqXG4gICAgICAgKiAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihjb2xvciwgc3VnYXIpIHtcbiAgICAgICAqICAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgICAgKiAgICAgdGhpcy5zdWdhciA9IHN1Z2FyO1xuICAgICAgICogICB9LFxuICAgICAgICpcbiAgICAgICAqICAgZWF0OiBmdW5jdGlvbigpIHtcbiAgICAgICAqICAgICB0aGlzLnN1Z2FyID0gMDtcbiAgICAgICAqICAgICByZXR1cm4gdGhpcztcbiAgICAgICAqICAgfVxuICAgICAgICogfSk7XG4gICAgICpcbiAgICAgKiB2YXIgQmFuYW5hID0gRnJ1aXQuZXh0ZW5kKHtcbiAgICAgICAqICAgbGVuZ3RoOiB1bmRlZmluZWQsXG4gICAgICAgKlxuICAgICAgICogICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24obGVuZ3RoLCBzdWdhcikge1xuICAgICAgICogICAgIEJhbmFuYS5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsICdZZWxsb3cnLCBzdWdhcik7XG4gICAgICAgKiAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICAgKiAgIH1cbiAgICAgICAqIH0pO1xuICAgICAqXG4gICAgICogdmFyIGJhbmFuYSA9IG5ldyBCYW5hbmEoMjAsIDQwKTtcbiAgICAgKiBjb25zb2xlLmxvZygnYmFuYW5hIGluc3RhbmNlb2YgRnJ1aXQnLCBiYW5hbmEgaW5zdGFuY2VvZiBGcnVpdCk7XG4gICAgICogY29uc29sZS5sb2coJ0ZydWl0IGlzIHByb3RvdHlwZSBvZiBiYW5hbmEnLCBGcnVpdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihiYW5hbmEpKTtcbiAgICAgKiBjb25zb2xlLmxvZygnYmFuYW5hcyBwcm90b3R5cGUgaXMgRnJ1aXQnLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYmFuYW5hKSA9PT0gRnJ1aXQucHJvdG90eXBlKTtcbiAgICAgKiBjb25zb2xlLmxvZyhiYW5hbmEuc3VnYXIpO1xuICAgICAqIGNvbnNvbGUubG9nKGJhbmFuYS5lYXQoKS5zdWdhcik7XG4gICAgICogY29uc29sZS5sb2coYmFuYW5hLmNvbG9yKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBleHRlbmQocHJvcGVydGllcywgc3VwZXJQcm90b092ZXJyaWRlKSB7XG4gICAgICB2YXIgc3VwZXJQcm90byA9IHN1cGVyUHJvdG9PdmVycmlkZSB8fCB0aGlzLnByb3RvdHlwZSB8fCBDaGFydGlzdC5DbGFzcztcbiAgICAgIHZhciBwcm90byA9IE9iamVjdC5jcmVhdGUoc3VwZXJQcm90byk7XG5cbiAgICAgIENoYXJ0aXN0LkNsYXNzLmNsb25lRGVmaW5pdGlvbnMocHJvdG8sIHByb3BlcnRpZXMpO1xuXG4gICAgICB2YXIgY29uc3RyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmbiA9IHByb3RvLmNvbnN0cnVjdG9yIHx8IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICAgIGluc3RhbmNlO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgbGlua2VkIHRvIHRoZSBDaGFydGlzdCBuYW1lc3BhY2UgdGhlIGNvbnN0cnVjdG9yIHdhcyBub3QgY2FsbGVkIHdpdGggbmV3XG4gICAgICAgIC8vIFRvIHByb3ZpZGUgYSBmYWxsYmFjayB3ZSB3aWxsIGluc3RhbnRpYXRlIGhlcmUgYW5kIHJldHVybiB0aGUgaW5zdGFuY2VcbiAgICAgICAgaW5zdGFuY2UgPSB0aGlzID09PSBDaGFydGlzdCA/IE9iamVjdC5jcmVhdGUocHJvdG8pIDogdGhpcztcbiAgICAgICAgZm4uYXBwbHkoaW5zdGFuY2UsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkpO1xuXG4gICAgICAgIC8vIElmIHRoaXMgY29uc3RydWN0b3Igd2FzIG5vdCBjYWxsZWQgd2l0aCBuZXcgd2UgbmVlZCB0byByZXR1cm4gdGhlIGluc3RhbmNlXG4gICAgICAgIC8vIFRoaXMgd2lsbCBub3QgaGFybSB3aGVuIHRoZSBjb25zdHJ1Y3RvciBoYXMgYmVlbiBjYWxsZWQgd2l0aCBuZXcgYXMgdGhlIHJldHVybmVkIHZhbHVlIGlzIGlnbm9yZWRcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgfTtcblxuICAgICAgY29uc3RyLnByb3RvdHlwZSA9IHByb3RvO1xuICAgICAgY29uc3RyLnN1cGVyID0gc3VwZXJQcm90bztcbiAgICAgIGNvbnN0ci5leHRlbmQgPSB0aGlzLmV4dGVuZDtcblxuICAgICAgcmV0dXJuIGNvbnN0cjtcbiAgICB9XG5cbiAgICAvLyBWYXJpYWJsZSBhcmd1bWVudCBsaXN0IGNsb25lcyBhcmdzID4gMCBpbnRvIGFyZ3NbMF0gYW5kIHJldHJ1bnMgbW9kaWZpZWQgYXJnc1swXVxuICAgIGZ1bmN0aW9uIGNsb25lRGVmaW5pdGlvbnMoKSB7XG4gICAgICB2YXIgYXJncyA9IGxpc3RUb0FycmF5KGFyZ3VtZW50cyk7XG4gICAgICB2YXIgdGFyZ2V0ID0gYXJnc1swXTtcblxuICAgICAgYXJncy5zcGxpY2UoMSwgYXJncy5sZW5ndGggLSAxKS5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgICAgICAgIC8vIElmIHRoaXMgcHJvcGVydHkgYWxyZWFkeSBleGlzdCBpbiB0YXJnZXQgd2UgZGVsZXRlIGl0IGZpcnN0XG4gICAgICAgICAgZGVsZXRlIHRhcmdldFtwcm9wTmFtZV07XG4gICAgICAgICAgLy8gRGVmaW5lIHRoZSBwcm9wZXJ0eSB3aXRoIHRoZSBkZXNjcmlwdG9yIGZyb20gc291cmNlXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcE5hbWUsXG4gICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgcHJvcE5hbWUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBDaGFydGlzdC5DbGFzcyA9IHtcbiAgICAgIGV4dGVuZDogZXh0ZW5kLFxuICAgICAgY2xvbmVEZWZpbml0aW9uczogY2xvbmVEZWZpbml0aW9uc1xuICAgIH07XG5cbiAgfSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuICA7LyoqXG4gICAqIEJhc2UgZm9yIGFsbCBjaGFydCB0eXBlcy4gVGhlIG1ldGhvZHMgaW4gQ2hhcnRpc3QuQmFzZSBhcmUgaW5oZXJpdGVkIHRvIGFsbCBjaGFydCB0eXBlcy5cbiAgICpcbiAgICogQG1vZHVsZSBDaGFydGlzdC5CYXNlXG4gICAqL1xuICAvKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbiAgKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gVE9ETzogQ3VycmVudGx5IHdlIG5lZWQgdG8gcmUtZHJhdyB0aGUgY2hhcnQgb24gd2luZG93IHJlc2l6ZS4gVGhpcyBpcyB1c3VhbGx5IHZlcnkgYmFkIGFuZCB3aWxsIGFmZmVjdCBwZXJmb3JtYW5jZS5cbiAgICAvLyBUaGlzIGlzIGRvbmUgYmVjYXVzZSB3ZSBjYW4ndCB3b3JrIHdpdGggcmVsYXRpdmUgY29vcmRpbmF0ZXMgd2hlbiBkcmF3aW5nIHRoZSBjaGFydCBiZWNhdXNlIFNWRyBQYXRoIGRvZXMgbm90XG4gICAgLy8gd29yayB3aXRoIHJlbGF0aXZlIHBvc2l0aW9ucyB5ZXQuIFdlIG5lZWQgdG8gY2hlY2sgaWYgd2UgY2FuIGRvIGEgdmlld0JveCBoYWNrIHRvIHN3aXRjaCB0byBwZXJjZW50YWdlLlxuICAgIC8vIFNlZSBodHRwOi8vbW96aWxsYS42NTA2Lm43Lm5hYmJsZS5jb20vU3BlY3lmaW5nLXBhdGhzLXdpdGgtcGVyY2VudGFnZXMtdW5pdC10ZDI0NzQ3NC5odG1sXG4gICAgLy8gVXBkYXRlOiBjYW4gYmUgZG9uZSB1c2luZyB0aGUgYWJvdmUgbWV0aG9kIHRlc3RlZCBoZXJlOiBodHRwOi8vY29kZXBlbi5pby9naW9ua3Vuei9wZW4vS0R2TGpcbiAgICAvLyBUaGUgcHJvYmxlbSBpcyB3aXRoIHRoZSBsYWJlbCBvZmZzZXRzIHRoYXQgY2FuJ3QgYmUgY29udmVydGVkIGludG8gcGVyY2VudGFnZSBhbmQgYWZmZWN0aW5nIHRoZSBjaGFydCBjb250YWluZXJcbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBjaGFydCB3aGljaCBjdXJyZW50bHkgZG9lcyBhIGZ1bGwgcmVjb25zdHJ1Y3Rpb24gb2YgdGhlIFNWRyBET01cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gT3B0aW9uYWwgZGF0YSB5b3UnZCBsaWtlIHRvIHNldCBmb3IgdGhlIGNoYXJ0IGJlZm9yZSBpdCB3aWxsIHVwZGF0ZS4gSWYgbm90IHNwZWNpZmllZCB0aGUgdXBkYXRlIG1ldGhvZCB3aWxsIHVzZSB0aGUgZGF0YSB0aGF0IGlzIGFscmVhZHkgY29uZmlndXJlZCB3aXRoIHRoZSBjaGFydC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgeW91J2QgbGlrZSB0byBhZGQgdG8gdGhlIHByZXZpb3VzIG9wdGlvbnMgZm9yIHRoZSBjaGFydCBiZWZvcmUgaXQgd2lsbCB1cGRhdGUuIElmIG5vdCBzcGVjaWZpZWQgdGhlIHVwZGF0ZSBtZXRob2Qgd2lsbCB1c2UgdGhlIG9wdGlvbnMgdGhhdCBoYXZlIGJlZW4gYWxyZWFkeSBjb25maWd1cmVkIHdpdGggdGhlIGNoYXJ0LlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2V4dGVuZE9iamVjdHNdIElmIHNldCB0byB0cnVlLCB0aGUgcGFzc2VkIG9wdGlvbnMgd2lsbCBiZSB1c2VkIHRvIGV4dGVuZCB0aGUgb3B0aW9ucyB0aGF0IGhhdmUgYmVlbiBjb25maWd1cmVkIGFscmVhZHkuXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1cGRhdGUoZGF0YSwgb3B0aW9ucywgZXh0ZW5kT2JqZWN0cykge1xuICAgICAgaWYoZGF0YSkge1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICAvLyBFdmVudCBmb3IgZGF0YSB0cmFuc2Zvcm1hdGlvbiB0aGF0IGFsbG93cyB0byBtYW5pcHVsYXRlIHRoZSBkYXRhIGJlZm9yZSBpdCBnZXRzIHJlbmRlcmVkIGluIHRoZSBjaGFydHNcbiAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZGF0YScsIHtcbiAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBleHRlbmRPYmplY3RzID8gdGhpcy5vcHRpb25zIDoge30sIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIElmIGNoYXJ0aXN0IHdhcyBub3QgaW5pdGlhbGl6ZWQgeWV0LCB3ZSBqdXN0IHNldCB0aGUgb3B0aW9ucyBhbmQgbGVhdmUgdGhlIHJlc3QgdG8gdGhlIGluaXRpYWxpemF0aW9uXG4gICAgICAgIGlmKCF0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQpIHtcbiAgICAgICAgICB0aGlzLm9wdGlvbnNQcm92aWRlci5yZW1vdmVNZWRpYVF1ZXJ5TGlzdGVuZXJzKCk7XG4gICAgICAgICAgdGhpcy5vcHRpb25zUHJvdmlkZXIgPSBDaGFydGlzdC5vcHRpb25zUHJvdmlkZXIodGhpcy5vcHRpb25zLCB0aGlzLnJlc3BvbnNpdmVPcHRpb25zLCB0aGlzLmV2ZW50RW1pdHRlcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT25seSByZS1jcmVhdGVkIHRoZSBjaGFydCBpZiBpdCBoYXMgYmVlbiBpbml0aWFsaXplZCB5ZXRcbiAgICAgIGlmKCF0aGlzLmluaXRpYWxpemVUaW1lb3V0SWQpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVDaGFydCh0aGlzLm9wdGlvbnNQcm92aWRlci5jdXJyZW50T3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgY2hhcnQgb2JqZWN0IHRvIGNoYWluIHVwIGNhbGxzXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgY2FsbGVkIG9uIHRoZSBBUEkgb2JqZWN0IG9mIGVhY2ggY2hhcnQgYW5kIHdpbGwgdW4tcmVnaXN0ZXIgYWxsIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlcmUgYWRkZWQgdG8gb3RoZXIgY29tcG9uZW50cy4gVGhpcyBjdXJyZW50bHkgaW5jbHVkZXMgYSB3aW5kb3cucmVzaXplIGxpc3RlbmVyIGFzIHdlbGwgYXMgbWVkaWEgcXVlcnkgbGlzdGVuZXJzIGlmIGFueSByZXNwb25zaXZlIG9wdGlvbnMgaGF2ZSBiZWVuIHByb3ZpZGVkLiBVc2UgdGhpcyBmdW5jdGlvbiBpZiB5b3UgbmVlZCB0byBkZXN0cm95IGFuZCByZWNyZWF0ZSBDaGFydGlzdCBjaGFydHMgZHluYW1pY2FsbHkuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRldGFjaCgpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZUxpc3RlbmVyKTtcbiAgICAgIHRoaXMub3B0aW9uc1Byb3ZpZGVyLnJlbW92ZU1lZGlhUXVlcnlMaXN0ZW5lcnMoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzLiBUaGUgaGFuZGxlciBjYWxsYmFja3MgYXJlIHN5bmNocm9ub3VzIGFuZCB3aWxsIHJ1biBpbiB0aGUgbWFpbiB0aHJlYWQgcmF0aGVyIHRoYW4gdGhlIGV2ZW50IGxvb3AuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFzZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC4gQ2hlY2sgdGhlIGV4YW1wbGVzIGZvciBzdXBwb3J0ZWQgZXZlbnRzLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgVGhlIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIGFuIGV2ZW50IHdpdGggdGhlIGdpdmVuIG5hbWUgd2FzIGVtaXR0ZWQuIFRoaXMgZnVuY3Rpb24gd2lsbCByZWNlaXZlIGEgZGF0YSBhcmd1bWVudCB3aGljaCBjb250YWlucyBldmVudCBkYXRhLiBTZWUgdGhlIGV4YW1wbGUgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvbihldmVudCwgaGFuZGxlcikge1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuYWRkRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIHVuLXJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzLiBJZiB0aGUgaGFuZGxlciBmdW5jdGlvbiBwYXJhbWV0ZXIgaXMgb21pdHRlZCBhbGwgaGFuZGxlcnMgZm9yIHRoZSBnaXZlbiBldmVudCB3aWxsIGJlIHVuLXJlZ2lzdGVyZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuQmFzZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudCBmb3Igd2hpY2ggYSBoYW5kbGVyIHNob3VsZCBiZSByZW1vdmVkXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdIFRoZSBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgdGhhdCB3YXMgcHJldmlvdXNseSB1c2VkIHRvIHJlZ2lzdGVyIGEgbmV3IGV2ZW50IGhhbmRsZXIuIFRoaXMgaGFuZGxlciB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnQgaGFuZGxlciBsaXN0LiBJZiB0aGlzIHBhcmFtZXRlciBpcyBvbWl0dGVkIHRoZW4gYWxsIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgZ2l2ZW4gZXZlbnQgYXJlIHJlbW92ZWQgZnJvbSB0aGUgbGlzdC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvZmYoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLnJlbW92ZUV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgICAgLy8gQWRkIHdpbmRvdyByZXNpemUgbGlzdGVuZXIgdGhhdCByZS1jcmVhdGVzIHRoZSBjaGFydFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplTGlzdGVuZXIpO1xuXG4gICAgICAvLyBPYnRhaW4gY3VycmVudCBvcHRpb25zIGJhc2VkIG9uIG1hdGNoaW5nIG1lZGlhIHF1ZXJpZXMgKGlmIHJlc3BvbnNpdmUgb3B0aW9ucyBhcmUgZ2l2ZW4pXG4gICAgICAvLyBUaGlzIHdpbGwgYWxzbyByZWdpc3RlciBhIGxpc3RlbmVyIHRoYXQgaXMgcmUtY3JlYXRpbmcgdGhlIGNoYXJ0IGJhc2VkIG9uIG1lZGlhIGNoYW5nZXNcbiAgICAgIHRoaXMub3B0aW9uc1Byb3ZpZGVyID0gQ2hhcnRpc3Qub3B0aW9uc1Byb3ZpZGVyKHRoaXMub3B0aW9ucywgdGhpcy5yZXNwb25zaXZlT3B0aW9ucywgdGhpcy5ldmVudEVtaXR0ZXIpO1xuICAgICAgLy8gUmVnaXN0ZXIgb3B0aW9ucyBjaGFuZ2UgbGlzdGVuZXIgdGhhdCB3aWxsIHRyaWdnZXIgYSBjaGFydCB1cGRhdGVcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmFkZEV2ZW50SGFuZGxlcignb3B0aW9uc0NoYW5nZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIEJlZm9yZSB0aGUgZmlyc3QgY2hhcnQgY3JlYXRpb24gd2UgbmVlZCB0byByZWdpc3RlciB1cyB3aXRoIGFsbCBwbHVnaW5zIHRoYXQgYXJlIGNvbmZpZ3VyZWRcbiAgICAgIC8vIEluaXRpYWxpemUgYWxsIHJlbGV2YW50IHBsdWdpbnMgd2l0aCBvdXIgY2hhcnQgb2JqZWN0IGFuZCB0aGUgcGx1Z2luIG9wdGlvbnMgc3BlY2lmaWVkIGluIHRoZSBjb25maWdcbiAgICAgIGlmKHRoaXMub3B0aW9ucy5wbHVnaW5zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5wbHVnaW5zLmZvckVhY2goZnVuY3Rpb24ocGx1Z2luKSB7XG4gICAgICAgICAgaWYocGx1Z2luIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHBsdWdpblswXSh0aGlzLCBwbHVnaW5bMV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbHVnaW4odGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgfVxuXG4gICAgICAvLyBFdmVudCBmb3IgZGF0YSB0cmFuc2Zvcm1hdGlvbiB0aGF0IGFsbG93cyB0byBtYW5pcHVsYXRlIHRoZSBkYXRhIGJlZm9yZSBpdCBnZXRzIHJlbmRlcmVkIGluIHRoZSBjaGFydHNcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RhdGEnLCB7XG4gICAgICAgIHR5cGU6ICdpbml0aWFsJyxcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgICB9KTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBmaXJzdCBjaGFydFxuICAgICAgdGhpcy5jcmVhdGVDaGFydCh0aGlzLm9wdGlvbnNQcm92aWRlci5jdXJyZW50T3B0aW9ucyk7XG5cbiAgICAgIC8vIEFzIGNoYXJ0IGlzIGluaXRpYWxpemVkIGZyb20gdGhlIGV2ZW50IGxvb3Agbm93IHdlIGNhbiByZXNldCBvdXIgdGltZW91dCByZWZlcmVuY2VcbiAgICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50IGlmIHRoZSBjaGFydCBnZXRzIGluaXRpYWxpemVkIG9uIHRoZSBzYW1lIGVsZW1lbnQgdHdpY2VcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBvZiBjaGFydCBiYXNlIGNsYXNzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHF1ZXJ5XG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEBwYXJhbSByZXNwb25zaXZlT3B0aW9uc1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEJhc2UocXVlcnksIGRhdGEsIG9wdGlvbnMsIHJlc3BvbnNpdmVPcHRpb25zKSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IENoYXJ0aXN0LnF1ZXJ5U2VsZWN0b3IocXVlcnkpO1xuICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICB0aGlzLnJlc3BvbnNpdmVPcHRpb25zID0gcmVzcG9uc2l2ZU9wdGlvbnM7XG4gICAgICB0aGlzLmV2ZW50RW1pdHRlciA9IENoYXJ0aXN0LkV2ZW50RW1pdHRlcigpO1xuICAgICAgdGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QgPSBDaGFydGlzdC5TdmcuaXNTdXBwb3J0ZWQoJ0V4dGVuc2liaWxpdHknKTtcbiAgICAgIHRoaXMuc3VwcG9ydHNBbmltYXRpb25zID0gQ2hhcnRpc3QuU3ZnLmlzU3VwcG9ydGVkKCdBbmltYXRpb25FdmVudHNBdHRyaWJ1dGUnKTtcbiAgICAgIHRoaXMucmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbiByZXNpemVMaXN0ZW5lcigpe1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICBpZih0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICAvLyBJZiBjaGFydGlzdCB3YXMgYWxyZWFkeSBpbml0aWFsaXplZCBpbiB0aGlzIGNvbnRhaW5lciB3ZSBhcmUgZGV0YWNoaW5nIGFsbCBldmVudCBsaXN0ZW5lcnMgZmlyc3RcbiAgICAgICAgaWYodGhpcy5jb250YWluZXIuX19jaGFydGlzdF9fKSB7XG4gICAgICAgICAgaWYodGhpcy5jb250YWluZXIuX19jaGFydGlzdF9fLmluaXRpYWxpemVUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBpbml0aWFsaXplVGltZW91dElkIGlzIHN0aWxsIHNldCB3ZSBjYW4gc2FmZWx5IGFzc3VtZSB0aGF0IHRoZSBpbml0aWFsaXphdGlvbiBmdW5jdGlvbiBoYXMgbm90XG4gICAgICAgICAgICAvLyBiZWVuIGNhbGxlZCB5ZXQgZnJvbSB0aGUgZXZlbnQgbG9vcC4gVGhlcmVmb3JlIHdlIHNob3VsZCBjYW5jZWwgdGhlIHRpbWVvdXQgYW5kIGRvbid0IG5lZWQgdG8gZGV0YWNoXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuY29udGFpbmVyLl9fY2hhcnRpc3RfXy5pbml0aWFsaXplVGltZW91dElkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHRpbWVvdXQgcmVmZXJlbmNlIGhhcyBhbHJlYWR5IGJlZW4gcmVzZXQgd2hpY2ggbWVhbnMgd2UgbmVlZCB0byBkZXRhY2ggdGhlIG9sZCBjaGFydCBmaXJzdFxuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuX19jaGFydGlzdF9fLmRldGFjaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29udGFpbmVyLl9fY2hhcnRpc3RfXyA9IHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIFVzaW5nIGV2ZW50IGxvb3AgZm9yIGZpcnN0IGRyYXcgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byByZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgaW4gdGhlIHNhbWUgY2FsbCBzdGFjayB3aGVyZVxuICAgICAgLy8gdGhlIGNoYXJ0IHdhcyBjcmVhdGVkLlxuICAgICAgdGhpcy5pbml0aWFsaXplVGltZW91dElkID0gc2V0VGltZW91dChpbml0aWFsaXplLmJpbmQodGhpcyksIDApO1xuICAgIH1cblxuICAgIC8vIENyZWF0aW5nIHRoZSBjaGFydCBiYXNlIGNsYXNzXG4gICAgQ2hhcnRpc3QuQmFzZSA9IENoYXJ0aXN0LkNsYXNzLmV4dGVuZCh7XG4gICAgICBjb25zdHJ1Y3RvcjogQmFzZSxcbiAgICAgIG9wdGlvbnNQcm92aWRlcjogdW5kZWZpbmVkLFxuICAgICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgICBzdmc6IHVuZGVmaW5lZCxcbiAgICAgIGV2ZW50RW1pdHRlcjogdW5kZWZpbmVkLFxuICAgICAgY3JlYXRlQ2hhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jhc2UgY2hhcnQgdHlwZSBjYW5cXCd0IGJlIGluc3RhbnRpYXRlZCEnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IHVwZGF0ZSxcbiAgICAgIGRldGFjaDogZGV0YWNoLFxuICAgICAgb246IG9uLFxuICAgICAgb2ZmOiBvZmYsXG4gICAgICB2ZXJzaW9uOiBDaGFydGlzdC52ZXJzaW9uLFxuICAgICAgc3VwcG9ydHNGb3JlaWduT2JqZWN0OiBmYWxzZVxuICAgIH0pO1xuXG4gIH0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbiAgOy8qKlxuICAgKiBDaGFydGlzdCBTVkcgbW9kdWxlIGZvciBzaW1wbGUgU1ZHIERPTSBhYnN0cmFjdGlvblxuICAgKlxuICAgKiBAbW9kdWxlIENoYXJ0aXN0LlN2Z1xuICAgKi9cbiAgLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4gIChmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBzdmdOcyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsXG4gICAgICB4bWxOcyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zLycsXG4gICAgICB4aHRtbE5zID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnO1xuXG4gICAgQ2hhcnRpc3QueG1sTnMgPSB7XG4gICAgICBxdWFsaWZpZWROYW1lOiAneG1sbnM6Y3QnLFxuICAgICAgcHJlZml4OiAnY3QnLFxuICAgICAgdXJpOiAnaHR0cDovL2dpb25rdW56LmdpdGh1Yi5jb20vY2hhcnRpc3QtanMvY3QnXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoYXJ0aXN0LlN2ZyBjcmVhdGVzIGEgbmV3IFNWRyBvYmplY3Qgd3JhcHBlciB3aXRoIGEgc3RhcnRpbmcgZWxlbWVudC4gWW91IGNhbiB1c2UgdGhlIHdyYXBwZXIgdG8gZmx1ZW50bHkgY3JlYXRlIHN1Yi1lbGVtZW50cyBhbmQgbW9kaWZ5IHRoZW0uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd8U1ZHRWxlbWVudH0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgU1ZHIGVsZW1lbnQgdG8gY3JlYXRlIG9yIGFuIFNWRyBkb20gZWxlbWVudCB3aGljaCBzaG91bGQgYmUgd3JhcHBlZCBpbnRvIENoYXJ0aXN0LlN2Z1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIEFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGFkZGVkIGFzIGF0dHJpYnV0ZXMgdG8gdGhlIFNWRyBlbGVtZW50IHRoYXQgaXMgY3JlYXRlZC4gQXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZXMgd2lsbCBub3QgYmUgYWRkZWQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBUaGlzIGNsYXNzIG9yIGNsYXNzIGxpc3Qgd2lsbCBiZSBhZGRlZCB0byB0aGUgU1ZHIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGFyZW50IFRoZSBwYXJlbnQgU1ZHIHdyYXBwZXIgb2JqZWN0IHdoZXJlIHRoaXMgbmV3bHkgY3JlYXRlZCB3cmFwcGVyIGFuZCBpdCdzIGVsZW1lbnQgd2lsbCBiZSBhdHRhY2hlZCB0byBhcyBjaGlsZFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5zZXJ0Rmlyc3QgSWYgdGhpcyBwYXJhbSBpcyBzZXQgdG8gdHJ1ZSBpbiBjb25qdW5jdGlvbiB3aXRoIGEgcGFyZW50IGVsZW1lbnQgdGhlIG5ld2x5IGNyZWF0ZWQgZWxlbWVudCB3aWxsIGJlIGFkZGVkIGFzIGZpcnN0IGNoaWxkIGVsZW1lbnQgaW4gdGhlIHBhcmVudCBlbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gU3ZnKG5hbWUsIGF0dHJpYnV0ZXMsIGNsYXNzTmFtZSwgcGFyZW50LCBpbnNlcnRGaXJzdCkge1xuICAgICAgLy8gSWYgU3ZnIGlzIGdldHRpbmcgY2FsbGVkIHdpdGggYW4gU1ZHIGVsZW1lbnQgd2UganVzdCByZXR1cm4gdGhlIHdyYXBwZXJcbiAgICAgIGlmKG5hbWUgaW5zdGFuY2VvZiBTVkdFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX25vZGUgPSBuYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhzdmdOcywgbmFtZSk7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhbiBTVkcgZWxlbWVudCBjcmVhdGVkIHRoZW4gY3VzdG9tIG5hbWVzcGFjZVxuICAgICAgICBpZihuYW1lID09PSAnc3ZnJykge1xuICAgICAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlTlMoeG1sTnMsIENoYXJ0aXN0LnhtbE5zLnF1YWxpZmllZE5hbWUsIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgdGhpcy5hdHRyKGF0dHJpYnV0ZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgdGhpcy5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYocGFyZW50KSB7XG4gICAgICAgICAgaWYgKGluc2VydEZpcnN0ICYmIHBhcmVudC5fbm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBwYXJlbnQuX25vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuX25vZGUsIHBhcmVudC5fbm9kZS5maXJzdENoaWxkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyZW50Ll9ub2RlLmFwcGVuZENoaWxkKHRoaXMuX25vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhdHRyaWJ1dGVzIG9uIHRoZSBjdXJyZW50IFNWRyBlbGVtZW50IG9mIHRoZSB3cmFwcGVyIHlvdSdyZSBjdXJyZW50bHkgd29ya2luZyBvbi5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGF0dHJpYnV0ZXMgQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgYWRkZWQgYXMgYXR0cmlidXRlcyB0byB0aGUgU1ZHIGVsZW1lbnQgdGhhdCBpcyBjcmVhdGVkLiBBdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlcyB3aWxsIG5vdCBiZSBhZGRlZC4gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgYSBTdHJpbmcgdGhlbiB0aGUgZnVuY3Rpb24gaXMgdXNlZCBhcyBhIGdldHRlciBhbmQgd2lsbCByZXR1cm4gdGhlIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbnMgSWYgc3BlY2lmaWVkLCB0aGUgYXR0cmlidXRlcyB3aWxsIGJlIHNldCBhcyBuYW1lc3BhY2UgYXR0cmlidXRlcyB3aXRoIG5zIGFzIHByZWZpeC5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R8U3RyaW5nfSBUaGUgY3VycmVudCB3cmFwcGVyIG9iamVjdCB3aWxsIGJlIHJldHVybmVkIHNvIGl0IGNhbiBiZSB1c2VkIGZvciBjaGFpbmluZyBvciB0aGUgYXR0cmlidXRlIHZhbHVlIGlmIHVzZWQgYXMgZ2V0dGVyIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGF0dHIoYXR0cmlidXRlcywgbnMpIHtcbiAgICAgIGlmKHR5cGVvZiBhdHRyaWJ1dGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZihucykge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9ub2RlLmdldEF0dHJpYnV0ZU5TKG5zLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgLy8gSWYgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBpcyB1bmRlZmluZWQgd2UgY2FuIHNraXAgdGhpcyBvbmVcbiAgICAgICAgaWYoYXR0cmlidXRlc1trZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihucykge1xuICAgICAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlTlMobnMsIFtDaGFydGlzdC54bWxOcy5wcmVmaXgsICc6Jywga2V5XS5qb2luKCcnKSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBTVkcgZWxlbWVudCB3aG9zZSB3cmFwcGVyIG9iamVjdCB3aWxsIGJlIHNlbGVjdGVkIGZvciBmdXJ0aGVyIG9wZXJhdGlvbnMuIFRoaXMgd2F5IHlvdSBjYW4gYWxzbyBjcmVhdGUgbmVzdGVkIGdyb3VwcyBlYXNpbHkuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIFNWRyBlbGVtZW50IHRoYXQgc2hvdWxkIGJlIGNyZWF0ZWQgYXMgY2hpbGQgZWxlbWVudCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGVsZW1lbnQgd3JhcHBlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbYXR0cmlidXRlc10gQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgYWRkZWQgYXMgYXR0cmlidXRlcyB0byB0aGUgU1ZHIGVsZW1lbnQgdGhhdCBpcyBjcmVhdGVkLiBBdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlcyB3aWxsIG5vdCBiZSBhZGRlZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2NsYXNzTmFtZV0gVGhpcyBjbGFzcyBvciBjbGFzcyBsaXN0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIFNWRyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbaW5zZXJ0Rmlyc3RdIElmIHRoaXMgcGFyYW0gaXMgc2V0IHRvIHRydWUgaW4gY29uanVuY3Rpb24gd2l0aCBhIHBhcmVudCBlbGVtZW50IHRoZSBuZXdseSBjcmVhdGVkIGVsZW1lbnQgd2lsbCBiZSBhZGRlZCBhcyBmaXJzdCBjaGlsZCBlbGVtZW50IGluIHRoZSBwYXJlbnQgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gUmV0dXJucyBhIENoYXJ0aXN0LlN2ZyB3cmFwcGVyIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIG1vZGlmeSB0aGUgY29udGFpbmluZyBTVkcgZGF0YVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVsZW0obmFtZSwgYXR0cmlidXRlcywgY2xhc3NOYW1lLCBpbnNlcnRGaXJzdCkge1xuICAgICAgcmV0dXJuIG5ldyBDaGFydGlzdC5TdmcobmFtZSwgYXR0cmlidXRlcywgY2xhc3NOYW1lLCB0aGlzLCBpbnNlcnRGaXJzdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcGFyZW50IENoYXJ0aXN0LlNWRyB3cmFwcGVyIG9iamVjdFxuICAgICAqXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBSZXR1cm5zIGEgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIgYXJvdW5kIHRoZSBwYXJlbnQgbm9kZSBvZiB0aGUgY3VycmVudCBub2RlLiBJZiB0aGUgcGFyZW50IG5vZGUgaXMgbm90IGV4aXN0aW5nIG9yIGl0J3Mgbm90IGFuIFNWRyBub2RlIHRoZW4gdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiBudWxsLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBhcmVudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ub2RlLnBhcmVudE5vZGUgaW5zdGFuY2VvZiBTVkdFbGVtZW50ID8gbmV3IENoYXJ0aXN0LlN2Zyh0aGlzLl9ub2RlLnBhcmVudE5vZGUpIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIgYXJvdW5kIHRoZSByb290IFNWRyBlbGVtZW50IG9mIHRoZSBjdXJyZW50IHRyZWUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSByb290IFNWRyBlbGVtZW50IHdyYXBwZWQgaW4gYSBDaGFydGlzdC5TdmcgZWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJvb3QoKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGU7XG4gICAgICB3aGlsZShub2RlLm5vZGVOYW1lICE9PSAnc3ZnJykge1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDaGFydGlzdC5Tdmcobm9kZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgZmlyc3QgY2hpbGQgU1ZHIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgZWxlbWVudCB0aGF0IG1hdGNoZXMgYSBDU1Mgc2VsZWN0b3IuIFRoZSByZXR1cm5lZCBvYmplY3QgaXMgYSBDaGFydGlzdC5Tdmcgd3JhcHBlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBBIENTUyBzZWxlY3RvciB0aGF0IGlzIHVzZWQgdG8gcXVlcnkgZm9yIGNoaWxkIFNWRyBlbGVtZW50c1xuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIFNWRyB3cmFwcGVyIGZvciB0aGUgZWxlbWVudCBmb3VuZCBvciBudWxsIGlmIG5vIGVsZW1lbnQgd2FzIGZvdW5kXG4gICAgICovXG4gICAgZnVuY3Rpb24gcXVlcnlTZWxlY3RvcihzZWxlY3Rvcikge1xuICAgICAgdmFyIGZvdW5kTm9kZSA9IHRoaXMuX25vZGUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICByZXR1cm4gZm91bmROb2RlID8gbmV3IENoYXJ0aXN0LlN2Zyhmb3VuZE5vZGUpIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHRoZSBhbGwgY2hpbGQgU1ZHIGVsZW1lbnRzIG9mIHRoZSBjdXJyZW50IGVsZW1lbnQgdGhhdCBtYXRjaCBhIENTUyBzZWxlY3Rvci4gVGhlIHJldHVybmVkIG9iamVjdCBpcyBhIENoYXJ0aXN0LlN2Zy5MaXN0IHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgQSBDU1Mgc2VsZWN0b3IgdGhhdCBpcyB1c2VkIHRvIHF1ZXJ5IGZvciBjaGlsZCBTVkcgZWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuTGlzdH0gVGhlIFNWRyB3cmFwcGVyIGxpc3QgZm9yIHRoZSBlbGVtZW50IGZvdW5kIG9yIG51bGwgaWYgbm8gZWxlbWVudCB3YXMgZm91bmRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgZm91bmROb2RlcyA9IHRoaXMuX25vZGUucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICByZXR1cm4gZm91bmROb2Rlcy5sZW5ndGggPyBuZXcgQ2hhcnRpc3QuU3ZnLkxpc3QoZm91bmROb2RlcykgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBmb3JlaWduT2JqZWN0IChzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvU1ZHL0VsZW1lbnQvZm9yZWlnbk9iamVjdCkgdGhhdCBhbGxvd3MgdG8gZW1iZWQgSFRNTCBjb250ZW50IGludG8gYSBTVkcgZ3JhcGhpYy4gV2l0aCB0aGUgaGVscCBvZiBmb3JlaWduT2JqZWN0cyB5b3UgY2FuIGVuYWJsZSB0aGUgdXNhZ2Ugb2YgcmVndWxhciBIVE1MIGVsZW1lbnRzIGluc2lkZSBvZiBTVkcgd2hlcmUgdGhleSBhcmUgc3ViamVjdCBmb3IgU1ZHIHBvc2l0aW9uaW5nIGFuZCB0cmFuc2Zvcm1hdGlvbiBidXQgdGhlIEJyb3dzZXIgd2lsbCB1c2UgdGhlIEhUTUwgcmVuZGVyaW5nIGNhcGFiaWxpdGllcyBmb3IgdGhlIGNvbnRhaW5pbmcgRE9NLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgICAqIEBwYXJhbSB7Tm9kZXxTdHJpbmd9IGNvbnRlbnQgVGhlIERPTSBOb2RlLCBvciBIVE1MIHN0cmluZyB0aGF0IHdpbGwgYmUgY29udmVydGVkIHRvIGEgRE9NIE5vZGUsIHRoYXQgaXMgdGhlbiBwbGFjZWQgaW50byBhbmQgd3JhcHBlZCBieSB0aGUgZm9yZWlnbk9iamVjdFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbYXR0cmlidXRlc10gQW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgYWRkZWQgYXMgYXR0cmlidXRlcyB0byB0aGUgZm9yZWlnbk9iamVjdCBlbGVtZW50IHRoYXQgaXMgY3JlYXRlZC4gQXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZXMgd2lsbCBub3QgYmUgYWRkZWQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtjbGFzc05hbWVdIFRoaXMgY2xhc3Mgb3IgY2xhc3MgbGlzdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBTVkcgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2luc2VydEZpcnN0XSBTcGVjaWZpZXMgaWYgdGhlIGZvcmVpZ25PYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIGFzIGZpcnN0IGNoaWxkXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBOZXcgd3JhcHBlciBvYmplY3QgdGhhdCB3cmFwcyB0aGUgZm9yZWlnbk9iamVjdCBlbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gZm9yZWlnbk9iamVjdChjb250ZW50LCBhdHRyaWJ1dGVzLCBjbGFzc05hbWUsIGluc2VydEZpcnN0KSB7XG4gICAgICAvLyBJZiBjb250ZW50IGlzIHN0cmluZyB0aGVuIHdlIGNvbnZlcnQgaXQgdG8gRE9NXG4gICAgICAvLyBUT0RPOiBIYW5kbGUgY2FzZSB3aGVyZSBjb250ZW50IGlzIG5vdCBhIHN0cmluZyBub3IgYSBET00gTm9kZVxuICAgICAgaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgICAgIGNvbnRlbnQgPSBjb250YWluZXIuZmlyc3RDaGlsZDtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkaW5nIG5hbWVzcGFjZSB0byBjb250ZW50IGVsZW1lbnRcbiAgICAgIGNvbnRlbnQuc2V0QXR0cmlidXRlKCd4bWxucycsIHhodG1sTnMpO1xuXG4gICAgICAvLyBDcmVhdGluZyB0aGUgZm9yZWlnbk9iamVjdCB3aXRob3V0IHJlcXVpcmVkIGV4dGVuc2lvbiBhdHRyaWJ1dGUgKGFzIGRlc2NyaWJlZCBoZXJlXG4gICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvZXh0ZW5kLmh0bWwjRm9yZWlnbk9iamVjdEVsZW1lbnQpXG4gICAgICB2YXIgZm5PYmogPSB0aGlzLmVsZW0oJ2ZvcmVpZ25PYmplY3QnLCBhdHRyaWJ1dGVzLCBjbGFzc05hbWUsIGluc2VydEZpcnN0KTtcblxuICAgICAgLy8gQWRkIGNvbnRlbnQgdG8gZm9yZWlnbk9iamVjdEVsZW1lbnRcbiAgICAgIGZuT2JqLl9ub2RlLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgICByZXR1cm4gZm5PYmo7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgYWRkcyBhIG5ldyB0ZXh0IGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgQ2hhcnRpc3QuU3ZnIHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHQgVGhlIHRleHQgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHRleHQgZWxlbWVudCB0aGF0IGlzIGNyZWF0ZWRcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSBzYW1lIHdyYXBwZXIgb2JqZWN0IHRoYXQgd2FzIHVzZWQgdG8gYWRkIHRoZSBuZXdseSBjcmVhdGVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0ZXh0KHQpIHtcbiAgICAgIHRoaXMuX25vZGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodCkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgd2lsbCBjbGVhciBhbGwgY2hpbGQgbm9kZXMgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgc2FtZSB3cmFwcGVyIG9iamVjdCB0aGF0IGdvdCBlbXB0aWVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgICB3aGlsZSAodGhpcy5fbm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHRoaXMuX25vZGUucmVtb3ZlQ2hpbGQodGhpcy5fbm9kZS5maXJzdENoaWxkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgd2lsbCBjYXVzZSB0aGUgY3VycmVudCB3cmFwcGVyIHRvIHJlbW92ZSBpdHNlbGYgZnJvbSBpdHMgcGFyZW50IHdyYXBwZXIuIFVzZSB0aGlzIG1ldGhvZCBpZiB5b3UnZCBsaWtlIHRvIGdldCByaWQgb2YgYW4gZWxlbWVudCBpbiBhIGdpdmVuIERPTSBzdHJ1Y3R1cmUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgcGFyZW50IHdyYXBwZXIgb2JqZWN0IG9mIHRoZSBlbGVtZW50IHRoYXQgZ290IHJlbW92ZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICB0aGlzLl9ub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fbm9kZSk7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIHJlcGxhY2UgdGhlIGVsZW1lbnQgd2l0aCBhIG5ldyBlbGVtZW50IHRoYXQgY2FuIGJlIGNyZWF0ZWQgb3V0c2lkZSBvZiB0aGUgY3VycmVudCBET00uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQHBhcmFtIHtDaGFydGlzdC5Tdmd9IG5ld0VsZW1lbnQgVGhlIG5ldyBDaGFydGlzdC5Tdmcgb2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgdGhlIGN1cnJlbnQgd3JhcHBlciBvYmplY3RcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSB3cmFwcGVyIG9mIHRoZSBuZXcgZWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlcGxhY2UobmV3RWxlbWVudCkge1xuICAgICAgdGhpcy5fbm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdFbGVtZW50Ll9ub2RlLCB0aGlzLl9ub2RlKTtcbiAgICAgIHJldHVybiBuZXdFbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHdpbGwgYXBwZW5kIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgZWxlbWVudCBhcyBhIGNoaWxkLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgICAqIEBwYXJhbSB7Q2hhcnRpc3QuU3ZnfSBlbGVtZW50IFRoZSBDaGFydGlzdC5TdmcgZWxlbWVudCB0aGF0IHNob3VsZCBiZSBhZGRlZCBhcyBhIGNoaWxkXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbaW5zZXJ0Rmlyc3RdIFNwZWNpZmllcyBpZiB0aGUgZWxlbWVudCBzaG91bGQgYmUgaW5zZXJ0ZWQgYXMgZmlyc3QgY2hpbGRcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5Tdmd9IFRoZSB3cmFwcGVyIG9mIHRoZSBhcHBlbmRlZCBvYmplY3RcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhcHBlbmQoZWxlbWVudCwgaW5zZXJ0Rmlyc3QpIHtcbiAgICAgIGlmKGluc2VydEZpcnN0ICYmIHRoaXMuX25vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICB0aGlzLl9ub2RlLmluc2VydEJlZm9yZShlbGVtZW50Ll9ub2RlLCB0aGlzLl9ub2RlLmZpcnN0Q2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbm9kZS5hcHBlbmRDaGlsZChlbGVtZW50Ll9ub2RlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBjbGFzcyBuYW1lcyB0aGF0IGFyZSBhdHRhY2hlZCB0byB0aGUgY3VycmVudCB3cmFwcGVyIGVsZW1lbnQuIFRoaXMgbWV0aG9kIGNhbiBub3QgYmUgY2hhaW5lZCBmdXJ0aGVyLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgICAqIEByZXR1cm4ge0FycmF5fSBBIGxpc3Qgb2YgY2xhc3NlcyBvciBhbiBlbXB0eSBhcnJheSBpZiB0aGVyZSBhcmUgbm8gY2xhc3NlcyBvbiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gY2xhc3NlcygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ub2RlLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSA/IHRoaXMuX25vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpLnRyaW0oKS5zcGxpdCgvXFxzKy8pIDogW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBvbmUgb3IgYSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzc2VzIHRvIHRoZSBjdXJyZW50IGVsZW1lbnQgYW5kIGVuc3VyZXMgdGhlIGNsYXNzZXMgYXJlIG9ubHkgZXhpc3Rpbmcgb25jZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXMgQSB3aGl0ZSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzcyBuYW1lc1xuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIHdyYXBwZXIgb2YgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFkZENsYXNzKG5hbWVzKSB7XG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLFxuICAgICAgICB0aGlzLmNsYXNzZXModGhpcy5fbm9kZSlcbiAgICAgICAgICAuY29uY2F0KG5hbWVzLnRyaW0oKS5zcGxpdCgvXFxzKy8pKVxuICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZWxlbSwgcG9zLCBzZWxmKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5pbmRleE9mKGVsZW0pID09PSBwb3M7XG4gICAgICAgICAgfSkuam9pbignICcpXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIG9uZSBvciBhIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzZXMgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lcyBBIHdoaXRlIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzIG5hbWVzXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgd3JhcHBlciBvZiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MobmFtZXMpIHtcbiAgICAgIHZhciByZW1vdmVkQ2xhc3NlcyA9IG5hbWVzLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuXG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCB0aGlzLmNsYXNzZXModGhpcy5fbm9kZSkuZmlsdGVyKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHJlbW92ZWRDbGFzc2VzLmluZGV4T2YobmFtZSkgPT09IC0xO1xuICAgICAgfSkuam9pbignICcpKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgY2xhc3NlcyBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnfSBUaGUgd3JhcHBlciBvZiB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsQ2xhc3NlcygpIHtcbiAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKCdjbGFzcycsICcnKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGVsZW1lbnQgaGVpZ2h0IHdpdGggZmFsbGJhY2sgdG8gc3ZnIEJvdW5kaW5nQm94IG9yIHBhcmVudCBjb250YWluZXIgZGltZW5zaW9uczpcbiAgICAgKiBTZWUgW2J1Z3ppbGxhLm1vemlsbGEub3JnXShodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01MzA5ODUpXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBUaGUgZWxlbWVudHMgaGVpZ2h0IGluIHBpeGVsc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhlaWdodCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ub2RlLmNsaWVudEhlaWdodCB8fCBNYXRoLnJvdW5kKHRoaXMuX25vZGUuZ2V0QkJveCgpLmhlaWdodCkgfHwgdGhpcy5fbm9kZS5wYXJlbnROb2RlLmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgZWxlbWVudCB3aWR0aCB3aXRoIGZhbGxiYWNrIHRvIHN2ZyBCb3VuZGluZ0JveCBvciBwYXJlbnQgY29udGFpbmVyIGRpbWVuc2lvbnM6XG4gICAgICogU2VlIFtidWd6aWxsYS5tb3ppbGxhLm9yZ10oaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NTMwOTg1KVxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkNvcmVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBlbGVtZW50cyB3aWR0aCBpbiBwaXhlbHNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3aWR0aCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ub2RlLmNsaWVudFdpZHRoIHx8IE1hdGgucm91bmQodGhpcy5fbm9kZS5nZXRCQm94KCkud2lkdGgpIHx8IHRoaXMuX25vZGUucGFyZW50Tm9kZS5jbGllbnRXaWR0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYW5pbWF0ZSBmdW5jdGlvbiBsZXRzIHlvdSBhbmltYXRlIHRoZSBjdXJyZW50IGVsZW1lbnQgd2l0aCBTTUlMIGFuaW1hdGlvbnMuIFlvdSBjYW4gYWRkIGFuaW1hdGlvbnMgZm9yIG11bHRpcGxlIGF0dHJpYnV0ZXMgYXQgdGhlIHNhbWUgdGltZSBieSB1c2luZyBhbiBhbmltYXRpb24gZGVmaW5pdGlvbiBvYmplY3QuIFRoaXMgb2JqZWN0IHNob3VsZCBjb250YWluIFNNSUwgYW5pbWF0aW9uIGF0dHJpYnV0ZXMuIFBsZWFzZSByZWZlciB0byBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvYW5pbWF0ZS5odG1sIGZvciBhIGRldGFpbGVkIHNwZWNpZmljYXRpb24gYWJvdXQgdGhlIGF2YWlsYWJsZSBhbmltYXRpb24gYXR0cmlidXRlcy4gQWRkaXRpb25hbGx5IGFuIGVhc2luZyBwcm9wZXJ0eSBjYW4gYmUgcGFzc2VkIGluIHRoZSBhbmltYXRpb24gZGVmaW5pdGlvbiBvYmplY3QuIFRoaXMgY2FuIGJlIGEgc3RyaW5nIHdpdGggYSBuYW1lIG9mIGFuIGVhc2luZyBmdW5jdGlvbiBpbiBgQ2hhcnRpc3QuU3ZnLkVhc2luZ2Agb3IgYW4gYXJyYXkgd2l0aCBmb3VyIG51bWJlcnMgc3BlY2lmeWluZyBhIGN1YmljIELDqXppZXIgY3VydmUuXG4gICAgICogKipBbiBhbmltYXRpb25zIG9iamVjdCBjb3VsZCBsb29rIGxpa2UgdGhpczoqKlxuICAgICAqIGBgYGphdmFzY3JpcHRcbiAgICAgKiBlbGVtZW50LmFuaW1hdGUoe1xuICAgICAqICAgb3BhY2l0eToge1xuICAgICAqICAgICBkdXI6IDEwMDAsXG4gICAgICogICAgIGZyb206IDAsXG4gICAgICogICAgIHRvOiAxXG4gICAgICogICB9LFxuICAgICAqICAgeDE6IHtcbiAgICAgKiAgICAgZHVyOiAnMTAwMG1zJyxcbiAgICAgKiAgICAgZnJvbTogMTAwLFxuICAgICAqICAgICB0bzogMjAwLFxuICAgICAqICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhcnQnXG4gICAgICogICB9LFxuICAgICAqICAgeTE6IHtcbiAgICAgKiAgICAgZHVyOiAnMnMnLFxuICAgICAqICAgICBmcm9tOiAwLFxuICAgICAqICAgICB0bzogMTAwXG4gICAgICogICB9XG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICogKipBdXRvbWF0aWMgdW5pdCBjb252ZXJzaW9uKipcbiAgICAgKiBGb3IgdGhlIGBkdXJgIGFuZCB0aGUgYGJlZ2luYCBhbmltYXRlIGF0dHJpYnV0ZSB5b3UgY2FuIGFsc28gb21pdCBhIHVuaXQgYnkgcGFzc2luZyBhIG51bWJlci4gVGhlIG51bWJlciB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgY29udmVydGVkIHRvIG1pbGxpIHNlY29uZHMuXG4gICAgICogKipHdWlkZWQgbW9kZSoqXG4gICAgICogVGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgU01JTCBhbmltYXRpb25zIHdpdGggb2Zmc2V0IHVzaW5nIHRoZSBgYmVnaW5gIGF0dHJpYnV0ZSBpcyB0aGF0IHRoZSBhdHRyaWJ1dGUgd2lsbCBrZWVwIGl0J3Mgb3JpZ2luYWwgdmFsdWUgdW50aWwgdGhlIGFuaW1hdGlvbiBzdGFydHMuIE1vc3RseSB0aGlzIGJlaGF2aW9yIGlzIG5vdCBkZXNpcmVkIGFzIHlvdSdkIGxpa2UgdG8gaGF2ZSB5b3VyIGVsZW1lbnQgYXR0cmlidXRlcyBhbHJlYWR5IGluaXRpYWxpemVkIHdpdGggdGhlIGFuaW1hdGlvbiBgZnJvbWAgdmFsdWUgZXZlbiBiZWZvcmUgdGhlIGFuaW1hdGlvbiBzdGFydHMuIEFsc28gaWYgeW91IGRvbid0IHNwZWNpZnkgYGZpbGw9XCJmcmVlemVcImAgb24gYW4gYW5pbWF0ZSBlbGVtZW50IG9yIGlmIHlvdSBkZWxldGUgdGhlIGFuaW1hdGlvbiBhZnRlciBpdCdzIGRvbmUgKHdoaWNoIGlzIGRvbmUgaW4gZ3VpZGVkIG1vZGUpIHRoZSBhdHRyaWJ1dGUgd2lsbCBzd2l0Y2ggYmFjayB0byB0aGUgaW5pdGlhbCB2YWx1ZS4gVGhpcyBiZWhhdmlvciBpcyBhbHNvIG5vdCBkZXNpcmVkIHdoZW4gcGVyZm9ybWluZyBzaW1wbGUgb25lLXRpbWUgYW5pbWF0aW9ucy4gRm9yIG9uZS10aW1lIGFuaW1hdGlvbnMgeW91J2Qgd2FudCB0byB0cmlnZ2VyIGFuaW1hdGlvbnMgaW1tZWRpYXRlbHkgaW5zdGVhZCBvZiByZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQgYmVnaW4gdGltZS4gVGhhdCdzIHdoeSBpbiBndWlkZWQgbW9kZSBDaGFydGlzdC5Tdmcgd2lsbCBhbHNvIHVzZSB0aGUgYGJlZ2luYCBwcm9wZXJ0eSB0byBzY2hlZHVsZSBhIHRpbWVvdXQgYW5kIG1hbnVhbGx5IHN0YXJ0IHRoZSBhbmltYXRpb24gYWZ0ZXIgdGhlIHRpbWVvdXQuIElmIHlvdSdyZSB1c2luZyBtdWx0aXBsZSBTTUlMIGRlZmluaXRpb24gb2JqZWN0cyBmb3IgYW4gYXR0cmlidXRlIChpbiBhbiBhcnJheSksIGd1aWRlZCBtb2RlIHdpbGwgYmUgZGlzYWJsZWQgZm9yIHRoaXMgYXR0cmlidXRlLCBldmVuIGlmIHlvdSBleHBsaWNpdGx5IGVuYWJsZWQgaXQuXG4gICAgICogSWYgZ3VpZGVkIG1vZGUgaXMgZW5hYmxlZCB0aGUgZm9sbG93aW5nIGJlaGF2aW9yIGlzIGFkZGVkOlxuICAgICAqIC0gQmVmb3JlIHRoZSBhbmltYXRpb24gc3RhcnRzIChldmVuIHdoZW4gZGVsYXllZCB3aXRoIGBiZWdpbmApIHRoZSBhbmltYXRlZCBhdHRyaWJ1dGUgd2lsbCBiZSBzZXQgYWxyZWFkeSB0byB0aGUgYGZyb21gIHZhbHVlIG9mIHRoZSBhbmltYXRpb25cbiAgICAgKiAtIGBiZWdpbmAgaXMgZXhwbGljaXRseSBzZXQgdG8gYGluZGVmaW5pdGVgIHNvIGl0IGNhbiBiZSBzdGFydGVkIG1hbnVhbGx5IHdpdGhvdXQgcmVseWluZyBvbiBkb2N1bWVudCBiZWdpbiB0aW1lIChjcmVhdGlvbilcbiAgICAgKiAtIFRoZSBhbmltYXRlIGVsZW1lbnQgd2lsbCBiZSBmb3JjZWQgdG8gdXNlIGBmaWxsPVwiZnJlZXplXCJgXG4gICAgICogLSBUaGUgYW5pbWF0aW9uIHdpbGwgYmUgdHJpZ2dlcmVkIHdpdGggYGJlZ2luRWxlbWVudCgpYCBpbiBhIHRpbWVvdXQgd2hlcmUgYGJlZ2luYCBvZiB0aGUgZGVmaW5pdGlvbiBvYmplY3QgaXMgaW50ZXJwcmV0ZWQgaW4gbWlsbGkgc2Vjb25kcy4gSWYgbm8gYGJlZ2luYCB3YXMgc3BlY2lmaWVkIHRoZSB0aW1lb3V0IGlzIHRyaWdnZXJlZCBpbW1lZGlhdGVseS5cbiAgICAgKiAtIEFmdGVyIHRoZSBhbmltYXRpb24gdGhlIGVsZW1lbnQgYXR0cmlidXRlIHZhbHVlIHdpbGwgYmUgc2V0IHRvIHRoZSBgdG9gIHZhbHVlIG9mIHRoZSBhbmltYXRpb25cbiAgICAgKiAtIFRoZSBhbmltYXRlIGVsZW1lbnQgaXMgZGVsZXRlZCBmcm9tIHRoZSBET01cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYW5pbWF0aW9ucyBBbiBhbmltYXRpb25zIG9iamVjdCB3aGVyZSB0aGUgcHJvcGVydHkga2V5cyBhcmUgdGhlIGF0dHJpYnV0ZXMgeW91J2QgbGlrZSB0byBhbmltYXRlLiBUaGUgcHJvcGVydGllcyBzaG91bGQgYmUgb2JqZWN0cyBhZ2FpbiB0aGF0IGNvbnRhaW4gdGhlIFNNSUwgYW5pbWF0aW9uIGF0dHJpYnV0ZXMgKHVzdWFsbHkgYmVnaW4sIGR1ciwgZnJvbSwgYW5kIHRvKS4gVGhlIHByb3BlcnR5IGJlZ2luIGFuZCBkdXIgaXMgYXV0byBjb252ZXJ0ZWQgKHNlZSBBdXRvbWF0aWMgdW5pdCBjb252ZXJzaW9uKS4gWW91IGNhbiBhbHNvIHNjaGVkdWxlIG11bHRpcGxlIGFuaW1hdGlvbnMgZm9yIHRoZSBzYW1lIGF0dHJpYnV0ZSBieSBwYXNzaW5nIGFuIEFycmF5IG9mIFNNSUwgZGVmaW5pdGlvbiBvYmplY3RzLiBBdHRyaWJ1dGVzIHRoYXQgY29udGFpbiBhbiBhcnJheSBvZiBTTUlMIGRlZmluaXRpb24gb2JqZWN0cyB3aWxsIG5vdCBiZSBleGVjdXRlZCBpbiBndWlkZWQgbW9kZS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGd1aWRlZCBTcGVjaWZ5IGlmIGd1aWRlZCBtb2RlIHNob3VsZCBiZSBhY3RpdmF0ZWQgZm9yIHRoaXMgYW5pbWF0aW9uIChzZWUgR3VpZGVkIG1vZGUpLiBJZiBub3Qgb3RoZXJ3aXNlIHNwZWNpZmllZCwgZ3VpZGVkIG1vZGUgd2lsbCBiZSBhY3RpdmF0ZWQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RW1pdHRlciBJZiBzcGVjaWZpZWQsIHRoaXMgZXZlbnQgZW1pdHRlciB3aWxsIGJlIG5vdGlmaWVkIHdoZW4gYW4gYW5pbWF0aW9uIHN0YXJ0cyBvciBlbmRzLlxuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Z30gVGhlIGN1cnJlbnQgZWxlbWVudCB3aGVyZSB0aGUgYW5pbWF0aW9uIHdhcyBhZGRlZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFuaW1hdGUoYW5pbWF0aW9ucywgZ3VpZGVkLCBldmVudEVtaXR0ZXIpIHtcbiAgICAgIGlmKGd1aWRlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGd1aWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKGFuaW1hdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gY3JlYXRlQW5pbWF0ZUZvckF0dHJpYnV0ZXMoYXR0cmlidXRlKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlQW5pbWF0ZShhbmltYXRpb25EZWZpbml0aW9uLCBndWlkZWQpIHtcbiAgICAgICAgICB2YXIgYXR0cmlidXRlUHJvcGVydGllcyA9IHt9LFxuICAgICAgICAgICAgYW5pbWF0ZSxcbiAgICAgICAgICAgIHRpbWVvdXQsXG4gICAgICAgICAgICBlYXNpbmc7XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBhbiBlYXNpbmcgaXMgc3BlY2lmaWVkIGluIHRoZSBkZWZpbml0aW9uIG9iamVjdCBhbmQgZGVsZXRlIGl0IGZyb20gdGhlIG9iamVjdCBhcyBpdCB3aWxsIG5vdFxuICAgICAgICAgIC8vIGJlIHBhcnQgb2YgdGhlIGFuaW1hdGUgZWxlbWVudCBhdHRyaWJ1dGVzLlxuICAgICAgICAgIGlmKGFuaW1hdGlvbkRlZmluaXRpb24uZWFzaW5nKSB7XG4gICAgICAgICAgICAvLyBJZiBhbHJlYWR5IGFuIGVhc2luZyBCw6l6aWVyIGN1cnZlIGFycmF5IHdlIHRha2UgaXQgb3Igd2UgbG9va3VwIGEgZWFzaW5nIGFycmF5IGluIHRoZSBFYXNpbmcgb2JqZWN0XG4gICAgICAgICAgICBlYXNpbmcgPSBhbmltYXRpb25EZWZpbml0aW9uLmVhc2luZyBpbnN0YW5jZW9mIEFycmF5ID9cbiAgICAgICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5lYXNpbmcgOlxuICAgICAgICAgICAgICBDaGFydGlzdC5TdmcuRWFzaW5nW2FuaW1hdGlvbkRlZmluaXRpb24uZWFzaW5nXTtcbiAgICAgICAgICAgIGRlbGV0ZSBhbmltYXRpb25EZWZpbml0aW9uLmVhc2luZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiBudW1lcmljIGR1ciBvciBiZWdpbiB3YXMgcHJvdmlkZWQgd2UgYXNzdW1lIG1pbGxpIHNlY29uZHNcbiAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmJlZ2luID0gQ2hhcnRpc3QuZW5zdXJlVW5pdChhbmltYXRpb25EZWZpbml0aW9uLmJlZ2luLCAnbXMnKTtcbiAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmR1ciA9IENoYXJ0aXN0LmVuc3VyZVVuaXQoYW5pbWF0aW9uRGVmaW5pdGlvbi5kdXIsICdtcycpO1xuXG4gICAgICAgICAgaWYoZWFzaW5nKSB7XG4gICAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmNhbGNNb2RlID0gJ3NwbGluZSc7XG4gICAgICAgICAgICBhbmltYXRpb25EZWZpbml0aW9uLmtleVNwbGluZXMgPSBlYXNpbmcuam9pbignICcpO1xuICAgICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5rZXlUaW1lcyA9ICcwOzEnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFkZGluZyBcImZpbGw6IGZyZWV6ZVwiIGlmIHdlIGFyZSBpbiBndWlkZWQgbW9kZSBhbmQgc2V0IGluaXRpYWwgYXR0cmlidXRlIHZhbHVlc1xuICAgICAgICAgIGlmKGd1aWRlZCkge1xuICAgICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5maWxsID0gJ2ZyZWV6ZSc7XG4gICAgICAgICAgICAvLyBBbmltYXRlZCBwcm9wZXJ0eSBvbiBvdXIgZWxlbWVudCBzaG91bGQgYWxyZWFkeSBiZSBzZXQgdG8gdGhlIGFuaW1hdGlvbiBmcm9tIHZhbHVlIGluIGd1aWRlZCBtb2RlXG4gICAgICAgICAgICBhdHRyaWJ1dGVQcm9wZXJ0aWVzW2F0dHJpYnV0ZV0gPSBhbmltYXRpb25EZWZpbml0aW9uLmZyb207XG4gICAgICAgICAgICB0aGlzLmF0dHIoYXR0cmlidXRlUHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIC8vIEluIGd1aWRlZCBtb2RlIHdlIGFsc28gc2V0IGJlZ2luIHRvIGluZGVmaW5pdGUgc28gd2UgY2FuIHRyaWdnZXIgdGhlIHN0YXJ0IG1hbnVhbGx5IGFuZCBwdXQgdGhlIGJlZ2luXG4gICAgICAgICAgICAvLyB3aGljaCBuZWVkcyB0byBiZSBpbiBtcyBhc2lkZVxuICAgICAgICAgICAgdGltZW91dCA9IENoYXJ0aXN0LnN0cmlwVW5pdChhbmltYXRpb25EZWZpbml0aW9uLmJlZ2luIHx8IDApO1xuICAgICAgICAgICAgYW5pbWF0aW9uRGVmaW5pdGlvbi5iZWdpbiA9ICdpbmRlZmluaXRlJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhbmltYXRlID0gdGhpcy5lbGVtKCdhbmltYXRlJywgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6IGF0dHJpYnV0ZVxuICAgICAgICAgIH0sIGFuaW1hdGlvbkRlZmluaXRpb24pKTtcblxuICAgICAgICAgIGlmKGd1aWRlZCkge1xuICAgICAgICAgICAgLy8gSWYgZ3VpZGVkIHdlIHRha2UgdGhlIHZhbHVlIHRoYXQgd2FzIHB1dCBhc2lkZSBpbiB0aW1lb3V0IGFuZCB0cmlnZ2VyIHRoZSBhbmltYXRpb24gbWFudWFsbHkgd2l0aCBhIHRpbWVvdXRcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIC8vIElmIGJlZ2luRWxlbWVudCBmYWlscyB3ZSBzZXQgdGhlIGFuaW1hdGVkIGF0dHJpYnV0ZSB0byB0aGUgZW5kIHBvc2l0aW9uIGFuZCByZW1vdmUgdGhlIGFuaW1hdGUgZWxlbWVudFxuICAgICAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgaWYgdGhlIFNNSUwgRWxlbWVudFRpbWVDb250cm9sIGludGVyZmFjZSBpcyBub3Qgc3VwcG9ydGVkIG9yIGFueSBvdGhlciBwcm9ibGVtcyBvY2N1cmVkIGluXG4gICAgICAgICAgICAgIC8vIHRoZSBicm93c2VyLiAoQ3VycmVudGx5IEZGIDM0IGRvZXMgbm90IHN1cHBvcnQgYW5pbWF0ZSBlbGVtZW50cyBpbiBmb3JlaWduT2JqZWN0cylcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhbmltYXRlLl9ub2RlLmJlZ2luRWxlbWVudCgpO1xuICAgICAgICAgICAgICB9IGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAgIC8vIFNldCBhbmltYXRlZCBhdHRyaWJ1dGUgdG8gY3VycmVudCBhbmltYXRlZCB2YWx1ZVxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZVByb3BlcnRpZXNbYXR0cmlidXRlXSA9IGFuaW1hdGlvbkRlZmluaXRpb24udG87XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyKGF0dHJpYnV0ZVByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgYW5pbWF0ZSBlbGVtZW50IGFzIGl0J3Mgbm8gbG9uZ2VyIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgYW5pbWF0ZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCB0aW1lb3V0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihldmVudEVtaXR0ZXIpIHtcbiAgICAgICAgICAgIGFuaW1hdGUuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcignYmVnaW5FdmVudCcsIGZ1bmN0aW9uIGhhbmRsZUJlZ2luRXZlbnQoKSB7XG4gICAgICAgICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KCdhbmltYXRpb25CZWdpbicsIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLFxuICAgICAgICAgICAgICAgIGFuaW1hdGU6IGFuaW1hdGUuX25vZGUsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBhbmltYXRpb25EZWZpbml0aW9uXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhbmltYXRlLl9ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZEV2ZW50JywgZnVuY3Rpb24gaGFuZGxlRW5kRXZlbnQoKSB7XG4gICAgICAgICAgICBpZihldmVudEVtaXR0ZXIpIHtcbiAgICAgICAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQoJ2FuaW1hdGlvbkVuZCcsIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiB0aGlzLFxuICAgICAgICAgICAgICAgIGFuaW1hdGU6IGFuaW1hdGUuX25vZGUsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBhbmltYXRpb25EZWZpbml0aW9uXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihndWlkZWQpIHtcbiAgICAgICAgICAgICAgLy8gU2V0IGFuaW1hdGVkIGF0dHJpYnV0ZSB0byBjdXJyZW50IGFuaW1hdGVkIHZhbHVlXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZVByb3BlcnRpZXNbYXR0cmlidXRlXSA9IGFuaW1hdGlvbkRlZmluaXRpb24udG87XG4gICAgICAgICAgICAgIHRoaXMuYXR0cihhdHRyaWJ1dGVQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBhbmltYXRlIGVsZW1lbnQgYXMgaXQncyBubyBsb25nZXIgcmVxdWlyZWRcbiAgICAgICAgICAgICAgYW5pbWF0ZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgY3VycmVudCBhdHRyaWJ1dGUgaXMgYW4gYXJyYXkgb2YgZGVmaW5pdGlvbiBvYmplY3RzIHdlIGNyZWF0ZSBhbiBhbmltYXRlIGZvciBlYWNoIGFuZCBkaXNhYmxlIGd1aWRlZCBtb2RlXG4gICAgICAgIGlmKGFuaW1hdGlvbnNbYXR0cmlidXRlXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgYW5pbWF0aW9uc1thdHRyaWJ1dGVdLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0aW9uRGVmaW5pdGlvbikge1xuICAgICAgICAgICAgY3JlYXRlQW5pbWF0ZS5iaW5kKHRoaXMpKGFuaW1hdGlvbkRlZmluaXRpb24sIGZhbHNlKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNyZWF0ZUFuaW1hdGUuYmluZCh0aGlzKShhbmltYXRpb25zW2F0dHJpYnV0ZV0sIGd1aWRlZCk7XG4gICAgICAgIH1cblxuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgQ2hhcnRpc3QuU3ZnID0gQ2hhcnRpc3QuQ2xhc3MuZXh0ZW5kKHtcbiAgICAgIGNvbnN0cnVjdG9yOiBTdmcsXG4gICAgICBhdHRyOiBhdHRyLFxuICAgICAgZWxlbTogZWxlbSxcbiAgICAgIHBhcmVudDogcGFyZW50LFxuICAgICAgcm9vdDogcm9vdCxcbiAgICAgIHF1ZXJ5U2VsZWN0b3I6IHF1ZXJ5U2VsZWN0b3IsXG4gICAgICBxdWVyeVNlbGVjdG9yQWxsOiBxdWVyeVNlbGVjdG9yQWxsLFxuICAgICAgZm9yZWlnbk9iamVjdDogZm9yZWlnbk9iamVjdCxcbiAgICAgIHRleHQ6IHRleHQsXG4gICAgICBlbXB0eTogZW1wdHksXG4gICAgICByZW1vdmU6IHJlbW92ZSxcbiAgICAgIHJlcGxhY2U6IHJlcGxhY2UsXG4gICAgICBhcHBlbmQ6IGFwcGVuZCxcbiAgICAgIGNsYXNzZXM6IGNsYXNzZXMsXG4gICAgICBhZGRDbGFzczogYWRkQ2xhc3MsXG4gICAgICByZW1vdmVDbGFzczogcmVtb3ZlQ2xhc3MsXG4gICAgICByZW1vdmVBbGxDbGFzc2VzOiByZW1vdmVBbGxDbGFzc2VzLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBhbmltYXRlOiBhbmltYXRlXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MgZm9yIHN1cHBvcnQgb2YgYSBnaXZlbiBTVkcgZmVhdHVyZSBsaWtlIEV4dGVuc2liaWxpdHksIFNWRy1hbmltYXRpb24gb3IgdGhlIGxpa2UuIENoZWNrIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUgZm9yIGEgZGV0YWlsZWQgbGlzdC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmVhdHVyZSBUaGUgU1ZHIDEuMSBmZWF0dXJlIHRoYXQgc2hvdWxkIGJlIGNoZWNrZWQgZm9yIHN1cHBvcnQuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBvZiBmYWxzZSBpZiB0aGUgZmVhdHVyZSBpcyBzdXBwb3J0ZWQgb3Igbm90XG4gICAgICovXG4gICAgQ2hhcnRpc3QuU3ZnLmlzU3VwcG9ydGVkID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmhhc0ZlYXR1cmUoJ3d3dy5odHRwOi8vdzMub3JnL1RSL1NWRzExL2ZlYXR1cmUjJyArIGZlYXR1cmUsICcxLjEnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBPYmplY3QgY29udGFpbnMgc29tZSBzdGFuZGFyZCBlYXNpbmcgY3ViaWMgYmV6aWVyIGN1cnZlcy4gVGhlbiBjYW4gYmUgdXNlZCB3aXRoIHRoZWlyIG5hbWUgaW4gdGhlIGBDaGFydGlzdC5TdmcuYW5pbWF0ZWAuIFlvdSBjYW4gYWxzbyBleHRlbmQgdGhlIGxpc3QgYW5kIHVzZSB5b3VyIG93biBuYW1lIGluIHRoZSBgYW5pbWF0ZWAgZnVuY3Rpb24uIENsaWNrIHRoZSBzaG93IGNvZGUgYnV0dG9uIHRvIHNlZSB0aGUgYXZhaWxhYmxlIGJlemllciBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnXG4gICAgICovXG4gICAgdmFyIGVhc2luZ0N1YmljQmV6aWVycyA9IHtcbiAgICAgIGVhc2VJblNpbmU6IFswLjQ3LCAwLCAwLjc0NSwgMC43MTVdLFxuICAgICAgZWFzZU91dFNpbmU6IFswLjM5LCAwLjU3NSwgMC41NjUsIDFdLFxuICAgICAgZWFzZUluT3V0U2luZTogWzAuNDQ1LCAwLjA1LCAwLjU1LCAwLjk1XSxcbiAgICAgIGVhc2VJblF1YWQ6IFswLjU1LCAwLjA4NSwgMC42OCwgMC41M10sXG4gICAgICBlYXNlT3V0UXVhZDogWzAuMjUsIDAuNDYsIDAuNDUsIDAuOTRdLFxuICAgICAgZWFzZUluT3V0UXVhZDogWzAuNDU1LCAwLjAzLCAwLjUxNSwgMC45NTVdLFxuICAgICAgZWFzZUluQ3ViaWM6IFswLjU1LCAwLjA1NSwgMC42NzUsIDAuMTldLFxuICAgICAgZWFzZU91dEN1YmljOiBbMC4yMTUsIDAuNjEsIDAuMzU1LCAxXSxcbiAgICAgIGVhc2VJbk91dEN1YmljOiBbMC42NDUsIDAuMDQ1LCAwLjM1NSwgMV0sXG4gICAgICBlYXNlSW5RdWFydDogWzAuODk1LCAwLjAzLCAwLjY4NSwgMC4yMl0sXG4gICAgICBlYXNlT3V0UXVhcnQ6IFswLjE2NSwgMC44NCwgMC40NCwgMV0sXG4gICAgICBlYXNlSW5PdXRRdWFydDogWzAuNzcsIDAsIDAuMTc1LCAxXSxcbiAgICAgIGVhc2VJblF1aW50OiBbMC43NTUsIDAuMDUsIDAuODU1LCAwLjA2XSxcbiAgICAgIGVhc2VPdXRRdWludDogWzAuMjMsIDEsIDAuMzIsIDFdLFxuICAgICAgZWFzZUluT3V0UXVpbnQ6IFswLjg2LCAwLCAwLjA3LCAxXSxcbiAgICAgIGVhc2VJbkV4cG86IFswLjk1LCAwLjA1LCAwLjc5NSwgMC4wMzVdLFxuICAgICAgZWFzZU91dEV4cG86IFswLjE5LCAxLCAwLjIyLCAxXSxcbiAgICAgIGVhc2VJbk91dEV4cG86IFsxLCAwLCAwLCAxXSxcbiAgICAgIGVhc2VJbkNpcmM6IFswLjYsIDAuMDQsIDAuOTgsIDAuMzM1XSxcbiAgICAgIGVhc2VPdXRDaXJjOiBbMC4wNzUsIDAuODIsIDAuMTY1LCAxXSxcbiAgICAgIGVhc2VJbk91dENpcmM6IFswLjc4NSwgMC4xMzUsIDAuMTUsIDAuODZdLFxuICAgICAgZWFzZUluQmFjazogWzAuNiwgLTAuMjgsIDAuNzM1LCAwLjA0NV0sXG4gICAgICBlYXNlT3V0QmFjazogWzAuMTc1LCAwLjg4NSwgMC4zMiwgMS4yNzVdLFxuICAgICAgZWFzZUluT3V0QmFjazogWzAuNjgsIC0wLjU1LCAwLjI2NSwgMS41NV1cbiAgICB9O1xuXG4gICAgQ2hhcnRpc3QuU3ZnLkVhc2luZyA9IGVhc2luZ0N1YmljQmV6aWVycztcblxuICAgIC8qKlxuICAgICAqIFRoaXMgaGVscGVyIGNsYXNzIGlzIHRvIHdyYXAgbXVsdGlwbGUgYENoYXJ0aXN0LlN2Z2AgZWxlbWVudHMgaW50byBhIGxpc3Qgd2hlcmUgeW91IGNhbiBjYWxsIHRoZSBgQ2hhcnRpc3QuU3ZnYCBmdW5jdGlvbnMgb24gYWxsIGVsZW1lbnRzIGluIHRoZSBsaXN0IHdpdGggb25lIGNhbGwuIFRoaXMgaXMgaGVscGZ1bCB3aGVuIHlvdSdkIGxpa2UgdG8gcGVyZm9ybSBjYWxscyB3aXRoIGBDaGFydGlzdC5TdmdgIG9uIG11bHRpcGxlIGVsZW1lbnRzLlxuICAgICAqIEFuIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgaXMgYWxzbyByZXR1cm5lZCBieSBgQ2hhcnRpc3QuU3ZnLnF1ZXJ5U2VsZWN0b3JBbGxgLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Z1xuICAgICAqIEBwYXJhbSB7QXJyYXk8Tm9kZT58Tm9kZUxpc3R9IG5vZGVMaXN0IEFuIEFycmF5IG9mIFNWRyBET00gbm9kZXMgb3IgYSBTVkcgRE9NIE5vZGVMaXN0IChhcyByZXR1cm5lZCBieSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFN2Z0xpc3Qobm9kZUxpc3QpIHtcbiAgICAgIHZhciBsaXN0ID0gdGhpcztcblxuICAgICAgdGhpcy5zdmdFbGVtZW50cyA9IFtdO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuc3ZnRWxlbWVudHMucHVzaChuZXcgQ2hhcnRpc3QuU3ZnKG5vZGVMaXN0W2ldKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBkZWxlZ2F0aW9uIG1ldGhvZHMgZm9yIENoYXJ0aXN0LlN2Z1xuICAgICAgT2JqZWN0LmtleXMoQ2hhcnRpc3QuU3ZnLnByb3RvdHlwZSkuZmlsdGVyKGZ1bmN0aW9uKHByb3RvdHlwZVByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiBbJ2NvbnN0cnVjdG9yJyxcbiAgICAgICAgICAgICdwYXJlbnQnLFxuICAgICAgICAgICAgJ3F1ZXJ5U2VsZWN0b3InLFxuICAgICAgICAgICAgJ3F1ZXJ5U2VsZWN0b3JBbGwnLFxuICAgICAgICAgICAgJ3JlcGxhY2UnLFxuICAgICAgICAgICAgJ2FwcGVuZCcsXG4gICAgICAgICAgICAnY2xhc3NlcycsXG4gICAgICAgICAgICAnaGVpZ2h0JyxcbiAgICAgICAgICAgICd3aWR0aCddLmluZGV4T2YocHJvdG90eXBlUHJvcGVydHkpID09PSAtMTtcbiAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24ocHJvdG90eXBlUHJvcGVydHkpIHtcbiAgICAgICAgbGlzdFtwcm90b3R5cGVQcm9wZXJ0eV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgICAgbGlzdC5zdmdFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIENoYXJ0aXN0LlN2Zy5wcm90b3R5cGVbcHJvdG90eXBlUHJvcGVydHldLmFwcGx5KGVsZW1lbnQsIGFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgQ2hhcnRpc3QuU3ZnLkxpc3QgPSBDaGFydGlzdC5DbGFzcy5leHRlbmQoe1xuICAgICAgY29uc3RydWN0b3I6IFN2Z0xpc3RcbiAgICB9KTtcbiAgfSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuICA7LyoqXG4gICAqIENoYXJ0aXN0IFNWRyBwYXRoIG1vZHVsZSBmb3IgU1ZHIHBhdGggZGVzY3JpcHRpb24gY3JlYXRpb24gYW5kIG1vZGlmaWNhdGlvbi5cbiAgICpcbiAgICogQG1vZHVsZSBDaGFydGlzdC5TdmcuUGF0aFxuICAgKi9cbiAgLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4gIChmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIENvbnRhaW5zIHRoZSBkZXNjcmlwdG9ycyBvZiBzdXBwb3J0ZWQgZWxlbWVudCB0eXBlcyBpbiBhIFNWRyBwYXRoLiBDdXJyZW50bHkgb25seSBtb3ZlLCBsaW5lIGFuZCBjdXJ2ZSBhcmUgc3VwcG9ydGVkLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB2YXIgZWxlbWVudERlc2NyaXB0aW9ucyA9IHtcbiAgICAgIG06IFsneCcsICd5J10sXG4gICAgICBsOiBbJ3gnLCAneSddLFxuICAgICAgYzogWyd4MScsICd5MScsICd4MicsICd5MicsICd4JywgJ3knXVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IG9wdGlvbnMgZm9yIG5ld2x5IGNyZWF0ZWQgU1ZHIHBhdGggb2JqZWN0cy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgLy8gVGhlIGFjY3VyYWN5IGluIGRpZ2l0IGNvdW50IGFmdGVyIHRoZSBkZWNpbWFsIHBvaW50LiBUaGlzIHdpbGwgYmUgdXNlZCB0byByb3VuZCBudW1iZXJzIGluIHRoZSBTVkcgcGF0aC4gSWYgdGhpcyBvcHRpb24gaXMgc2V0IHRvIGZhbHNlIHRoZW4gbm8gcm91bmRpbmcgd2lsbCBiZSBwZXJmb3JtZWQuXG4gICAgICBhY2N1cmFjeTogM1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBlbGVtZW50KGNvbW1hbmQsIHBhcmFtcywgcGF0aEVsZW1lbnRzLCBwb3MsIHJlbGF0aXZlKSB7XG4gICAgICBwYXRoRWxlbWVudHMuc3BsaWNlKHBvcywgMCwgQ2hhcnRpc3QuZXh0ZW5kKHtcbiAgICAgICAgY29tbWFuZDogcmVsYXRpdmUgPyBjb21tYW5kLnRvTG93ZXJDYXNlKCkgOiBjb21tYW5kLnRvVXBwZXJDYXNlKClcbiAgICAgIH0sIHBhcmFtcykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvckVhY2hQYXJhbShwYXRoRWxlbWVudHMsIGNiKSB7XG4gICAgICBwYXRoRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihwYXRoRWxlbWVudCwgcGF0aEVsZW1lbnRJbmRleCkge1xuICAgICAgICBlbGVtZW50RGVzY3JpcHRpb25zW3BhdGhFbGVtZW50LmNvbW1hbmQudG9Mb3dlckNhc2UoKV0uZm9yRWFjaChmdW5jdGlvbihwYXJhbU5hbWUsIHBhcmFtSW5kZXgpIHtcbiAgICAgICAgICBjYihwYXRoRWxlbWVudCwgcGFyYW1OYW1lLCBwYXRoRWxlbWVudEluZGV4LCBwYXJhbUluZGV4LCBwYXRoRWxlbWVudHMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gY29uc3RydWN0IGEgbmV3IHBhdGggb2JqZWN0LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBjbG9zZSBJZiBzZXQgdG8gdHJ1ZSB0aGVuIHRoaXMgcGF0aCB3aWxsIGJlIGNsb3NlZCB3aGVuIHN0cmluZ2lmaWVkICh3aXRoIGEgWiBhdCB0aGUgZW5kKVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0IHRoYXQgb3ZlcnJpZGVzIHRoZSBkZWZhdWx0IG9iamVjdHMuIFNlZSBkZWZhdWx0IG9wdGlvbnMgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTdmdQYXRoKGNsb3NlLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLnBhdGhFbGVtZW50cyA9IFtdO1xuICAgICAgdGhpcy5wb3MgPSAwO1xuICAgICAgdGhpcy5jbG9zZSA9IGNsb3NlO1xuICAgICAgdGhpcy5vcHRpb25zID0gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBvciBzZXRzIHRoZSBjdXJyZW50IHBvc2l0aW9uIChjdXJzb3IpIGluc2lkZSBvZiB0aGUgcGF0aC4gWW91IGNhbiBtb3ZlIGFyb3VuZCB0aGUgY3Vyc29yIGZyZWVseSBidXQgbGltaXRlZCB0byAwIG9yIHRoZSBjb3VudCBvZiBleGlzdGluZyBlbGVtZW50cy4gQWxsIG1vZGlmaWNhdGlvbnMgd2l0aCBlbGVtZW50IGZ1bmN0aW9ucyB3aWxsIGluc2VydCBuZXcgZWxlbWVudHMgYXQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgY3Vyc29yLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtwb3NpdGlvbl0gSWYgYSBudW1iZXIgaXMgcGFzc2VkIHRoZW4gdGhlIGN1cnNvciBpcyBzZXQgdG8gdGhpcyBwb3NpdGlvbiBpbiB0aGUgcGF0aCBlbGVtZW50IGFycmF5LlxuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofE51bWJlcn0gSWYgdGhlIHBvc2l0aW9uIHBhcmFtZXRlciB3YXMgcGFzc2VkIHRoZW4gdGhlIHJldHVybiB2YWx1ZSB3aWxsIGJlIHRoZSBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLiBJZiBubyBwb3NpdGlvbiBwYXJhbWV0ZXIgd2FzIHBhc3NlZCB0aGVuIHRoZSBjdXJyZW50IHBvc2l0aW9uIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBvc2l0aW9uKHBvcykge1xuICAgICAgaWYocG9zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5wb3MgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih0aGlzLnBhdGhFbGVtZW50cy5sZW5ndGgsIHBvcykpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGVsZW1lbnRzIGZyb20gdGhlIHBhdGggc3RhcnRpbmcgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHBhdGggZWxlbWVudHMgdGhhdCBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlbW92ZShjb3VudCkge1xuICAgICAgdGhpcy5wYXRoRWxlbWVudHMuc3BsaWNlKHRoaXMucG9zLCBjb3VudCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBhZGQgYSBuZXcgbW92ZSBTVkcgcGF0aCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIG1vdmUgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgbW92ZSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVsYXRpdmUgSWYgc2V0IHRvIHRydWUgdGhlIG1vdmUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCByZWxhdGl2ZSBjb29yZGluYXRlcyAobG93ZXJjYXNlIGxldHRlcilcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtb3ZlKHgsIHksIHJlbGF0aXZlKSB7XG4gICAgICBlbGVtZW50KCdNJywge1xuICAgICAgICB4OiAreCxcbiAgICAgICAgeTogK3lcbiAgICAgIH0sIHRoaXMucGF0aEVsZW1lbnRzLCB0aGlzLnBvcysrLCByZWxhdGl2ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBhZGQgYSBuZXcgbGluZSBTVkcgcGF0aCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIGxpbmUgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgbGluZSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVsYXRpdmUgSWYgc2V0IHRvIHRydWUgdGhlIGxpbmUgZWxlbWVudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCByZWxhdGl2ZSBjb29yZGluYXRlcyAobG93ZXJjYXNlIGxldHRlcilcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaW5lKHgsIHksIHJlbGF0aXZlKSB7XG4gICAgICBlbGVtZW50KCdMJywge1xuICAgICAgICB4OiAreCxcbiAgICAgICAgeTogK3lcbiAgICAgIH0sIHRoaXMucGF0aEVsZW1lbnRzLCB0aGlzLnBvcysrLCByZWxhdGl2ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBhZGQgYSBuZXcgY3VydmUgU1ZHIHBhdGggZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4MSBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgZmlyc3QgY29udHJvbCBwb2ludCBvZiB0aGUgYmV6aWVyIGN1cnZlLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5MSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgZmlyc3QgY29udHJvbCBwb2ludCBvZiB0aGUgYmV6aWVyIGN1cnZlLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4MiBUaGUgeCBjb29yZGluYXRlIGZvciB0aGUgc2Vjb25kIGNvbnRyb2wgcG9pbnQgb2YgdGhlIGJlemllciBjdXJ2ZS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geTIgVGhlIHkgY29vcmRpbmF0ZSBmb3IgdGhlIHNlY29uZCBjb250cm9sIHBvaW50IG9mIHRoZSBiZXppZXIgY3VydmUuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29vcmRpbmF0ZSBmb3IgdGhlIHRhcmdldCBwb2ludCBvZiB0aGUgY3VydmUgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSBUaGUgeSBjb29yZGluYXRlIGZvciB0aGUgdGFyZ2V0IHBvaW50IG9mIHRoZSBjdXJ2ZSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVsYXRpdmUgSWYgc2V0IHRvIHRydWUgdGhlIGN1cnZlIGVsZW1lbnQgd2lsbCBiZSBjcmVhdGVkIHdpdGggcmVsYXRpdmUgY29vcmRpbmF0ZXMgKGxvd2VyY2FzZSBsZXR0ZXIpXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3VydmUoeDEsIHkxLCB4MiwgeTIsIHgsIHksIHJlbGF0aXZlKSB7XG4gICAgICBlbGVtZW50KCdDJywge1xuICAgICAgICB4MTogK3gxLFxuICAgICAgICB5MTogK3kxLFxuICAgICAgICB4MjogK3gyLFxuICAgICAgICB5MjogK3kyLFxuICAgICAgICB4OiAreCxcbiAgICAgICAgeTogK3lcbiAgICAgIH0sIHRoaXMucGF0aEVsZW1lbnRzLCB0aGlzLnBvcysrLCByZWxhdGl2ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZXMgYW4gU1ZHIHBhdGggc2VlbiBpbiB0aGUgZCBhdHRyaWJ1dGUgb2YgcGF0aCBlbGVtZW50cywgYW5kIGluc2VydHMgdGhlIHBhcnNlZCBlbGVtZW50cyBpbnRvIHRoZSBleGlzdGluZyBwYXRoIG9iamVjdCBhdCB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb24uIEFueSBjbG9zaW5nIHBhdGggaW5kaWNhdG9ycyAoWiBhdCB0aGUgZW5kIG9mIHRoZSBwYXRoKSB3aWxsIGJlIGlnbm9yZWQgYnkgdGhlIHBhcnNlciBhcyB0aGlzIGlzIHByb3ZpZGVkIGJ5IHRoZSBjbG9zZSBvcHRpb24gaW4gdGhlIG9wdGlvbnMgb2YgdGhlIHBhdGggb2JqZWN0LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggQW55IFNWRyBwYXRoIHRoYXQgY29udGFpbnMgbW92ZSAobSksIGxpbmUgKGwpIG9yIGN1cnZlIChjKSBjb21wb25lbnRzLlxuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcbiAgICAgIC8vIFBhcnNpbmcgdGhlIFNWRyBwYXRoIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBbWydNJywgJzEwJywgJzEwJ10sIFsnTCcsICcxMDAnLCAnMTAwJ11dXG4gICAgICB2YXIgY2h1bmtzID0gcGF0aC5yZXBsYWNlKC8oW0EtWmEtel0pKFswLTldKS9nLCAnJDEgJDInKVxuICAgICAgICAucmVwbGFjZSgvKFswLTldKShbQS1aYS16XSkvZywgJyQxICQyJylcbiAgICAgICAgLnNwbGl0KC9bXFxzLF0rLylcbiAgICAgICAgLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcbiAgICAgICAgICBpZihlbGVtZW50Lm1hdGNoKC9bQS1aYS16XS8pKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChbXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sIFtdKTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIGNsb3NlZCBwYXRoIHdlIHJlbW92ZSB0aGUgWiBhdCB0aGUgZW5kIGJlY2F1c2UgdGhpcyBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBjbG9zZSBvcHRpb25cbiAgICAgIGlmKGNodW5rc1tjaHVua3MubGVuZ3RoIC0gMV1bMF0udG9VcHBlckNhc2UoKSA9PT0gJ1onKSB7XG4gICAgICAgIGNodW5rcy5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgLy8gVXNpbmcgc3ZnUGF0aEVsZW1lbnREZXNjcmlwdGlvbnMgdG8gbWFwIHJhdyBwYXRoIGFycmF5cyBpbnRvIG9iamVjdHMgdGhhdCBjb250YWluIHRoZSBjb21tYW5kIGFuZCB0aGUgcGFyYW1ldGVyc1xuICAgICAgLy8gRm9yIGV4YW1wbGUge2NvbW1hbmQ6ICdNJywgeDogJzEwJywgeTogJzEwJ31cbiAgICAgIHZhciBlbGVtZW50cyA9IGNodW5rcy5tYXAoZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgICB2YXIgY29tbWFuZCA9IGNodW5rLnNoaWZ0KCksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGVsZW1lbnREZXNjcmlwdGlvbnNbY29tbWFuZC50b0xvd2VyQ2FzZSgpXTtcblxuICAgICAgICAgIHJldHVybiBDaGFydGlzdC5leHRlbmQoe1xuICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZFxuICAgICAgICAgIH0sIGRlc2NyaXB0aW9uLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIHBhcmFtTmFtZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtwYXJhbU5hbWVdID0gK2NodW5rW2luZGV4XTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSwge30pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIFByZXBhcmluZyBhIHNwbGljZSBjYWxsIHdpdGggdGhlIGVsZW1lbnRzIGFycmF5IGFzIHZhciBhcmcgcGFyYW1zIGFuZCBpbnNlcnQgdGhlIHBhcnNlZCBlbGVtZW50cyBhdCB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgICAgdmFyIHNwbGljZUFyZ3MgPSBbdGhpcy5wb3MsIDBdO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoc3BsaWNlQXJncywgZWxlbWVudHMpO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSh0aGlzLnBhdGhFbGVtZW50cywgc3BsaWNlQXJncyk7XG4gICAgICAvLyBJbmNyZWFzZSB0aGUgaW50ZXJuYWwgcG9zaXRpb24gYnkgdGhlIGVsZW1lbnQgY291bnRcbiAgICAgIHRoaXMucG9zICs9IGVsZW1lbnRzLmxlbmd0aDtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiByZW5kZXJzIHRvIGN1cnJlbnQgU1ZHIHBhdGggb2JqZWN0IGludG8gYSBmaW5hbCBTVkcgc3RyaW5nIHRoYXQgY2FuIGJlIHVzZWQgaW4gdGhlIGQgYXR0cmlidXRlIG9mIFNWRyBwYXRoIGVsZW1lbnRzLiBJdCB1c2VzIHRoZSBhY2N1cmFjeSBvcHRpb24gdG8gcm91bmQgYmlnIGRlY2ltYWxzLiBJZiB0aGUgY2xvc2UgcGFyYW1ldGVyIHdhcyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yIG9mIHRoaXMgcGF0aCBvYmplY3QgdGhlbiBhIHBhdGggY2xvc2luZyBaIHdpbGwgYmUgYXBwZW5kZWQgdG8gdGhlIG91dHB1dCBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RyaW5naWZ5KCkge1xuICAgICAgdmFyIGFjY3VyYWN5TXVsdGlwbGllciA9IE1hdGgucG93KDEwLCB0aGlzLm9wdGlvbnMuYWNjdXJhY3kpO1xuXG4gICAgICByZXR1cm4gdGhpcy5wYXRoRWxlbWVudHMucmVkdWNlKGZ1bmN0aW9uKHBhdGgsIHBhdGhFbGVtZW50KSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9IGVsZW1lbnREZXNjcmlwdGlvbnNbcGF0aEVsZW1lbnQuY29tbWFuZC50b0xvd2VyQ2FzZSgpXS5tYXAoZnVuY3Rpb24ocGFyYW1OYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmFjY3VyYWN5ID9cbiAgICAgICAgICAgICAgKE1hdGgucm91bmQocGF0aEVsZW1lbnRbcGFyYW1OYW1lXSAqIGFjY3VyYWN5TXVsdGlwbGllcikgLyBhY2N1cmFjeU11bHRpcGxpZXIpIDpcbiAgICAgICAgICAgICAgcGF0aEVsZW1lbnRbcGFyYW1OYW1lXTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgcmV0dXJuIHBhdGggKyBwYXRoRWxlbWVudC5jb21tYW5kICsgcGFyYW1zLmpvaW4oJywnKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCAnJykgKyAodGhpcy5jbG9zZSA/ICdaJyA6ICcnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTY2FsZXMgYWxsIGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IFNWRyBwYXRoIG9iamVjdC4gVGhlcmUgaXMgYW4gaW5kaXZpZHVhbCBwYXJhbWV0ZXIgZm9yIGVhY2ggY29vcmRpbmF0ZS4gU2NhbGluZyB3aWxsIGFsc28gYmUgZG9uZSBmb3IgY29udHJvbCBwb2ludHMgb2YgY3VydmVzLCBhZmZlY3RpbmcgdGhlIGdpdmVuIGNvb3JkaW5hdGUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geCBUaGUgbnVtYmVyIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBzY2FsZSB0aGUgeCwgeDEgYW5kIHgyIG9mIGFsbCBwYXRoIGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSBudW1iZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHNjYWxlIHRoZSB5LCB5MSBhbmQgeTIgb2YgYWxsIHBhdGggZWxlbWVudHMuXG4gICAgICogQHJldHVybiB7Q2hhcnRpc3QuU3ZnLlBhdGh9IFRoZSBjdXJyZW50IHBhdGggb2JqZWN0IGZvciBlYXN5IGNhbGwgY2hhaW5pbmcuXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2NhbGUoeCwgeSkge1xuICAgICAgZm9yRWFjaFBhcmFtKHRoaXMucGF0aEVsZW1lbnRzLCBmdW5jdGlvbihwYXRoRWxlbWVudCwgcGFyYW1OYW1lKSB7XG4gICAgICAgIHBhdGhFbGVtZW50W3BhcmFtTmFtZV0gKj0gcGFyYW1OYW1lWzBdID09PSAneCcgPyB4IDogeTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNsYXRlcyBhbGwgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgU1ZHIHBhdGggb2JqZWN0LiBUaGUgdHJhbnNsYXRpb24gaXMgcmVsYXRpdmUgYW5kIHRoZXJlIGlzIGFuIGluZGl2aWR1YWwgcGFyYW1ldGVyIGZvciBlYWNoIGNvb3JkaW5hdGUuIFRyYW5zbGF0aW9uIHdpbGwgYWxzbyBiZSBkb25lIGZvciBjb250cm9sIHBvaW50cyBvZiBjdXJ2ZXMsIGFmZmVjdGluZyB0aGUgZ2l2ZW4gY29vcmRpbmF0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5TdmcuUGF0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSBudW1iZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHRyYW5zbGF0ZSB0aGUgeCwgeDEgYW5kIHgyIG9mIGFsbCBwYXRoIGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSBudW1iZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHRyYW5zbGF0ZSB0aGUgeSwgeTEgYW5kIHkyIG9mIGFsbCBwYXRoIGVsZW1lbnRzLlxuICAgICAqIEByZXR1cm4ge0NoYXJ0aXN0LlN2Zy5QYXRofSBUaGUgY3VycmVudCBwYXRoIG9iamVjdCBmb3IgZWFzeSBjYWxsIGNoYWluaW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZSh4LCB5KSB7XG4gICAgICBmb3JFYWNoUGFyYW0odGhpcy5wYXRoRWxlbWVudHMsIGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUpIHtcbiAgICAgICAgcGF0aEVsZW1lbnRbcGFyYW1OYW1lXSArPSBwYXJhbU5hbWVbMF0gPT09ICd4JyA/IHggOiB5O1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgcnVuIG92ZXIgYWxsIGV4aXN0aW5nIHBhdGggZWxlbWVudHMgYW5kIHRoZW4gbG9vcCBvdmVyIHRoZWlyIGF0dHJpYnV0ZXMuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgcGF0aCBlbGVtZW50IGF0dHJpYnV0ZSB0aGF0IGV4aXN0cyBpbiB0aGUgY3VycmVudCBwYXRoLlxuICAgICAqIFRoZSBtZXRob2Qgc2lnbmF0dXJlIG9mIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBsb29rcyBsaWtlIHRoaXM6XG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqIGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUsIHBhdGhFbGVtZW50SW5kZXgsIHBhcmFtSW5kZXgsIHBhdGhFbGVtZW50cylcbiAgICAgKiBgYGBcbiAgICAgKiBJZiBzb21ldGhpbmcgZWxzZSB0aGFuIHVuZGVmaW5lZCBpcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIHRoaXMgdmFsdWUgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgdGhlIG9sZCB2YWx1ZS4gVGhpcyBhbGxvd3MgeW91IHRvIGJ1aWxkIGN1c3RvbSB0cmFuc2Zvcm1hdGlvbnMgb2YgcGF0aCBvYmplY3RzIHRoYXQgY2FuJ3QgYmUgYWNoaWV2ZWQgdXNpbmcgdGhlIGJhc2ljIHRyYW5zZm9ybWF0aW9uIGZ1bmN0aW9ucyBzY2FsZSBhbmQgdHJhbnNsYXRlLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlN2Zy5QYXRoXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtRm5jIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIHRyYW5zZm9ybWF0aW9uLiBDaGVjayB0aGUgc2lnbmF0dXJlIGluIHRoZSBmdW5jdGlvbiBkZXNjcmlwdGlvbi5cbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH0gVGhlIGN1cnJlbnQgcGF0aCBvYmplY3QgZm9yIGVhc3kgY2FsbCBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm0odHJhbnNmb3JtRm5jKSB7XG4gICAgICBmb3JFYWNoUGFyYW0odGhpcy5wYXRoRWxlbWVudHMsIGZ1bmN0aW9uKHBhdGhFbGVtZW50LCBwYXJhbU5hbWUsIHBhdGhFbGVtZW50SW5kZXgsIHBhcmFtSW5kZXgsIHBhdGhFbGVtZW50cykge1xuICAgICAgICB2YXIgdHJhbnNmb3JtZWQgPSB0cmFuc2Zvcm1GbmMocGF0aEVsZW1lbnQsIHBhcmFtTmFtZSwgcGF0aEVsZW1lbnRJbmRleCwgcGFyYW1JbmRleCwgcGF0aEVsZW1lbnRzKTtcbiAgICAgICAgaWYodHJhbnNmb3JtZWQgfHwgdHJhbnNmb3JtZWQgPT09IDApIHtcbiAgICAgICAgICBwYXRoRWxlbWVudFtwYXJhbU5hbWVdID0gdHJhbnNmb3JtZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBjbG9uZXMgYSB3aG9sZSBwYXRoIG9iamVjdCB3aXRoIGFsbCBpdHMgcHJvcGVydGllcy4gVGhpcyBpcyBhIGRlZXAgY2xvbmUgYW5kIHBhdGggZWxlbWVudCBvYmplY3RzIHdpbGwgYWxzbyBiZSBjbG9uZWQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuU3ZnLlBhdGhcbiAgICAgKiBAcmV0dXJuIHtDaGFydGlzdC5TdmcuUGF0aH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjbG9uZSgpIHtcbiAgICAgIHZhciBjID0gbmV3IENoYXJ0aXN0LlN2Zy5QYXRoKHRoaXMuY2xvc2UpO1xuICAgICAgYy5wb3MgPSB0aGlzLnBvcztcbiAgICAgIGMucGF0aEVsZW1lbnRzID0gdGhpcy5wYXRoRWxlbWVudHMuc2xpY2UoKS5tYXAoZnVuY3Rpb24gY2xvbmVFbGVtZW50cyhwYXRoRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gQ2hhcnRpc3QuZXh0ZW5kKHt9LCBwYXRoRWxlbWVudCk7XG4gICAgICB9KTtcbiAgICAgIGMub3B0aW9ucyA9IENoYXJ0aXN0LmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zKTtcbiAgICAgIHJldHVybiBjO1xuICAgIH1cblxuICAgIENoYXJ0aXN0LlN2Zy5QYXRoID0gQ2hhcnRpc3QuQ2xhc3MuZXh0ZW5kKHtcbiAgICAgIGNvbnN0cnVjdG9yOiBTdmdQYXRoLFxuICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgICBtb3ZlOiBtb3ZlLFxuICAgICAgbGluZTogbGluZSxcbiAgICAgIGN1cnZlOiBjdXJ2ZSxcbiAgICAgIHNjYWxlOiBzY2FsZSxcbiAgICAgIHRyYW5zbGF0ZTogdHJhbnNsYXRlLFxuICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICBwYXJzZTogcGFyc2UsXG4gICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeSxcbiAgICAgIGNsb25lOiBjbG9uZVxuICAgIH0pO1xuXG4gICAgQ2hhcnRpc3QuU3ZnLlBhdGguZWxlbWVudERlc2NyaXB0aW9ucyA9IGVsZW1lbnREZXNjcmlwdGlvbnM7XG4gIH0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbiAgOy8qKlxuICAgKiBBeGlzIGJhc2UgY2xhc3MgdXNlZCB0byBpbXBsZW1lbnQgZGlmZmVyZW50IGF4aXMgdHlwZXNcbiAgICpcbiAgICogQG1vZHVsZSBDaGFydGlzdC5BeGlzXG4gICAqL1xuICAvKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbiAgKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBheGlzVW5pdHMgPSB7XG4gICAgICB4OiB7XG4gICAgICAgIHBvczogJ3gnLFxuICAgICAgICBsZW46ICd3aWR0aCcsXG4gICAgICAgIGRpcjogJ2hvcml6b250YWwnLFxuICAgICAgICByZWN0U3RhcnQ6ICd4MScsXG4gICAgICAgIHJlY3RFbmQ6ICd4MicsXG4gICAgICAgIHJlY3RPZmZzZXQ6ICd5MidcbiAgICAgIH0sXG4gICAgICB5OiB7XG4gICAgICAgIHBvczogJ3knLFxuICAgICAgICBsZW46ICdoZWlnaHQnLFxuICAgICAgICBkaXI6ICd2ZXJ0aWNhbCcsXG4gICAgICAgIHJlY3RTdGFydDogJ3kyJyxcbiAgICAgICAgcmVjdEVuZDogJ3kxJyxcbiAgICAgICAgcmVjdE9mZnNldDogJ3gxJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBBeGlzKHVuaXRzLCBjaGFydFJlY3QsIHRyYW5zZm9ybSwgbGFiZWxPZmZzZXQsIG9wdGlvbnMpIHtcbiAgICAgIHRoaXMudW5pdHMgPSB1bml0cztcbiAgICAgIHRoaXMuY291bnRlclVuaXRzID0gdW5pdHMgPT09IGF4aXNVbml0cy54ID8gYXhpc1VuaXRzLnkgOiBheGlzVW5pdHMueDtcbiAgICAgIHRoaXMuY2hhcnRSZWN0ID0gY2hhcnRSZWN0O1xuICAgICAgdGhpcy5heGlzTGVuZ3RoID0gY2hhcnRSZWN0W3VuaXRzLnJlY3RFbmRdIC0gY2hhcnRSZWN0W3VuaXRzLnJlY3RTdGFydF07XG4gICAgICB0aGlzLmdyaWRPZmZzZXQgPSBjaGFydFJlY3RbdW5pdHMucmVjdE9mZnNldF07XG4gICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgICAgIHRoaXMubGFiZWxPZmZzZXQgPSBsYWJlbE9mZnNldDtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgQ2hhcnRpc3QuQXhpcyA9IENoYXJ0aXN0LkNsYXNzLmV4dGVuZCh7XG4gICAgICBjb25zdHJ1Y3RvcjogQXhpcyxcbiAgICAgIHByb2plY3RWYWx1ZTogZnVuY3Rpb24odmFsdWUsIGluZGV4LCBkYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQmFzZSBheGlzIGNhblxcJ3QgYmUgaW5zdGFudGlhdGVkIScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgQ2hhcnRpc3QuQXhpcy51bml0cyA9IGF4aXNVbml0cztcblxuICB9KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG4gIDsvKipcbiAgICogVGhlIGxpbmVhciBzY2FsZSBheGlzIHVzZXMgc3RhbmRhcmQgbGluZWFyIHNjYWxlIHByb2plY3Rpb24gb2YgdmFsdWVzIGFsb25nIGFuIGF4aXMuXG4gICAqXG4gICAqIEBtb2R1bGUgQ2hhcnRpc3QuTGluZWFyU2NhbGVBeGlzXG4gICAqL1xuICAvKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbiAgKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGZ1bmN0aW9uIExpbmVhclNjYWxlQXhpcyhheGlzVW5pdCwgY2hhcnRSZWN0LCB0cmFuc2Zvcm0sIGxhYmVsT2Zmc2V0LCBvcHRpb25zKSB7XG4gICAgICBDaGFydGlzdC5MaW5lYXJTY2FsZUF4aXMuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgICBheGlzVW5pdCxcbiAgICAgICAgY2hhcnRSZWN0LFxuICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgIGxhYmVsT2Zmc2V0LFxuICAgICAgICBvcHRpb25zKTtcblxuICAgICAgdGhpcy5ib3VuZHMgPSBDaGFydGlzdC5nZXRCb3VuZHModGhpcy5heGlzTGVuZ3RoLCBvcHRpb25zLmhpZ2hMb3csIG9wdGlvbnMuc2NhbGVNaW5TcGFjZSwgb3B0aW9ucy5yZWZlcmVuY2VWYWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvamVjdFZhbHVlKHZhbHVlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb3M6IHRoaXMuYXhpc0xlbmd0aCAqICh2YWx1ZSAtIHRoaXMuYm91bmRzLm1pbikgLyAodGhpcy5ib3VuZHMucmFuZ2UgKyB0aGlzLmJvdW5kcy5zdGVwKSxcbiAgICAgICAgbGVuOiBDaGFydGlzdC5wcm9qZWN0TGVuZ3RoKHRoaXMuYXhpc0xlbmd0aCwgdGhpcy5ib3VuZHMuc3RlcCwgdGhpcy5ib3VuZHMpXG4gICAgICB9O1xuICAgIH1cblxuICAgIENoYXJ0aXN0LkxpbmVhclNjYWxlQXhpcyA9IENoYXJ0aXN0LkF4aXMuZXh0ZW5kKHtcbiAgICAgIGNvbnN0cnVjdG9yOiBMaW5lYXJTY2FsZUF4aXMsXG4gICAgICBwcm9qZWN0VmFsdWU6IHByb2plY3RWYWx1ZVxuICAgIH0pO1xuXG4gIH0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbiAgOy8qKlxuICAgKiBTdGVwIGF4aXMgZm9yIHN0ZXAgYmFzZWQgY2hhcnRzIGxpa2UgYmFyIGNoYXJ0IG9yIHN0ZXAgYmFzZWQgbGluZSBjaGFydFxuICAgKlxuICAgKiBAbW9kdWxlIENoYXJ0aXN0LlN0ZXBBeGlzXG4gICAqL1xuICAvKiBnbG9iYWwgQ2hhcnRpc3QgKi9cbiAgKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGZ1bmN0aW9uIFN0ZXBBeGlzKGF4aXNVbml0LCBjaGFydFJlY3QsIHRyYW5zZm9ybSwgbGFiZWxPZmZzZXQsIG9wdGlvbnMpIHtcbiAgICAgIENoYXJ0aXN0LlN0ZXBBeGlzLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgICAgYXhpc1VuaXQsXG4gICAgICAgIGNoYXJ0UmVjdCxcbiAgICAgICAgdHJhbnNmb3JtLFxuICAgICAgICBsYWJlbE9mZnNldCxcbiAgICAgICAgb3B0aW9ucyk7XG5cbiAgICAgIHRoaXMuc3RlcExlbmd0aCA9IHRoaXMuYXhpc0xlbmd0aCAvIChvcHRpb25zLnN0ZXBDb3VudCAtIChvcHRpb25zLnN0cmV0Y2ggPyAxIDogMCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2plY3RWYWx1ZSh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvczogdGhpcy5zdGVwTGVuZ3RoICogaW5kZXgsXG4gICAgICAgIGxlbjogdGhpcy5zdGVwTGVuZ3RoXG4gICAgICB9O1xuICAgIH1cblxuICAgIENoYXJ0aXN0LlN0ZXBBeGlzID0gQ2hhcnRpc3QuQXhpcy5leHRlbmQoe1xuICAgICAgY29uc3RydWN0b3I6IFN0ZXBBeGlzLFxuICAgICAgcHJvamVjdFZhbHVlOiBwcm9qZWN0VmFsdWVcbiAgICB9KTtcblxuICB9KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG4gIDsvKipcbiAgICogVGhlIENoYXJ0aXN0IGxpbmUgY2hhcnQgY2FuIGJlIHVzZWQgdG8gZHJhdyBMaW5lIG9yIFNjYXR0ZXIgY2hhcnRzLiBJZiB1c2VkIGluIHRoZSBicm93c2VyIHlvdSBjYW4gYWNjZXNzIHRoZSBnbG9iYWwgYENoYXJ0aXN0YCBuYW1lc3BhY2Ugd2hlcmUgeW91IGZpbmQgdGhlIGBMaW5lYCBmdW5jdGlvbiBhcyBhIG1haW4gZW50cnkgcG9pbnQuXG4gICAqXG4gICAqIEZvciBleGFtcGxlcyBvbiBob3cgdG8gdXNlIHRoZSBsaW5lIGNoYXJ0IHBsZWFzZSBjaGVjayB0aGUgZXhhbXBsZXMgb2YgdGhlIGBDaGFydGlzdC5MaW5lYCBtZXRob2QuXG4gICAqXG4gICAqIEBtb2R1bGUgQ2hhcnRpc3QuTGluZVxuICAgKi9cbiAgLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4gIChmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBvcHRpb25zIGluIGxpbmUgY2hhcnRzLiBFeHBhbmQgdGhlIGNvZGUgdmlldyB0byBzZWUgYSBkZXRhaWxlZCBsaXN0IG9mIG9wdGlvbnMgd2l0aCBjb21tZW50cy5cbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBDaGFydGlzdC5MaW5lXG4gICAgICovXG4gICAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgLy8gT3B0aW9ucyBmb3IgWC1BeGlzXG4gICAgICBheGlzWDoge1xuICAgICAgICAvLyBUaGUgb2Zmc2V0IG9mIHRoZSBsYWJlbHMgdG8gdGhlIGNoYXJ0IGFyZWFcbiAgICAgICAgb2Zmc2V0OiAzMCxcbiAgICAgICAgLy8gQWxsb3dzIHlvdSB0byBjb3JyZWN0IGxhYmVsIHBvc2l0aW9uaW5nIG9uIHRoaXMgYXhpcyBieSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSB4IGFuZCB5IG9mZnNldC5cbiAgICAgICAgbGFiZWxPZmZzZXQ6IHtcbiAgICAgICAgICB4OiAwLFxuICAgICAgICAgIHk6IDBcbiAgICAgICAgfSxcbiAgICAgICAgLy8gSWYgbGFiZWxzIHNob3VsZCBiZSBzaG93biBvciBub3RcbiAgICAgICAgc2hvd0xhYmVsOiB0cnVlLFxuICAgICAgICAvLyBJZiB0aGUgYXhpcyBncmlkIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICAgICAgc2hvd0dyaWQ6IHRydWUsXG4gICAgICAgIC8vIEludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCB0aGUgdmFsdWUgZnJvbSB0aGUgYXhpcyBsYWJlbFxuICAgICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IENoYXJ0aXN0Lm5vb3BcbiAgICAgIH0sXG4gICAgICAvLyBPcHRpb25zIGZvciBZLUF4aXNcbiAgICAgIGF4aXNZOiB7XG4gICAgICAgIC8vIFRoZSBvZmZzZXQgb2YgdGhlIGxhYmVscyB0byB0aGUgY2hhcnQgYXJlYVxuICAgICAgICBvZmZzZXQ6IDQwLFxuICAgICAgICAvLyBBbGxvd3MgeW91IHRvIGNvcnJlY3QgbGFiZWwgcG9zaXRpb25pbmcgb24gdGhpcyBheGlzIGJ5IHBvc2l0aXZlIG9yIG5lZ2F0aXZlIHggYW5kIHkgb2Zmc2V0LlxuICAgICAgICBsYWJlbE9mZnNldDoge1xuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMFxuICAgICAgICB9LFxuICAgICAgICAvLyBJZiBsYWJlbHMgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuICAgICAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgICAgIC8vIElmIHRoZSBheGlzIGdyaWQgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgICAgICBzaG93R3JpZDogdHJ1ZSxcbiAgICAgICAgLy8gSW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB0aGF0IGFsbG93cyB5b3UgdG8gaW50ZXJjZXB0IHRoZSB2YWx1ZSBmcm9tIHRoZSBheGlzIGxhYmVsXG4gICAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogQ2hhcnRpc3Qubm9vcCxcbiAgICAgICAgLy8gVGhpcyB2YWx1ZSBzcGVjaWZpZXMgdGhlIG1pbmltdW0gaGVpZ2h0IGluIHBpeGVsIG9mIHRoZSBzY2FsZSBzdGVwc1xuICAgICAgICBzY2FsZU1pblNwYWNlOiAyMFxuICAgICAgfSxcbiAgICAgIC8vIFNwZWNpZnkgYSBmaXhlZCB3aWR0aCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgLy8gU3BlY2lmeSBhIGZpeGVkIGhlaWdodCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAgIC8vIElmIHRoZSBsaW5lIHNob3VsZCBiZSBkcmF3biBvciBub3RcbiAgICAgIHNob3dMaW5lOiB0cnVlLFxuICAgICAgLy8gSWYgZG90cyBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgICBzaG93UG9pbnQ6IHRydWUsXG4gICAgICAvLyBJZiB0aGUgbGluZSBjaGFydCBzaG91bGQgZHJhdyBhbiBhcmVhXG4gICAgICBzaG93QXJlYTogZmFsc2UsXG4gICAgICAvLyBUaGUgYmFzZSBmb3IgdGhlIGFyZWEgY2hhcnQgdGhhdCB3aWxsIGJlIHVzZWQgdG8gY2xvc2UgdGhlIGFyZWEgc2hhcGUgKGlzIG5vcm1hbGx5IDApXG4gICAgICBhcmVhQmFzZTogMCxcbiAgICAgIC8vIFNwZWNpZnkgaWYgdGhlIGxpbmVzIHNob3VsZCBiZSBzbW9vdGhlZC4gVGhpcyB2YWx1ZSBjYW4gYmUgdHJ1ZSBvciBmYWxzZSB3aGVyZSB0cnVlIHdpbGwgcmVzdWx0IGluIHNtb290aGluZyB1c2luZyB0aGUgZGVmYXVsdCBzbW9vdGhpbmcgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBDaGFydGlzdC5JbnRlcnBvbGF0aW9uLmNhcmRpbmFsIGFuZCBmYWxzZSByZXN1bHRzIGluIENoYXJ0aXN0LkludGVycG9sYXRpb24ubm9uZS4gWW91IGNhbiBhbHNvIGNob29zZSBvdGhlciBzbW9vdGhpbmcgLyBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9ucyBhdmFpbGFibGUgaW4gdGhlIENoYXJ0aXN0LkludGVycG9sYXRpb24gbW9kdWxlLCBvciB3cml0ZSB5b3VyIG93biBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uLiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIGEgYnJpZWYgZGVzY3JpcHRpb24uXG4gICAgICBsaW5lU21vb3RoOiB0cnVlLFxuICAgICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBsb3cgb2YgdGhlIGNoYXJ0IGFsbG93cyB5b3UgdG8gem9vbSBpbiBvciBsaW1pdCB0aGUgY2hhcnRzIGxvd2VzdCBkaXNwbGF5ZWQgdmFsdWVcbiAgICAgIGxvdzogdW5kZWZpbmVkLFxuICAgICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBoaWdoIG9mIHRoZSBjaGFydCBhbGxvd3MgeW91IHRvIHpvb20gaW4gb3IgbGltaXQgdGhlIGNoYXJ0cyBoaWdoZXN0IGRpc3BsYXllZCB2YWx1ZVxuICAgICAgaGlnaDogdW5kZWZpbmVkLFxuICAgICAgLy8gUGFkZGluZyBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBjb250YWluZXIgZWxlbWVudCBhbmQgbGFiZWxzXG4gICAgICBjaGFydFBhZGRpbmc6IDUsXG4gICAgICAvLyBXaGVuIHNldCB0byB0cnVlLCB0aGUgbGFzdCBncmlkIGxpbmUgb24gdGhlIHgtYXhpcyBpcyBub3QgZHJhd24gYW5kIHRoZSBjaGFydCBlbGVtZW50cyB3aWxsIGV4cGFuZCB0byB0aGUgZnVsbCBhdmFpbGFibGUgd2lkdGggb2YgdGhlIGNoYXJ0LiBGb3IgdGhlIGxhc3QgbGFiZWwgdG8gYmUgZHJhd24gY29ycmVjdGx5IHlvdSBtaWdodCBuZWVkIHRvIGFkZCBjaGFydCBwYWRkaW5nIG9yIG9mZnNldCB0aGUgbGFzdCBsYWJlbCB3aXRoIGEgZHJhdyBldmVudCBoYW5kbGVyLlxuICAgICAgZnVsbFdpZHRoOiBmYWxzZSxcbiAgICAgIC8vIElmIHRydWUgdGhlIHdob2xlIGRhdGEgaXMgcmV2ZXJzZWQgaW5jbHVkaW5nIGxhYmVscywgdGhlIHNlcmllcyBvcmRlciBhcyB3ZWxsIGFzIHRoZSB3aG9sZSBzZXJpZXMgZGF0YSBhcnJheXMuXG4gICAgICByZXZlcnNlRGF0YTogZmFsc2UsXG4gICAgICAvLyBPdmVycmlkZSB0aGUgY2xhc3MgbmFtZXMgdGhhdCBnZXQgdXNlZCB0byBnZW5lcmF0ZSB0aGUgU1ZHIHN0cnVjdHVyZSBvZiB0aGUgY2hhcnRcbiAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgY2hhcnQ6ICdjdC1jaGFydC1saW5lJyxcbiAgICAgICAgbGFiZWw6ICdjdC1sYWJlbCcsXG4gICAgICAgIGxhYmVsR3JvdXA6ICdjdC1sYWJlbHMnLFxuICAgICAgICBzZXJpZXM6ICdjdC1zZXJpZXMnLFxuICAgICAgICBsaW5lOiAnY3QtbGluZScsXG4gICAgICAgIHBvaW50OiAnY3QtcG9pbnQnLFxuICAgICAgICBhcmVhOiAnY3QtYXJlYScsXG4gICAgICAgIGdyaWQ6ICdjdC1ncmlkJyxcbiAgICAgICAgZ3JpZEdyb3VwOiAnY3QtZ3JpZHMnLFxuICAgICAgICB2ZXJ0aWNhbDogJ2N0LXZlcnRpY2FsJyxcbiAgICAgICAgaG9yaXpvbnRhbDogJ2N0LWhvcml6b250YWwnXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY2hhcnRcbiAgICAgKlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUNoYXJ0KG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZXJpZXNHcm91cHMgPSBbXSxcbiAgICAgICAgbm9ybWFsaXplZERhdGEgPSBDaGFydGlzdC5ub3JtYWxpemVEYXRhQXJyYXkoQ2hhcnRpc3QuZ2V0RGF0YUFycmF5KHRoaXMuZGF0YSwgb3B0aW9ucy5yZXZlcnNlRGF0YSksIHRoaXMuZGF0YS5sYWJlbHMubGVuZ3RoKTtcblxuICAgICAgLy8gQ3JlYXRlIG5ldyBzdmcgb2JqZWN0XG4gICAgICB0aGlzLnN2ZyA9IENoYXJ0aXN0LmNyZWF0ZVN2Zyh0aGlzLmNvbnRhaW5lciwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsIG9wdGlvbnMuY2xhc3NOYW1lcy5jaGFydCk7XG5cbiAgICAgIHZhciBjaGFydFJlY3QgPSBDaGFydGlzdC5jcmVhdGVDaGFydFJlY3QodGhpcy5zdmcsIG9wdGlvbnMpO1xuXG4gICAgICB2YXIgaGlnaExvdyA9IENoYXJ0aXN0LmdldEhpZ2hMb3cobm9ybWFsaXplZERhdGEpO1xuICAgICAgLy8gT3ZlcnJpZGVzIG9mIGhpZ2ggLyBsb3cgZnJvbSBzZXR0aW5nc1xuICAgICAgaGlnaExvdy5oaWdoID0gK29wdGlvbnMuaGlnaCB8fCAob3B0aW9ucy5oaWdoID09PSAwID8gMCA6IGhpZ2hMb3cuaGlnaCk7XG4gICAgICBoaWdoTG93LmxvdyA9ICtvcHRpb25zLmxvdyB8fCAob3B0aW9ucy5sb3cgPT09IDAgPyAwIDogaGlnaExvdy5sb3cpO1xuXG4gICAgICB2YXIgYXhpc1ggPSBuZXcgQ2hhcnRpc3QuU3RlcEF4aXMoXG4gICAgICAgIENoYXJ0aXN0LkF4aXMudW5pdHMueCxcbiAgICAgICAgY2hhcnRSZWN0LFxuICAgICAgICBmdW5jdGlvbiB4QXhpc1RyYW5zZm9ybShwcm9qZWN0ZWRWYWx1ZSkge1xuICAgICAgICAgIHByb2plY3RlZFZhbHVlLnBvcyA9IGNoYXJ0UmVjdC54MSArIHByb2plY3RlZFZhbHVlLnBvcztcbiAgICAgICAgICByZXR1cm4gcHJvamVjdGVkVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB4OiBvcHRpb25zLmF4aXNYLmxhYmVsT2Zmc2V0LngsXG4gICAgICAgICAgeTogY2hhcnRSZWN0LnkxICsgb3B0aW9ucy5heGlzWC5sYWJlbE9mZnNldC55ICsgKHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0ID8gNSA6IDIwKVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3RlcENvdW50OiB0aGlzLmRhdGEubGFiZWxzLmxlbmd0aCxcbiAgICAgICAgICBzdHJldGNoOiBvcHRpb25zLmZ1bGxXaWR0aFxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICB2YXIgYXhpc1kgPSBuZXcgQ2hhcnRpc3QuTGluZWFyU2NhbGVBeGlzKFxuICAgICAgICBDaGFydGlzdC5BeGlzLnVuaXRzLnksXG4gICAgICAgIGNoYXJ0UmVjdCxcbiAgICAgICAgZnVuY3Rpb24geUF4aXNUcmFuc2Zvcm0ocHJvamVjdGVkVmFsdWUpIHtcbiAgICAgICAgICBwcm9qZWN0ZWRWYWx1ZS5wb3MgPSBjaGFydFJlY3QueTEgLSBwcm9qZWN0ZWRWYWx1ZS5wb3M7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3RlZFZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgeDogb3B0aW9ucy5jaGFydFBhZGRpbmcgKyBvcHRpb25zLmF4aXNZLmxhYmVsT2Zmc2V0LnggKyAodGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QgPyAtMTAgOiAwKSxcbiAgICAgICAgICB5OiBvcHRpb25zLmF4aXNZLmxhYmVsT2Zmc2V0LnkgKyAodGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QgPyAtMTUgOiAwKVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaGlnaExvdzogaGlnaExvdyxcbiAgICAgICAgICBzY2FsZU1pblNwYWNlOiBvcHRpb25zLmF4aXNZLnNjYWxlTWluU3BhY2VcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgLy8gU3RhcnQgZHJhd2luZ1xuICAgICAgdmFyIGxhYmVsR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJykuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWVzLmxhYmVsR3JvdXApLFxuICAgICAgICBncmlkR3JvdXAgPSB0aGlzLnN2Zy5lbGVtKCdnJykuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWVzLmdyaWRHcm91cCk7XG5cbiAgICAgIENoYXJ0aXN0LmNyZWF0ZUF4aXMoXG4gICAgICAgIGF4aXNYLFxuICAgICAgICB0aGlzLmRhdGEubGFiZWxzLFxuICAgICAgICBjaGFydFJlY3QsXG4gICAgICAgIGdyaWRHcm91cCxcbiAgICAgICAgbGFiZWxHcm91cCxcbiAgICAgICAgdGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyXG4gICAgICApO1xuXG4gICAgICBDaGFydGlzdC5jcmVhdGVBeGlzKFxuICAgICAgICBheGlzWSxcbiAgICAgICAgYXhpc1kuYm91bmRzLnZhbHVlcyxcbiAgICAgICAgY2hhcnRSZWN0LFxuICAgICAgICBncmlkR3JvdXAsXG4gICAgICAgIGxhYmVsR3JvdXAsXG4gICAgICAgIHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0LFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICB0aGlzLmV2ZW50RW1pdHRlclxuICAgICAgKTtcblxuICAgICAgLy8gRHJhdyB0aGUgc2VyaWVzXG4gICAgICB0aGlzLmRhdGEuc2VyaWVzLmZvckVhY2goZnVuY3Rpb24oc2VyaWVzLCBzZXJpZXNJbmRleCkge1xuICAgICAgICBzZXJpZXNHcm91cHNbc2VyaWVzSW5kZXhdID0gdGhpcy5zdmcuZWxlbSgnZycpO1xuXG4gICAgICAgIC8vIFdyaXRlIGF0dHJpYnV0ZXMgdG8gc2VyaWVzIGdyb3VwIGVsZW1lbnQuIElmIHNlcmllcyBuYW1lIG9yIG1ldGEgaXMgdW5kZWZpbmVkIHRoZSBhdHRyaWJ1dGVzIHdpbGwgbm90IGJlIHdyaXR0ZW5cbiAgICAgICAgc2VyaWVzR3JvdXBzW3Nlcmllc0luZGV4XS5hdHRyKHtcbiAgICAgICAgICAnc2VyaWVzLW5hbWUnOiBzZXJpZXMubmFtZSxcbiAgICAgICAgICAnbWV0YSc6IENoYXJ0aXN0LnNlcmlhbGl6ZShzZXJpZXMubWV0YSlcbiAgICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgICAvLyBVc2Ugc2VyaWVzIGNsYXNzIGZyb20gc2VyaWVzIGRhdGEgb3IgaWYgbm90IHNldCBnZW5lcmF0ZSBvbmVcbiAgICAgICAgc2VyaWVzR3JvdXBzW3Nlcmllc0luZGV4XS5hZGRDbGFzcyhbXG4gICAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyxcbiAgICAgICAgICAoc2VyaWVzLmNsYXNzTmFtZSB8fCBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzICsgJy0nICsgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZShzZXJpZXNJbmRleCkpXG4gICAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgICB2YXIgcGF0aENvb3JkaW5hdGVzID0gW107XG5cbiAgICAgICAgbm9ybWFsaXplZERhdGFbc2VyaWVzSW5kZXhdLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIHZhbHVlSW5kZXgpIHtcbiAgICAgICAgICB2YXIgcCA9IHtcbiAgICAgICAgICAgIHg6IGNoYXJ0UmVjdC54MSArIGF4aXNYLnByb2plY3RWYWx1ZSh2YWx1ZSwgdmFsdWVJbmRleCwgIG5vcm1hbGl6ZWREYXRhW3Nlcmllc0luZGV4XSkucG9zLFxuICAgICAgICAgICAgeTogY2hhcnRSZWN0LnkxIC0gYXhpc1kucHJvamVjdFZhbHVlKHZhbHVlLCB2YWx1ZUluZGV4LCAgbm9ybWFsaXplZERhdGFbc2VyaWVzSW5kZXhdKS5wb3NcbiAgICAgICAgICB9O1xuICAgICAgICAgIHBhdGhDb29yZGluYXRlcy5wdXNoKHAueCwgcC55KTtcblxuICAgICAgICAgIC8vSWYgd2Ugc2hvdWxkIHNob3cgcG9pbnRzIHdlIG5lZWQgdG8gY3JlYXRlIHRoZW0gbm93IHRvIGF2b2lkIHNlY29uZGFyeSBsb29wXG4gICAgICAgICAgLy8gU21hbGwgb2Zmc2V0IGZvciBGaXJlZm94IHRvIHJlbmRlciBzcXVhcmVzIGNvcnJlY3RseVxuICAgICAgICAgIGlmIChvcHRpb25zLnNob3dQb2ludCkge1xuICAgICAgICAgICAgdmFyIHBvaW50ID0gc2VyaWVzR3JvdXBzW3Nlcmllc0luZGV4XS5lbGVtKCdsaW5lJywge1xuICAgICAgICAgICAgICB4MTogcC54LFxuICAgICAgICAgICAgICB5MTogcC55LFxuICAgICAgICAgICAgICB4MjogcC54ICsgMC4wMSxcbiAgICAgICAgICAgICAgeTI6IHAueVxuICAgICAgICAgICAgfSwgb3B0aW9ucy5jbGFzc05hbWVzLnBvaW50KS5hdHRyKHtcbiAgICAgICAgICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAgICAgICAgICdtZXRhJzogQ2hhcnRpc3QuZ2V0TWV0YURhdGEoc2VyaWVzLCB2YWx1ZUluZGV4KVxuICAgICAgICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIHtcbiAgICAgICAgICAgICAgdHlwZTogJ3BvaW50JyxcbiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICBpbmRleDogdmFsdWVJbmRleCxcbiAgICAgICAgICAgICAgZ3JvdXA6IHNlcmllc0dyb3Vwc1tzZXJpZXNJbmRleF0sXG4gICAgICAgICAgICAgIGVsZW1lbnQ6IHBvaW50LFxuICAgICAgICAgICAgICB4OiBwLngsXG4gICAgICAgICAgICAgIHk6IHAueVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIFRPRE86IE5pY2VyIGhhbmRsaW5nIG9mIGNvbmRpdGlvbnMsIG1heWJlIGNvbXBvc2l0aW9uP1xuICAgICAgICBpZiAob3B0aW9ucy5zaG93TGluZSB8fCBvcHRpb25zLnNob3dBcmVhKSB7XG4gICAgICAgICAgdmFyIHNtb290aGluZyA9IHR5cGVvZiBvcHRpb25zLmxpbmVTbW9vdGggPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgb3B0aW9ucy5saW5lU21vb3RoIDogKG9wdGlvbnMubGluZVNtb290aCA/IENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwoKSA6IENoYXJ0aXN0LkludGVycG9sYXRpb24ubm9uZSgpKSxcbiAgICAgICAgICAgIHBhdGggPSBzbW9vdGhpbmcocGF0aENvb3JkaW5hdGVzKTtcblxuICAgICAgICAgIGlmKG9wdGlvbnMuc2hvd0xpbmUpIHtcbiAgICAgICAgICAgIHZhciBsaW5lID0gc2VyaWVzR3JvdXBzW3Nlcmllc0luZGV4XS5lbGVtKCdwYXRoJywge1xuICAgICAgICAgICAgICBkOiBwYXRoLnN0cmluZ2lmeSgpXG4gICAgICAgICAgICB9LCBvcHRpb25zLmNsYXNzTmFtZXMubGluZSwgdHJ1ZSkuYXR0cih7XG4gICAgICAgICAgICAgICd2YWx1ZXMnOiBub3JtYWxpemVkRGF0YVtzZXJpZXNJbmRleF1cbiAgICAgICAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgdmFsdWVzOiBub3JtYWxpemVkRGF0YVtzZXJpZXNJbmRleF0sXG4gICAgICAgICAgICAgIHBhdGg6IHBhdGguY2xvbmUoKSxcbiAgICAgICAgICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICAgICAgICAgIGluZGV4OiBzZXJpZXNJbmRleCxcbiAgICAgICAgICAgICAgZ3JvdXA6IHNlcmllc0dyb3Vwc1tzZXJpZXNJbmRleF0sXG4gICAgICAgICAgICAgIGVsZW1lbnQ6IGxpbmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKG9wdGlvbnMuc2hvd0FyZWEpIHtcbiAgICAgICAgICAgIC8vIElmIGFyZWFCYXNlIGlzIG91dHNpZGUgdGhlIGNoYXJ0IGFyZWEgKDwgbG93IG9yID4gaGlnaCkgd2UgbmVlZCB0byBzZXQgaXQgcmVzcGVjdGl2ZWx5IHNvIHRoYXRcbiAgICAgICAgICAgIC8vIHRoZSBhcmVhIGlzIG5vdCBkcmF3biBvdXRzaWRlIHRoZSBjaGFydCBhcmVhLlxuICAgICAgICAgICAgdmFyIGFyZWFCYXNlID0gTWF0aC5tYXgoTWF0aC5taW4ob3B0aW9ucy5hcmVhQmFzZSwgYXhpc1kuYm91bmRzLm1heCksIGF4aXNZLmJvdW5kcy5taW4pO1xuXG4gICAgICAgICAgICAvLyBXZSBwcm9qZWN0IHRoZSBhcmVhQmFzZSB2YWx1ZSBpbnRvIHNjcmVlbiBjb29yZGluYXRlc1xuICAgICAgICAgICAgdmFyIGFyZWFCYXNlUHJvamVjdGVkID0gY2hhcnRSZWN0LnkxIC0gYXhpc1kucHJvamVjdFZhbHVlKGFyZWFCYXNlKS5wb3M7XG5cbiAgICAgICAgICAgIC8vIENsb25lIG9yaWdpbmFsIHBhdGggYW5kIHNwbGljZSBvdXIgbmV3IGFyZWEgcGF0aCB0byBhZGQgdGhlIG1pc3NpbmcgcGF0aCBlbGVtZW50cyB0byBjbG9zZSB0aGUgYXJlYSBzaGFwZVxuICAgICAgICAgICAgdmFyIGFyZWFQYXRoID0gcGF0aC5jbG9uZSgpO1xuICAgICAgICAgICAgLy8gTW9kaWZ5IGxpbmUgcGF0aCBhbmQgYWRkIG1pc3NpbmcgZWxlbWVudHMgZm9yIGFyZWFcbiAgICAgICAgICAgIGFyZWFQYXRoLnBvc2l0aW9uKDApXG4gICAgICAgICAgICAgIC5yZW1vdmUoMSlcbiAgICAgICAgICAgICAgLm1vdmUoY2hhcnRSZWN0LngxLCBhcmVhQmFzZVByb2plY3RlZClcbiAgICAgICAgICAgICAgLmxpbmUocGF0aENvb3JkaW5hdGVzWzBdLCBwYXRoQ29vcmRpbmF0ZXNbMV0pXG4gICAgICAgICAgICAgIC5wb3NpdGlvbihhcmVhUGF0aC5wYXRoRWxlbWVudHMubGVuZ3RoKVxuICAgICAgICAgICAgICAubGluZShwYXRoQ29vcmRpbmF0ZXNbcGF0aENvb3JkaW5hdGVzLmxlbmd0aCAtIDJdLCBhcmVhQmFzZVByb2plY3RlZCk7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbmV3IHBhdGggZm9yIHRoZSBhcmVhIHNoYXBlIHdpdGggdGhlIGFyZWEgY2xhc3MgZnJvbSB0aGUgb3B0aW9uc1xuICAgICAgICAgICAgdmFyIGFyZWEgPSBzZXJpZXNHcm91cHNbc2VyaWVzSW5kZXhdLmVsZW0oJ3BhdGgnLCB7XG4gICAgICAgICAgICAgIGQ6IGFyZWFQYXRoLnN0cmluZ2lmeSgpXG4gICAgICAgICAgICB9LCBvcHRpb25zLmNsYXNzTmFtZXMuYXJlYSwgdHJ1ZSkuYXR0cih7XG4gICAgICAgICAgICAgICd2YWx1ZXMnOiBub3JtYWxpemVkRGF0YVtzZXJpZXNJbmRleF1cbiAgICAgICAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG5cbiAgICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgICAgIHR5cGU6ICdhcmVhJyxcbiAgICAgICAgICAgICAgdmFsdWVzOiBub3JtYWxpemVkRGF0YVtzZXJpZXNJbmRleF0sXG4gICAgICAgICAgICAgIHBhdGg6IGFyZWFQYXRoLmNsb25lKCksXG4gICAgICAgICAgICAgIGNoYXJ0UmVjdDogY2hhcnRSZWN0LFxuICAgICAgICAgICAgICBpbmRleDogc2VyaWVzSW5kZXgsXG4gICAgICAgICAgICAgIGdyb3VwOiBzZXJpZXNHcm91cHNbc2VyaWVzSW5kZXhdLFxuICAgICAgICAgICAgICBlbGVtZW50OiBhcmVhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2NyZWF0ZWQnLCB7XG4gICAgICAgIGJvdW5kczogYXhpc1kuYm91bmRzLFxuICAgICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgICAgc3ZnOiB0aGlzLnN2ZyxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIG5ldyBsaW5lIGNoYXJ0LlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkxpbmVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xOb2RlfSBxdWVyeSBBIHNlbGVjdG9yIHF1ZXJ5IHN0cmluZyBvciBkaXJlY3RseSBhIERPTSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGRhdGEgb2JqZWN0IHRoYXQgbmVlZHMgdG8gY29uc2lzdCBvZiBhIGxhYmVscyBhbmQgYSBzZXJpZXMgYXJyYXlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdCB3aXRoIG9wdGlvbnMgdGhhdCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIGEgZGV0YWlsZWQgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbcmVzcG9uc2l2ZU9wdGlvbnNdIFNwZWNpZnkgYW4gYXJyYXkgb2YgcmVzcG9uc2l2ZSBvcHRpb24gYXJyYXlzIHdoaWNoIGFyZSBhIG1lZGlhIHF1ZXJ5IGFuZCBvcHRpb25zIG9iamVjdCBwYWlyID0+IFtbbWVkaWFRdWVyeVN0cmluZywgb3B0aW9uc09iamVjdF0sW21vcmUuLi5dXVxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHdoaWNoIGV4cG9zZXMgdGhlIEFQSSBmb3IgdGhlIGNyZWF0ZWQgY2hhcnRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gQ3JlYXRlIGEgc2ltcGxlIGxpbmUgY2hhcnRcbiAgICAgKiB2YXIgZGF0YSA9IHtcbiAgICAgKiAgIC8vIEEgbGFiZWxzIGFycmF5IHRoYXQgY2FuIGNvbnRhaW4gYW55IHNvcnQgb2YgdmFsdWVzXG4gICAgICogICBsYWJlbHM6IFsnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaSddLFxuICAgICAqICAgLy8gT3VyIHNlcmllcyBhcnJheSB0aGF0IGNvbnRhaW5zIHNlcmllcyBvYmplY3RzIG9yIGluIHRoaXMgY2FzZSBzZXJpZXMgZGF0YSBhcnJheXNcbiAgICAgKiAgIHNlcmllczogW1xuICAgICAqICAgICBbNSwgMiwgNCwgMiwgMF1cbiAgICAgKiAgIF1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogLy8gQXMgb3B0aW9ucyB3ZSBjdXJyZW50bHkgb25seSBzZXQgYSBzdGF0aWMgc2l6ZSBvZiAzMDB4MjAwIHB4XG4gICAgICogdmFyIG9wdGlvbnMgPSB7XG4gICAgICogICB3aWR0aDogJzMwMHB4JyxcbiAgICAgKiAgIGhlaWdodDogJzIwMHB4J1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBJbiB0aGUgZ2xvYmFsIG5hbWUgc3BhY2UgQ2hhcnRpc3Qgd2UgY2FsbCB0aGUgTGluZSBmdW5jdGlvbiB0byBpbml0aWFsaXplIGEgbGluZSBjaGFydC4gQXMgYSBmaXJzdCBwYXJhbWV0ZXIgd2UgcGFzcyBpbiBhIHNlbGVjdG9yIHdoZXJlIHdlIHdvdWxkIGxpa2UgdG8gZ2V0IG91ciBjaGFydCBjcmVhdGVkLiBTZWNvbmQgcGFyYW1ldGVyIGlzIHRoZSBhY3R1YWwgZGF0YSBvYmplY3QgYW5kIGFzIGEgdGhpcmQgcGFyYW1ldGVyIHdlIHBhc3MgaW4gb3VyIG9wdGlvbnNcbiAgICAgKiBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0JywgZGF0YSwgb3B0aW9ucyk7XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIFVzZSBzcGVjaWZpYyBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHdpdGggY29uZmlndXJhdGlvbiBmcm9tIHRoZSBDaGFydGlzdC5JbnRlcnBvbGF0aW9uIG1vZHVsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJy5jdC1jaGFydCcsIHtcbiAgICAgKiAgIGxhYmVsczogWzEsIDIsIDMsIDQsIDVdLFxuICAgICAqICAgc2VyaWVzOiBbXG4gICAgICogICAgIFsxLCAxLCA4LCAxLCA3XVxuICAgICAqICAgXVxuICAgICAqIH0sIHtcbiAgICAgKiAgIGxpbmVTbW9vdGg6IENoYXJ0aXN0LkludGVycG9sYXRpb24uY2FyZGluYWwoe1xuICAgICAqICAgICB0ZW5zaW9uOiAwLjJcbiAgICAgKiAgIH0pXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIENyZWF0ZSBhIGxpbmUgY2hhcnQgd2l0aCByZXNwb25zaXZlIG9wdGlvbnNcbiAgICAgKlxuICAgICAqIHZhciBkYXRhID0ge1xuICAgICAqICAgLy8gQSBsYWJlbHMgYXJyYXkgdGhhdCBjYW4gY29udGFpbiBhbnkgc29ydCBvZiB2YWx1ZXNcbiAgICAgKiAgIGxhYmVsczogWydNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5J10sXG4gICAgICogICAvLyBPdXIgc2VyaWVzIGFycmF5IHRoYXQgY29udGFpbnMgc2VyaWVzIG9iamVjdHMgb3IgaW4gdGhpcyBjYXNlIHNlcmllcyBkYXRhIGFycmF5c1xuICAgICAqICAgc2VyaWVzOiBbXG4gICAgICogICAgIFs1LCAyLCA0LCAyLCAwXVxuICAgICAqICAgXVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBJbiBhZGl0aW9uIHRvIHRoZSByZWd1bGFyIG9wdGlvbnMgd2Ugc3BlY2lmeSByZXNwb25zaXZlIG9wdGlvbiBvdmVycmlkZXMgdGhhdCB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGNvbmZpZ3V0YXRpb24gYmFzZWQgb24gdGhlIG1hdGNoaW5nIG1lZGlhIHF1ZXJpZXMuXG4gICAgICogdmFyIHJlc3BvbnNpdmVPcHRpb25zID0gW1xuICAgICAqICAgWydzY3JlZW4gYW5kIChtaW4td2lkdGg6IDY0MXB4KSBhbmQgKG1heC13aWR0aDogMTAyNHB4KScsIHtcbiAgICAgKiAgICAgc2hvd1BvaW50OiBmYWxzZSxcbiAgICAgKiAgICAgYXhpc1g6IHtcbiAgICAgKiAgICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICogICAgICAgICAvLyBXaWxsIHJldHVybiBNb24sIFR1ZSwgV2VkIGV0Yy4gb24gbWVkaXVtIHNjcmVlbnNcbiAgICAgKiAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZSgwLCAzKTtcbiAgICAgKiAgICAgICB9XG4gICAgICogICAgIH1cbiAgICAgKiAgIH1dLFxuICAgICAqICAgWydzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDY0MHB4KScsIHtcbiAgICAgKiAgICAgc2hvd0xpbmU6IGZhbHNlLFxuICAgICAqICAgICBheGlzWDoge1xuICAgICAqICAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgKiAgICAgICAgIC8vIFdpbGwgcmV0dXJuIE0sIFQsIFcgZXRjLiBvbiBzbWFsbCBzY3JlZW5zXG4gICAgICogICAgICAgICByZXR1cm4gdmFsdWVbMF07XG4gICAgICogICAgICAgfVxuICAgICAqICAgICB9XG4gICAgICogICB9XVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBuZXcgQ2hhcnRpc3QuTGluZSgnLmN0LWNoYXJ0JywgZGF0YSwgbnVsbCwgcmVzcG9uc2l2ZU9wdGlvbnMpO1xuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gTGluZShxdWVyeSwgZGF0YSwgb3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMpIHtcbiAgICAgIENoYXJ0aXN0LkxpbmUuc3VwZXIuY29uc3RydWN0b3IuY2FsbCh0aGlzLFxuICAgICAgICBxdWVyeSxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgQ2hhcnRpc3QuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyksXG4gICAgICAgIHJlc3BvbnNpdmVPcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGluZyBsaW5lIGNoYXJ0IHR5cGUgaW4gQ2hhcnRpc3QgbmFtZXNwYWNlXG4gICAgQ2hhcnRpc3QuTGluZSA9IENoYXJ0aXN0LkJhc2UuZXh0ZW5kKHtcbiAgICAgIGNvbnN0cnVjdG9yOiBMaW5lLFxuICAgICAgY3JlYXRlQ2hhcnQ6IGNyZWF0ZUNoYXJ0XG4gICAgfSk7XG5cbiAgfSh3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCkpO1xuICA7LyoqXG4gICAqIFRoZSBiYXIgY2hhcnQgbW9kdWxlIG9mIENoYXJ0aXN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gZHJhdyB1bmlwb2xhciBvciBiaXBvbGFyIGJhciBhbmQgZ3JvdXBlZCBiYXIgY2hhcnRzLlxuICAgKlxuICAgKiBAbW9kdWxlIENoYXJ0aXN0LkJhclxuICAgKi9cbiAgLyogZ2xvYmFsIENoYXJ0aXN0ICovXG4gIChmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBDaGFydGlzdCl7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBvcHRpb25zIGluIGJhciBjaGFydHMuIEV4cGFuZCB0aGUgY29kZSB2aWV3IHRvIHNlZSBhIGRldGFpbGVkIGxpc3Qgb2Ygb3B0aW9ucyB3aXRoIGNvbW1lbnRzLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhclxuICAgICAqL1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIC8vIE9wdGlvbnMgZm9yIFgtQXhpc1xuICAgICAgYXhpc1g6IHtcbiAgICAgICAgLy8gVGhlIG9mZnNldCBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBib3JkZXIgb2YgdGhlIGNvbnRhaW5lclxuICAgICAgICBvZmZzZXQ6IDMwLFxuICAgICAgICAvLyBBbGxvd3MgeW91IHRvIGNvcnJlY3QgbGFiZWwgcG9zaXRpb25pbmcgb24gdGhpcyBheGlzIGJ5IHBvc2l0aXZlIG9yIG5lZ2F0aXZlIHggYW5kIHkgb2Zmc2V0LlxuICAgICAgICBsYWJlbE9mZnNldDoge1xuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMFxuICAgICAgICB9LFxuICAgICAgICAvLyBJZiBsYWJlbHMgc2hvdWxkIGJlIHNob3duIG9yIG5vdFxuICAgICAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgICAgIC8vIElmIHRoZSBheGlzIGdyaWQgc2hvdWxkIGJlIGRyYXduIG9yIG5vdFxuICAgICAgICBzaG93R3JpZDogdHJ1ZSxcbiAgICAgICAgLy8gSW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB0aGF0IGFsbG93cyB5b3UgdG8gaW50ZXJjZXB0IHRoZSB2YWx1ZSBmcm9tIHRoZSBheGlzIGxhYmVsXG4gICAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogQ2hhcnRpc3Qubm9vcCxcbiAgICAgICAgLy8gVGhpcyB2YWx1ZSBzcGVjaWZpZXMgdGhlIG1pbmltdW0gd2lkdGggaW4gcGl4ZWwgb2YgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICAgIHNjYWxlTWluU3BhY2U6IDQwXG4gICAgICB9LFxuICAgICAgLy8gT3B0aW9ucyBmb3IgWS1BeGlzXG4gICAgICBheGlzWToge1xuICAgICAgICAvLyBUaGUgb2Zmc2V0IG9mIHRoZSBjaGFydCBkcmF3aW5nIGFyZWEgdG8gdGhlIGJvcmRlciBvZiB0aGUgY29udGFpbmVyXG4gICAgICAgIG9mZnNldDogNDAsXG4gICAgICAgIC8vIEFsbG93cyB5b3UgdG8gY29ycmVjdCBsYWJlbCBwb3NpdGlvbmluZyBvbiB0aGlzIGF4aXMgYnkgcG9zaXRpdmUgb3IgbmVnYXRpdmUgeCBhbmQgeSBvZmZzZXQuXG4gICAgICAgIGxhYmVsT2Zmc2V0OiB7XG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwXG4gICAgICAgIH0sXG4gICAgICAgIC8vIElmIGxhYmVscyBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gICAgICAgIHNob3dMYWJlbDogdHJ1ZSxcbiAgICAgICAgLy8gSWYgdGhlIGF4aXMgZ3JpZCBzaG91bGQgYmUgZHJhd24gb3Igbm90XG4gICAgICAgIHNob3dHcmlkOiB0cnVlLFxuICAgICAgICAvLyBJbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgdGhlIHZhbHVlIGZyb20gdGhlIGF4aXMgbGFiZWxcbiAgICAgICAgbGFiZWxJbnRlcnBvbGF0aW9uRm5jOiBDaGFydGlzdC5ub29wLFxuICAgICAgICAvLyBUaGlzIHZhbHVlIHNwZWNpZmllcyB0aGUgbWluaW11bSBoZWlnaHQgaW4gcGl4ZWwgb2YgdGhlIHNjYWxlIHN0ZXBzXG4gICAgICAgIHNjYWxlTWluU3BhY2U6IDIwXG4gICAgICB9LFxuICAgICAgLy8gU3BlY2lmeSBhIGZpeGVkIHdpZHRoIGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICAgIHdpZHRoOiB1bmRlZmluZWQsXG4gICAgICAvLyBTcGVjaWZ5IGEgZml4ZWQgaGVpZ2h0IGZvciB0aGUgY2hhcnQgYXMgYSBzdHJpbmcgKGkuZS4gJzEwMHB4JyBvciAnNTAlJylcbiAgICAgIGhlaWdodDogdW5kZWZpbmVkLFxuICAgICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBoaWdoIG9mIHRoZSBjaGFydCBhbGxvd3MgeW91IHRvIHpvb20gaW4gb3IgbGltaXQgdGhlIGNoYXJ0cyBoaWdoZXN0IGRpc3BsYXllZCB2YWx1ZVxuICAgICAgaGlnaDogdW5kZWZpbmVkLFxuICAgICAgLy8gT3ZlcnJpZGluZyB0aGUgbmF0dXJhbCBsb3cgb2YgdGhlIGNoYXJ0IGFsbG93cyB5b3UgdG8gem9vbSBpbiBvciBsaW1pdCB0aGUgY2hhcnRzIGxvd2VzdCBkaXNwbGF5ZWQgdmFsdWVcbiAgICAgIGxvdzogdW5kZWZpbmVkLFxuICAgICAgLy8gUGFkZGluZyBvZiB0aGUgY2hhcnQgZHJhd2luZyBhcmVhIHRvIHRoZSBjb250YWluZXIgZWxlbWVudCBhbmQgbGFiZWxzXG4gICAgICBjaGFydFBhZGRpbmc6IDUsXG4gICAgICAvLyBTcGVjaWZ5IHRoZSBkaXN0YW5jZSBpbiBwaXhlbCBvZiBiYXJzIGluIGEgZ3JvdXBcbiAgICAgIHNlcmllc0JhckRpc3RhbmNlOiAxNSxcbiAgICAgIC8vIElmIHNldCB0byB0cnVlIHRoaXMgcHJvcGVydHkgd2lsbCBjYXVzZSB0aGUgc2VyaWVzIGJhcnMgdG8gYmUgc3RhY2tlZCBhbmQgZm9ybSBhIHRvdGFsIGZvciBlYWNoIHNlcmllcyBwb2ludC4gVGhpcyB3aWxsIGFsc28gaW5mbHVlbmNlIHRoZSB5LWF4aXMgYW5kIHRoZSBvdmVyYWxsIGJvdW5kcyBvZiB0aGUgY2hhcnQuIEluIHN0YWNrZWQgbW9kZSB0aGUgc2VyaWVzQmFyRGlzdGFuY2UgcHJvcGVydHkgd2lsbCBoYXZlIG5vIGVmZmVjdC5cbiAgICAgIHN0YWNrQmFyczogZmFsc2UsXG4gICAgICAvLyBJbnZlcnRzIHRoZSBheGVzIG9mIHRoZSBiYXIgY2hhcnQgaW4gb3JkZXIgdG8gZHJhdyBhIGhvcml6b250YWwgYmFyIGNoYXJ0LiBCZSBhd2FyZSB0aGF0IHlvdSBhbHNvIG5lZWQgdG8gaW52ZXJ0IHlvdXIgYXhpcyBzZXR0aW5ncyBhcyB0aGUgWSBBeGlzIHdpbGwgbm93IGRpc3BsYXkgdGhlIGxhYmVscyBhbmQgdGhlIFggQXhpcyB0aGUgdmFsdWVzLlxuICAgICAgaG9yaXpvbnRhbEJhcnM6IGZhbHNlLFxuICAgICAgLy8gSWYgdHJ1ZSB0aGUgd2hvbGUgZGF0YSBpcyByZXZlcnNlZCBpbmNsdWRpbmcgbGFiZWxzLCB0aGUgc2VyaWVzIG9yZGVyIGFzIHdlbGwgYXMgdGhlIHdob2xlIHNlcmllcyBkYXRhIGFycmF5cy5cbiAgICAgIHJldmVyc2VEYXRhOiBmYWxzZSxcbiAgICAgIC8vIE92ZXJyaWRlIHRoZSBjbGFzcyBuYW1lcyB0aGF0IGdldCB1c2VkIHRvIGdlbmVyYXRlIHRoZSBTVkcgc3RydWN0dXJlIG9mIHRoZSBjaGFydFxuICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICBjaGFydDogJ2N0LWNoYXJ0LWJhcicsXG4gICAgICAgIGxhYmVsOiAnY3QtbGFiZWwnLFxuICAgICAgICBsYWJlbEdyb3VwOiAnY3QtbGFiZWxzJyxcbiAgICAgICAgc2VyaWVzOiAnY3Qtc2VyaWVzJyxcbiAgICAgICAgYmFyOiAnY3QtYmFyJyxcbiAgICAgICAgZ3JpZDogJ2N0LWdyaWQnLFxuICAgICAgICBncmlkR3JvdXA6ICdjdC1ncmlkcycsXG4gICAgICAgIHZlcnRpY2FsOiAnY3QtdmVydGljYWwnLFxuICAgICAgICBob3Jpem9udGFsOiAnY3QtaG9yaXpvbnRhbCdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBjaGFydFxuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlQ2hhcnQob3B0aW9ucykge1xuICAgICAgdmFyIHNlcmllc0dyb3VwcyA9IFtdLFxuICAgICAgICBub3JtYWxpemVkRGF0YSA9IENoYXJ0aXN0Lm5vcm1hbGl6ZURhdGFBcnJheShDaGFydGlzdC5nZXREYXRhQXJyYXkodGhpcy5kYXRhLCBvcHRpb25zLnJldmVyc2VEYXRhKSwgdGhpcy5kYXRhLmxhYmVscy5sZW5ndGgpLFxuICAgICAgICBoaWdoTG93O1xuXG4gICAgICAvLyBDcmVhdGUgbmV3IHN2ZyBlbGVtZW50XG4gICAgICB0aGlzLnN2ZyA9IENoYXJ0aXN0LmNyZWF0ZVN2Zyh0aGlzLmNvbnRhaW5lciwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsIG9wdGlvbnMuY2xhc3NOYW1lcy5jaGFydCk7XG5cbiAgICAgIGlmKG9wdGlvbnMuc3RhY2tCYXJzKSB7XG4gICAgICAgIC8vIElmIHN0YWNrZWQgYmFycyB3ZSBuZWVkIHRvIGNhbGN1bGF0ZSB0aGUgaGlnaCBsb3cgZnJvbSBzdGFja2VkIHZhbHVlcyBmcm9tIGVhY2ggc2VyaWVzXG4gICAgICAgIHZhciBzZXJpYWxTdW1zID0gQ2hhcnRpc3Quc2VyaWFsTWFwKG5vcm1hbGl6ZWREYXRhLCBmdW5jdGlvbiBzZXJpYWxTdW1zKCkge1xuICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLnJlZHVjZShDaGFydGlzdC5zdW0sIDApO1xuICAgICAgICB9KTtcblxuICAgICAgICBoaWdoTG93ID0gQ2hhcnRpc3QuZ2V0SGlnaExvdyhbc2VyaWFsU3Vtc10pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlnaExvdyA9IENoYXJ0aXN0LmdldEhpZ2hMb3cobm9ybWFsaXplZERhdGEpO1xuICAgICAgfVxuICAgICAgLy8gT3ZlcnJpZGVzIG9mIGhpZ2ggLyBsb3cgZnJvbSBzZXR0aW5nc1xuICAgICAgaGlnaExvdy5oaWdoID0gK29wdGlvbnMuaGlnaCB8fCAob3B0aW9ucy5oaWdoID09PSAwID8gMCA6IGhpZ2hMb3cuaGlnaCk7XG4gICAgICBoaWdoTG93LmxvdyA9ICtvcHRpb25zLmxvdyB8fCAob3B0aW9ucy5sb3cgPT09IDAgPyAwIDogaGlnaExvdy5sb3cpO1xuXG4gICAgICB2YXIgY2hhcnRSZWN0ID0gQ2hhcnRpc3QuY3JlYXRlQ2hhcnRSZWN0KHRoaXMuc3ZnLCBvcHRpb25zKTtcblxuICAgICAgdmFyIHZhbHVlQXhpcyxcbiAgICAgICAgbGFiZWxBeGlzO1xuXG4gICAgICBpZihvcHRpb25zLmhvcml6b250YWxCYXJzKSB7XG4gICAgICAgIGxhYmVsQXhpcyA9IG5ldyBDaGFydGlzdC5TdGVwQXhpcyhcbiAgICAgICAgICBDaGFydGlzdC5BeGlzLnVuaXRzLnksXG4gICAgICAgICAgY2hhcnRSZWN0LFxuICAgICAgICAgIGZ1bmN0aW9uIHRpbWVBeGlzVHJhbnNmb3JtKHByb2plY3RlZFZhbHVlKSB7XG4gICAgICAgICAgICBwcm9qZWN0ZWRWYWx1ZS5wb3MgPSBjaGFydFJlY3QueTEgLSBwcm9qZWN0ZWRWYWx1ZS5wb3M7XG4gICAgICAgICAgICByZXR1cm4gcHJvamVjdGVkVmFsdWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB4OiBvcHRpb25zLmNoYXJ0UGFkZGluZyArIG9wdGlvbnMuYXhpc1kubGFiZWxPZmZzZXQueCArICh0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCA/IC0xMCA6IDApLFxuICAgICAgICAgICAgeTogb3B0aW9ucy5heGlzWS5sYWJlbE9mZnNldC55IC0gY2hhcnRSZWN0LmhlaWdodCgpIC8gdGhpcy5kYXRhLmxhYmVscy5sZW5ndGhcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0ZXBDb3VudDogdGhpcy5kYXRhLmxhYmVscy5sZW5ndGgsXG4gICAgICAgICAgICBzdHJldGNoOiBvcHRpb25zLmZ1bGxIZWlnaHRcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgdmFsdWVBeGlzID0gbmV3IENoYXJ0aXN0LkxpbmVhclNjYWxlQXhpcyhcbiAgICAgICAgICBDaGFydGlzdC5BeGlzLnVuaXRzLngsXG4gICAgICAgICAgY2hhcnRSZWN0LFxuICAgICAgICAgIGZ1bmN0aW9uIHZhbHVlQXhpc1RyYW5zZm9ybShwcm9qZWN0ZWRWYWx1ZSkge1xuICAgICAgICAgICAgcHJvamVjdGVkVmFsdWUucG9zID0gY2hhcnRSZWN0LngxICsgcHJvamVjdGVkVmFsdWUucG9zO1xuICAgICAgICAgICAgcmV0dXJuIHByb2plY3RlZFZhbHVlO1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogb3B0aW9ucy5heGlzWC5sYWJlbE9mZnNldC54LFxuICAgICAgICAgICAgeTogY2hhcnRSZWN0LnkxICsgb3B0aW9ucy5heGlzWC5sYWJlbE9mZnNldC55ICsgKHRoaXMuc3VwcG9ydHNGb3JlaWduT2JqZWN0ID8gNSA6IDIwKVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgaGlnaExvdzogaGlnaExvdyxcbiAgICAgICAgICAgIHNjYWxlTWluU3BhY2U6IG9wdGlvbnMuYXhpc1guc2NhbGVNaW5TcGFjZSxcbiAgICAgICAgICAgIHJlZmVyZW5jZVZhbHVlOiAwXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFiZWxBeGlzID0gbmV3IENoYXJ0aXN0LlN0ZXBBeGlzKFxuICAgICAgICAgIENoYXJ0aXN0LkF4aXMudW5pdHMueCxcbiAgICAgICAgICBjaGFydFJlY3QsXG4gICAgICAgICAgZnVuY3Rpb24gdGltZUF4aXNUcmFuc2Zvcm0ocHJvamVjdGVkVmFsdWUpIHtcbiAgICAgICAgICAgIHByb2plY3RlZFZhbHVlLnBvcyA9IGNoYXJ0UmVjdC54MSArIHByb2plY3RlZFZhbHVlLnBvcztcbiAgICAgICAgICAgIHJldHVybiBwcm9qZWN0ZWRWYWx1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IG9wdGlvbnMuYXhpc1gubGFiZWxPZmZzZXQueCxcbiAgICAgICAgICAgIHk6IGNoYXJ0UmVjdC55MSArIG9wdGlvbnMuYXhpc1gubGFiZWxPZmZzZXQueSArICh0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCA/IDUgOiAyMClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0ZXBDb3VudDogdGhpcy5kYXRhLmxhYmVscy5sZW5ndGhcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgdmFsdWVBeGlzID0gbmV3IENoYXJ0aXN0LkxpbmVhclNjYWxlQXhpcyhcbiAgICAgICAgICBDaGFydGlzdC5BeGlzLnVuaXRzLnksXG4gICAgICAgICAgY2hhcnRSZWN0LFxuICAgICAgICAgIGZ1bmN0aW9uIHZhbHVlQXhpc1RyYW5zZm9ybShwcm9qZWN0ZWRWYWx1ZSkge1xuICAgICAgICAgICAgcHJvamVjdGVkVmFsdWUucG9zID0gY2hhcnRSZWN0LnkxIC0gcHJvamVjdGVkVmFsdWUucG9zO1xuICAgICAgICAgICAgcmV0dXJuIHByb2plY3RlZFZhbHVlO1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogb3B0aW9ucy5jaGFydFBhZGRpbmcgKyBvcHRpb25zLmF4aXNZLmxhYmVsT2Zmc2V0LnggKyAodGhpcy5zdXBwb3J0c0ZvcmVpZ25PYmplY3QgPyAtMTAgOiAwKSxcbiAgICAgICAgICAgIHk6IG9wdGlvbnMuYXhpc1kubGFiZWxPZmZzZXQueSArICh0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCA/IC0xNSA6IDApXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBoaWdoTG93OiBoaWdoTG93LFxuICAgICAgICAgICAgc2NhbGVNaW5TcGFjZTogb3B0aW9ucy5heGlzWS5zY2FsZU1pblNwYWNlLFxuICAgICAgICAgICAgcmVmZXJlbmNlVmFsdWU6IDBcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFN0YXJ0IGRyYXdpbmdcbiAgICAgIHZhciBsYWJlbEdyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpLmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lcy5sYWJlbEdyb3VwKSxcbiAgICAgICAgZ3JpZEdyb3VwID0gdGhpcy5zdmcuZWxlbSgnZycpLmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lcy5ncmlkR3JvdXApLFxuICAgICAgICAvLyBQcm9qZWN0ZWQgMCBwb2ludFxuICAgICAgICB6ZXJvUG9pbnQgPSBvcHRpb25zLmhvcml6b250YWxCYXJzID8gKGNoYXJ0UmVjdC54MSArIHZhbHVlQXhpcy5wcm9qZWN0VmFsdWUoMCkucG9zKSA6IChjaGFydFJlY3QueTEgLSB2YWx1ZUF4aXMucHJvamVjdFZhbHVlKDApLnBvcyksXG4gICAgICAgIC8vIFVzZWQgdG8gdHJhY2sgdGhlIHNjcmVlbiBjb29yZGluYXRlcyBvZiBzdGFja2VkIGJhcnNcbiAgICAgICAgc3RhY2tlZEJhclZhbHVlcyA9IFtdO1xuXG4gICAgICBDaGFydGlzdC5jcmVhdGVBeGlzKFxuICAgICAgICBsYWJlbEF4aXMsXG4gICAgICAgIHRoaXMuZGF0YS5sYWJlbHMsXG4gICAgICAgIGNoYXJ0UmVjdCxcbiAgICAgICAgZ3JpZEdyb3VwLFxuICAgICAgICBsYWJlbEdyb3VwLFxuICAgICAgICB0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXJcbiAgICAgICk7XG5cbiAgICAgIENoYXJ0aXN0LmNyZWF0ZUF4aXMoXG4gICAgICAgIHZhbHVlQXhpcyxcbiAgICAgICAgdmFsdWVBeGlzLmJvdW5kcy52YWx1ZXMsXG4gICAgICAgIGNoYXJ0UmVjdCxcbiAgICAgICAgZ3JpZEdyb3VwLFxuICAgICAgICBsYWJlbEdyb3VwLFxuICAgICAgICB0aGlzLnN1cHBvcnRzRm9yZWlnbk9iamVjdCxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXJcbiAgICAgICk7XG5cbiAgICAgIC8vIERyYXcgdGhlIHNlcmllc1xuICAgICAgdGhpcy5kYXRhLnNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uKHNlcmllcywgc2VyaWVzSW5kZXgpIHtcbiAgICAgICAgLy8gQ2FsY3VsYXRpbmcgYmktcG9sYXIgdmFsdWUgb2YgaW5kZXggZm9yIHNlcmllc09mZnNldC4gRm9yIGkgPSAwLi40IGJpUG9sIHdpbGwgYmUgLTEuNSwgLTAuNSwgMC41LCAxLjUgZXRjLlxuICAgICAgICB2YXIgYmlQb2wgPSBzZXJpZXNJbmRleCAtICh0aGlzLmRhdGEuc2VyaWVzLmxlbmd0aCAtIDEpIC8gMixcbiAgICAgICAgLy8gSGFsZiBvZiB0aGUgcGVyaW9kIHdpZHRoIGJldHdlZW4gdmVydGljYWwgZ3JpZCBsaW5lcyB1c2VkIHRvIHBvc2l0aW9uIGJhcnNcbiAgICAgICAgICBwZXJpb2RIYWxmTGVuZ3RoID0gY2hhcnRSZWN0W2xhYmVsQXhpcy51bml0cy5sZW5dKCkgLyBub3JtYWxpemVkRGF0YVtzZXJpZXNJbmRleF0ubGVuZ3RoIC8gMjtcblxuICAgICAgICBzZXJpZXNHcm91cHNbc2VyaWVzSW5kZXhdID0gdGhpcy5zdmcuZWxlbSgnZycpO1xuXG4gICAgICAgIC8vIFdyaXRlIGF0dHJpYnV0ZXMgdG8gc2VyaWVzIGdyb3VwIGVsZW1lbnQuIElmIHNlcmllcyBuYW1lIG9yIG1ldGEgaXMgdW5kZWZpbmVkIHRoZSBhdHRyaWJ1dGVzIHdpbGwgbm90IGJlIHdyaXR0ZW5cbiAgICAgICAgc2VyaWVzR3JvdXBzW3Nlcmllc0luZGV4XS5hdHRyKHtcbiAgICAgICAgICAnc2VyaWVzLW5hbWUnOiBzZXJpZXMubmFtZSxcbiAgICAgICAgICAnbWV0YSc6IENoYXJ0aXN0LnNlcmlhbGl6ZShzZXJpZXMubWV0YSlcbiAgICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgICAvLyBVc2Ugc2VyaWVzIGNsYXNzIGZyb20gc2VyaWVzIGRhdGEgb3IgaWYgbm90IHNldCBnZW5lcmF0ZSBvbmVcbiAgICAgICAgc2VyaWVzR3JvdXBzW3Nlcmllc0luZGV4XS5hZGRDbGFzcyhbXG4gICAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzLnNlcmllcyxcbiAgICAgICAgICAoc2VyaWVzLmNsYXNzTmFtZSB8fCBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzICsgJy0nICsgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZShzZXJpZXNJbmRleCkpXG4gICAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgICBub3JtYWxpemVkRGF0YVtzZXJpZXNJbmRleF0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgdmFsdWVJbmRleCkge1xuICAgICAgICAgIHZhciBwcm9qZWN0ZWQgPSB7XG4gICAgICAgICAgICAgIHg6IGNoYXJ0UmVjdC54MSArIChvcHRpb25zLmhvcml6b250YWxCYXJzID8gdmFsdWVBeGlzIDogbGFiZWxBeGlzKS5wcm9qZWN0VmFsdWUodmFsdWUsIHZhbHVlSW5kZXgsIG5vcm1hbGl6ZWREYXRhW3Nlcmllc0luZGV4XSkucG9zLFxuICAgICAgICAgICAgICB5OiBjaGFydFJlY3QueTEgLSAob3B0aW9ucy5ob3Jpem9udGFsQmFycyA/IGxhYmVsQXhpcyA6IHZhbHVlQXhpcykucHJvamVjdFZhbHVlKHZhbHVlLCB2YWx1ZUluZGV4LCBub3JtYWxpemVkRGF0YVtzZXJpZXNJbmRleF0pLnBvc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhcixcbiAgICAgICAgICAgIHByZXZpb3VzU3RhY2s7XG5cbiAgICAgICAgICAvLyBPZmZzZXQgdG8gY2VudGVyIGJhciBiZXR3ZWVuIGdyaWQgbGluZXNcbiAgICAgICAgICBwcm9qZWN0ZWRbbGFiZWxBeGlzLnVuaXRzLnBvc10gKz0gcGVyaW9kSGFsZkxlbmd0aCAqIChvcHRpb25zLmhvcml6b250YWxCYXJzID8gLTEgOiAxKTtcbiAgICAgICAgICAvLyBVc2luZyBiaS1wb2xhciBvZmZzZXQgZm9yIG11bHRpcGxlIHNlcmllcyBpZiBubyBzdGFja2VkIGJhcnMgYXJlIHVzZWRcbiAgICAgICAgICBwcm9qZWN0ZWRbbGFiZWxBeGlzLnVuaXRzLnBvc10gKz0gb3B0aW9ucy5zdGFja0JhcnMgPyAwIDogYmlQb2wgKiBvcHRpb25zLnNlcmllc0JhckRpc3RhbmNlICogKG9wdGlvbnMuaG9yaXpvbnRhbEJhcnMgPyAtMSA6IDEpO1xuXG4gICAgICAgICAgLy8gRW50ZXIgdmFsdWUgaW4gc3RhY2tlZCBiYXIgdmFsdWVzIHVzZWQgdG8gcmVtZW1iZXIgcHJldmlvdXMgc2NyZWVuIHZhbHVlIGZvciBzdGFja2luZyB1cCBiYXJzXG4gICAgICAgICAgcHJldmlvdXNTdGFjayA9IHN0YWNrZWRCYXJWYWx1ZXNbdmFsdWVJbmRleF0gfHwgemVyb1BvaW50O1xuICAgICAgICAgIHN0YWNrZWRCYXJWYWx1ZXNbdmFsdWVJbmRleF0gPSBwcmV2aW91c1N0YWNrIC0gKHplcm9Qb2ludCAtIHByb2plY3RlZFtsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvc10pO1xuXG4gICAgICAgICAgdmFyIHBvc2l0aW9ucyA9IHt9O1xuICAgICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMudW5pdHMucG9zICsgJzEnXSA9IHByb2plY3RlZFtsYWJlbEF4aXMudW5pdHMucG9zXTtcbiAgICAgICAgICBwb3NpdGlvbnNbbGFiZWxBeGlzLnVuaXRzLnBvcyArICcyJ10gPSBwcm9qZWN0ZWRbbGFiZWxBeGlzLnVuaXRzLnBvc107XG4gICAgICAgICAgLy8gSWYgYmFycyBhcmUgc3RhY2tlZCB3ZSB1c2UgdGhlIHN0YWNrZWRCYXJWYWx1ZXMgcmVmZXJlbmNlIGFuZCBvdGhlcndpc2UgYmFzZSBhbGwgYmFycyBvZmYgdGhlIHplcm8gbGluZVxuICAgICAgICAgIHBvc2l0aW9uc1tsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvcyArICcxJ10gPSBvcHRpb25zLnN0YWNrQmFycyA/IHByZXZpb3VzU3RhY2sgOiB6ZXJvUG9pbnQ7XG4gICAgICAgICAgcG9zaXRpb25zW2xhYmVsQXhpcy5jb3VudGVyVW5pdHMucG9zICsgJzInXSA9IG9wdGlvbnMuc3RhY2tCYXJzID8gc3RhY2tlZEJhclZhbHVlc1t2YWx1ZUluZGV4XSA6IHByb2plY3RlZFtsYWJlbEF4aXMuY291bnRlclVuaXRzLnBvc107XG5cbiAgICAgICAgICBiYXIgPSBzZXJpZXNHcm91cHNbc2VyaWVzSW5kZXhdLmVsZW0oJ2xpbmUnLCBwb3NpdGlvbnMsIG9wdGlvbnMuY2xhc3NOYW1lcy5iYXIpLmF0dHIoe1xuICAgICAgICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAgICAgICAnbWV0YSc6IENoYXJ0aXN0LmdldE1ldGFEYXRhKHNlcmllcywgdmFsdWVJbmRleClcbiAgICAgICAgICB9LCBDaGFydGlzdC54bWxOcy51cmkpO1xuXG4gICAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnZHJhdycsIENoYXJ0aXN0LmV4dGVuZCh7XG4gICAgICAgICAgICB0eXBlOiAnYmFyJyxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGluZGV4OiB2YWx1ZUluZGV4LFxuICAgICAgICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICAgICAgICBncm91cDogc2VyaWVzR3JvdXBzW3Nlcmllc0luZGV4XSxcbiAgICAgICAgICAgIGVsZW1lbnQ6IGJhclxuICAgICAgICAgIH0sIHBvc2l0aW9ucykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnY3JlYXRlZCcsIHtcbiAgICAgICAgYm91bmRzOiB2YWx1ZUF4aXMuYm91bmRzLFxuICAgICAgICBjaGFydFJlY3Q6IGNoYXJ0UmVjdCxcbiAgICAgICAgc3ZnOiB0aGlzLnN2ZyxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIG5ldyBiYXIgY2hhcnQgYW5kIHJldHVybnMgQVBJIG9iamVjdCB0aGF0IHlvdSBjYW4gdXNlIGZvciBsYXRlciBjaGFuZ2VzLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LkJhclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IHF1ZXJ5IEEgc2VsZWN0b3IgcXVlcnkgc3RyaW5nIG9yIGRpcmVjdGx5IGEgRE9NIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBvYmplY3QgdGhhdCBuZWVkcyB0byBjb25zaXN0IG9mIGEgbGFiZWxzIGFuZCBhIHNlcmllcyBhcnJheVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0IHdpdGggb3B0aW9ucyB0aGF0IG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuIENoZWNrIHRoZSBleGFtcGxlcyBmb3IgYSBkZXRhaWxlZCBsaXN0LlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtyZXNwb25zaXZlT3B0aW9uc10gU3BlY2lmeSBhbiBhcnJheSBvZiByZXNwb25zaXZlIG9wdGlvbiBhcnJheXMgd2hpY2ggYXJlIGEgbWVkaWEgcXVlcnkgYW5kIG9wdGlvbnMgb2JqZWN0IHBhaXIgPT4gW1ttZWRpYVF1ZXJ5U3RyaW5nLCBvcHRpb25zT2JqZWN0XSxbbW9yZS4uLl1dXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3Qgd2hpY2ggZXhwb3NlcyB0aGUgQVBJIGZvciB0aGUgY3JlYXRlZCBjaGFydFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBDcmVhdGUgYSBzaW1wbGUgYmFyIGNoYXJ0XG4gICAgICogdmFyIGRhdGEgPSB7XG4gICAgICogICBsYWJlbHM6IFsnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaSddLFxuICAgICAqICAgc2VyaWVzOiBbXG4gICAgICogICAgIFs1LCAyLCA0LCAyLCAwXVxuICAgICAqICAgXVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBJbiB0aGUgZ2xvYmFsIG5hbWUgc3BhY2UgQ2hhcnRpc3Qgd2UgY2FsbCB0aGUgQmFyIGZ1bmN0aW9uIHRvIGluaXRpYWxpemUgYSBiYXIgY2hhcnQuIEFzIGEgZmlyc3QgcGFyYW1ldGVyIHdlIHBhc3MgaW4gYSBzZWxlY3RvciB3aGVyZSB3ZSB3b3VsZCBsaWtlIHRvIGdldCBvdXIgY2hhcnQgY3JlYXRlZCBhbmQgYXMgYSBzZWNvbmQgcGFyYW1ldGVyIHdlIHBhc3Mgb3VyIGRhdGEgb2JqZWN0LlxuICAgICAqIG5ldyBDaGFydGlzdC5CYXIoJy5jdC1jaGFydCcsIGRhdGEpO1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBUaGlzIGV4YW1wbGUgY3JlYXRlcyBhIGJpcG9sYXIgZ3JvdXBlZCBiYXIgY2hhcnQgd2hlcmUgdGhlIGJvdW5kYXJpZXMgYXJlIGxpbWl0dGVkIHRvIC0xMCBhbmQgMTBcbiAgICAgKiBuZXcgQ2hhcnRpc3QuQmFyKCcuY3QtY2hhcnQnLCB7XG4gICAgICogICBsYWJlbHM6IFsxLCAyLCAzLCA0LCA1LCA2LCA3XSxcbiAgICAgKiAgIHNlcmllczogW1xuICAgICAqICAgICBbMSwgMywgMiwgLTUsIC0zLCAxLCAtNl0sXG4gICAgICogICAgIFstNSwgLTIsIC00LCAtMSwgMiwgLTMsIDFdXG4gICAgICogICBdXG4gICAgICogfSwge1xuICAgICAqICAgc2VyaWVzQmFyRGlzdGFuY2U6IDEyLFxuICAgICAqICAgbG93OiAtMTAsXG4gICAgICogICBoaWdoOiAxMFxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICovXG4gICAgZnVuY3Rpb24gQmFyKHF1ZXJ5LCBkYXRhLCBvcHRpb25zLCByZXNwb25zaXZlT3B0aW9ucykge1xuICAgICAgQ2hhcnRpc3QuQmFyLnN1cGVyLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxcbiAgICAgICAgcXVlcnksXG4gICAgICAgIGRhdGEsXG4gICAgICAgIENoYXJ0aXN0LmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpLFxuICAgICAgICByZXNwb25zaXZlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRpbmcgYmFyIGNoYXJ0IHR5cGUgaW4gQ2hhcnRpc3QgbmFtZXNwYWNlXG4gICAgQ2hhcnRpc3QuQmFyID0gQ2hhcnRpc3QuQmFzZS5leHRlbmQoe1xuICAgICAgY29uc3RydWN0b3I6IEJhcixcbiAgICAgIGNyZWF0ZUNoYXJ0OiBjcmVhdGVDaGFydFxuICAgIH0pO1xuXG4gIH0od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpKTtcbiAgOy8qKlxuICAgKiBUaGUgcGllIGNoYXJ0IG1vZHVsZSBvZiBDaGFydGlzdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGRyYXcgcGllLCBkb251dCBvciBnYXVnZSBjaGFydHNcbiAgICpcbiAgICogQG1vZHVsZSBDaGFydGlzdC5QaWVcbiAgICovXG4gIC8qIGdsb2JhbCBDaGFydGlzdCAqL1xuICAoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgQ2hhcnRpc3QpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IG9wdGlvbnMgaW4gbGluZSBjaGFydHMuIEV4cGFuZCB0aGUgY29kZSB2aWV3IHRvIHNlZSBhIGRldGFpbGVkIGxpc3Qgb2Ygb3B0aW9ucyB3aXRoIGNvbW1lbnRzLlxuICAgICAqXG4gICAgICogQG1lbWJlcm9mIENoYXJ0aXN0LlBpZVxuICAgICAqL1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIC8vIFNwZWNpZnkgYSBmaXhlZCB3aWR0aCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgICB3aWR0aDogdW5kZWZpbmVkLFxuICAgICAgLy8gU3BlY2lmeSBhIGZpeGVkIGhlaWdodCBmb3IgdGhlIGNoYXJ0IGFzIGEgc3RyaW5nIChpLmUuICcxMDBweCcgb3IgJzUwJScpXG4gICAgICBoZWlnaHQ6IHVuZGVmaW5lZCxcbiAgICAgIC8vIFBhZGRpbmcgb2YgdGhlIGNoYXJ0IGRyYXdpbmcgYXJlYSB0byB0aGUgY29udGFpbmVyIGVsZW1lbnQgYW5kIGxhYmVsc1xuICAgICAgY2hhcnRQYWRkaW5nOiA1LFxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGNsYXNzIG5hbWVzIHRoYXQgZ2V0IHVzZWQgdG8gZ2VuZXJhdGUgdGhlIFNWRyBzdHJ1Y3R1cmUgb2YgdGhlIGNoYXJ0XG4gICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgIGNoYXJ0OiAnY3QtY2hhcnQtcGllJyxcbiAgICAgICAgc2VyaWVzOiAnY3Qtc2VyaWVzJyxcbiAgICAgICAgc2xpY2U6ICdjdC1zbGljZScsXG4gICAgICAgIGRvbnV0OiAnY3QtZG9udXQnLFxuICAgICAgICBsYWJlbDogJ2N0LWxhYmVsJ1xuICAgICAgfSxcbiAgICAgIC8vIFRoZSBzdGFydCBhbmdsZSBvZiB0aGUgcGllIGNoYXJ0IGluIGRlZ3JlZXMgd2hlcmUgMCBwb2ludHMgbm9ydGguIEEgaGlnaGVyIHZhbHVlIG9mZnNldHMgdGhlIHN0YXJ0IGFuZ2xlIGNsb2Nrd2lzZS5cbiAgICAgIHN0YXJ0QW5nbGU6IDAsXG4gICAgICAvLyBBbiBvcHRpb25hbCB0b3RhbCB5b3UgY2FuIHNwZWNpZnkuIEJ5IHNwZWNpZnlpbmcgYSB0b3RhbCB2YWx1ZSwgdGhlIHN1bSBvZiB0aGUgdmFsdWVzIGluIHRoZSBzZXJpZXMgbXVzdCBiZSB0aGlzIHRvdGFsIGluIG9yZGVyIHRvIGRyYXcgYSBmdWxsIHBpZS4gWW91IGNhbiB1c2UgdGhpcyBwYXJhbWV0ZXIgdG8gZHJhdyBvbmx5IHBhcnRzIG9mIGEgcGllIG9yIGdhdWdlIGNoYXJ0cy5cbiAgICAgIHRvdGFsOiB1bmRlZmluZWQsXG4gICAgICAvLyBJZiBzcGVjaWZpZWQgdGhlIGRvbnV0IENTUyBjbGFzc2VzIHdpbGwgYmUgdXNlZCBhbmQgc3Ryb2tlcyB3aWxsIGJlIGRyYXduIGluc3RlYWQgb2YgcGllIHNsaWNlcy5cbiAgICAgIGRvbnV0OiBmYWxzZSxcbiAgICAgIC8vIFNwZWNpZnkgdGhlIGRvbnV0IHN0cm9rZSB3aWR0aCwgY3VycmVudGx5IGRvbmUgaW4gamF2YXNjcmlwdCBmb3IgY29udmVuaWVuY2UuIE1heSBtb3ZlIHRvIENTUyBzdHlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgIGRvbnV0V2lkdGg6IDYwLFxuICAgICAgLy8gSWYgYSBsYWJlbCBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gICAgICBzaG93TGFiZWw6IHRydWUsXG4gICAgICAvLyBMYWJlbCBwb3NpdGlvbiBvZmZzZXQgZnJvbSB0aGUgc3RhbmRhcmQgcG9zaXRpb24gd2hpY2ggaXMgaGFsZiBkaXN0YW5jZSBvZiB0aGUgcmFkaXVzLiBUaGlzIHZhbHVlIGNhbiBiZSBlaXRoZXIgcG9zaXRpdmUgb3IgbmVnYXRpdmUuIFBvc2l0aXZlIHZhbHVlcyB3aWxsIHBvc2l0aW9uIHRoZSBsYWJlbCBhd2F5IGZyb20gdGhlIGNlbnRlci5cbiAgICAgIGxhYmVsT2Zmc2V0OiAwLFxuICAgICAgLy8gQW4gaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiBmb3IgdGhlIGxhYmVsIHZhbHVlXG4gICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IENoYXJ0aXN0Lm5vb3AsXG4gICAgICAvLyBMYWJlbCBkaXJlY3Rpb24gY2FuIGJlICduZXV0cmFsJywgJ2V4cGxvZGUnIG9yICdpbXBsb2RlJy4gVGhlIGxhYmVscyBhbmNob3Igd2lsbCBiZSBwb3NpdGlvbmVkIGJhc2VkIG9uIHRob3NlIHNldHRpbmdzIGFzIHdlbGwgYXMgdGhlIGZhY3QgaWYgdGhlIGxhYmVscyBhcmUgb24gdGhlIHJpZ2h0IG9yIGxlZnQgc2lkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBjaGFydC4gVXN1YWxseSBleHBsb2RlIGlzIHVzZWZ1bCB3aGVuIGxhYmVscyBhcmUgcG9zaXRpb25lZCBmYXIgYXdheSBmcm9tIHRoZSBjZW50ZXIuXG4gICAgICBsYWJlbERpcmVjdGlvbjogJ25ldXRyYWwnLFxuICAgICAgLy8gSWYgdHJ1ZSB0aGUgd2hvbGUgZGF0YSBpcyByZXZlcnNlZCBpbmNsdWRpbmcgbGFiZWxzLCB0aGUgc2VyaWVzIG9yZGVyIGFzIHdlbGwgYXMgdGhlIHdob2xlIHNlcmllcyBkYXRhIGFycmF5cy5cbiAgICAgIHJldmVyc2VEYXRhOiBmYWxzZVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIFNWRyBhbmNob3IgcG9zaXRpb24gYmFzZWQgb24gZGlyZWN0aW9uIGFuZCBjZW50ZXIgcGFyYW1ldGVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2VudGVyXG4gICAgICogQHBhcmFtIGxhYmVsXG4gICAgICogQHBhcmFtIGRpcmVjdGlvblxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZXRlcm1pbmVBbmNob3JQb3NpdGlvbihjZW50ZXIsIGxhYmVsLCBkaXJlY3Rpb24pIHtcbiAgICAgIHZhciB0b1RoZVJpZ2h0ID0gbGFiZWwueCA+IGNlbnRlci54O1xuXG4gICAgICBpZih0b1RoZVJpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gJ2V4cGxvZGUnIHx8XG4gICAgICAgICF0b1RoZVJpZ2h0ICYmIGRpcmVjdGlvbiA9PT0gJ2ltcGxvZGUnKSB7XG4gICAgICAgIHJldHVybiAnc3RhcnQnO1xuICAgICAgfSBlbHNlIGlmKHRvVGhlUmlnaHQgJiYgZGlyZWN0aW9uID09PSAnaW1wbG9kZScgfHxcbiAgICAgICAgIXRvVGhlUmlnaHQgJiYgZGlyZWN0aW9uID09PSAnZXhwbG9kZScpIHtcbiAgICAgICAgcmV0dXJuICdlbmQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICdtaWRkbGUnO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIHBpZSBjaGFydFxuICAgICAqXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVDaGFydChvcHRpb25zKSB7XG4gICAgICB2YXIgc2VyaWVzR3JvdXBzID0gW10sXG4gICAgICAgIGNoYXJ0UmVjdCxcbiAgICAgICAgcmFkaXVzLFxuICAgICAgICBsYWJlbFJhZGl1cyxcbiAgICAgICAgdG90YWxEYXRhU3VtLFxuICAgICAgICBzdGFydEFuZ2xlID0gb3B0aW9ucy5zdGFydEFuZ2xlLFxuICAgICAgICBkYXRhQXJyYXkgPSBDaGFydGlzdC5nZXREYXRhQXJyYXkodGhpcy5kYXRhLCBvcHRpb25zLnJldmVyc2VEYXRhKTtcblxuICAgICAgLy8gQ3JlYXRlIFNWRy5qcyBkcmF3XG4gICAgICB0aGlzLnN2ZyA9IENoYXJ0aXN0LmNyZWF0ZVN2Zyh0aGlzLmNvbnRhaW5lciwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsIG9wdGlvbnMuY2xhc3NOYW1lcy5jaGFydCk7XG4gICAgICAvLyBDYWxjdWxhdGUgY2hhcnRpbmcgcmVjdFxuICAgICAgY2hhcnRSZWN0ID0gQ2hhcnRpc3QuY3JlYXRlQ2hhcnRSZWN0KHRoaXMuc3ZnLCBvcHRpb25zLCAwLCAwKTtcbiAgICAgIC8vIEdldCBiaWdnZXN0IGNpcmNsZSByYWRpdXMgcG9zc2libGUgd2l0aGluIGNoYXJ0UmVjdFxuICAgICAgcmFkaXVzID0gTWF0aC5taW4oY2hhcnRSZWN0LndpZHRoKCkgLyAyLCBjaGFydFJlY3QuaGVpZ2h0KCkgLyAyKTtcbiAgICAgIC8vIENhbGN1bGF0ZSB0b3RhbCBvZiBhbGwgc2VyaWVzIHRvIGdldCByZWZlcmVuY2UgdmFsdWUgb3IgdXNlIHRvdGFsIHJlZmVyZW5jZSBmcm9tIG9wdGlvbmFsIG9wdGlvbnNcbiAgICAgIHRvdGFsRGF0YVN1bSA9IG9wdGlvbnMudG90YWwgfHwgZGF0YUFycmF5LnJlZHVjZShmdW5jdGlvbihwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzVmFsdWUgKyBjdXJyZW50VmFsdWU7XG4gICAgICB9LCAwKTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIGRvbnV0IGNoYXJ0IHdlIG5lZWQgdG8gYWRqdXN0IG91ciByYWRpdXMgdG8gZW5hYmxlIHN0cm9rZXMgdG8gYmUgZHJhd24gaW5zaWRlXG4gICAgICAvLyBVbmZvcnR1bmF0ZWx5IHRoaXMgaXMgbm90IHBvc3NpYmxlIHdpdGggdGhlIGN1cnJlbnQgU1ZHIFNwZWNcbiAgICAgIC8vIFNlZSB0aGlzIHByb3Bvc2FsIGZvciBtb3JlIGRldGFpbHM6IGh0dHA6Ly9saXN0cy53My5vcmcvQXJjaGl2ZXMvUHVibGljL3d3dy1zdmcvMjAwM09jdC8wMDAwLmh0bWxcbiAgICAgIHJhZGl1cyAtPSBvcHRpb25zLmRvbnV0ID8gb3B0aW9ucy5kb251dFdpZHRoIC8gMiAgOiAwO1xuXG4gICAgICAvLyBJZiBhIGRvbnV0IGNoYXJ0IHRoZW4gdGhlIGxhYmVsIHBvc2l0aW9uIGlzIGF0IHRoZSByYWRpdXMsIGlmIHJlZ3VsYXIgcGllIGNoYXJ0IGl0J3MgaGFsZiBvZiB0aGUgcmFkaXVzXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dpb25rdW56L2NoYXJ0aXN0LWpzL2lzc3Vlcy8yMVxuICAgICAgbGFiZWxSYWRpdXMgPSBvcHRpb25zLmRvbnV0ID8gcmFkaXVzIDogcmFkaXVzIC8gMjtcbiAgICAgIC8vIEFkZCB0aGUgb2Zmc2V0IHRvIHRoZSBsYWJlbFJhZGl1cyB3aGVyZSBhIG5lZ2F0aXZlIG9mZnNldCBtZWFucyBjbG9zZWQgdG8gdGhlIGNlbnRlciBvZiB0aGUgY2hhcnRcbiAgICAgIGxhYmVsUmFkaXVzICs9IG9wdGlvbnMubGFiZWxPZmZzZXQ7XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBlbmQgYW5nbGUgYmFzZWQgb24gdG90YWwgc3VtIGFuZCBjdXJyZW50IGRhdGEgdmFsdWUgYW5kIG9mZnNldCB3aXRoIHBhZGRpbmdcbiAgICAgIHZhciBjZW50ZXIgPSB7XG4gICAgICAgIHg6IGNoYXJ0UmVjdC54MSArIGNoYXJ0UmVjdC53aWR0aCgpIC8gMixcbiAgICAgICAgeTogY2hhcnRSZWN0LnkyICsgY2hhcnRSZWN0LmhlaWdodCgpIC8gMlxuICAgICAgfTtcblxuICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgb25seSBvbmUgbm9uLXplcm8gdmFsdWUgaW4gdGhlIHNlcmllcyBhcnJheS5cbiAgICAgIHZhciBoYXNTaW5nbGVWYWxJblNlcmllcyA9IHRoaXMuZGF0YS5zZXJpZXMuZmlsdGVyKGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gdmFsICE9PSAwO1xuICAgICAgfSkubGVuZ3RoID09PSAxO1xuXG4gICAgICAvLyBEcmF3IHRoZSBzZXJpZXNcbiAgICAgIC8vIGluaXRpYWxpemUgc2VyaWVzIGdyb3Vwc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuc2VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNlcmllc0dyb3Vwc1tpXSA9IHRoaXMuc3ZnLmVsZW0oJ2cnLCBudWxsLCBudWxsLCB0cnVlKTtcblxuICAgICAgICAvLyBJZiB0aGUgc2VyaWVzIGlzIGFuIG9iamVjdCBhbmQgY29udGFpbnMgYSBuYW1lIHdlIGFkZCBhIGN1c3RvbSBhdHRyaWJ1dGVcbiAgICAgICAgaWYodGhpcy5kYXRhLnNlcmllc1tpXS5uYW1lKSB7XG4gICAgICAgICAgc2VyaWVzR3JvdXBzW2ldLmF0dHIoe1xuICAgICAgICAgICAgJ3Nlcmllcy1uYW1lJzogdGhpcy5kYXRhLnNlcmllc1tpXS5uYW1lLFxuICAgICAgICAgICAgJ21ldGEnOiBDaGFydGlzdC5zZXJpYWxpemUodGhpcy5kYXRhLnNlcmllc1tpXS5tZXRhKVxuICAgICAgICAgIH0sIENoYXJ0aXN0LnhtbE5zLnVyaSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2Ugc2VyaWVzIGNsYXNzIGZyb20gc2VyaWVzIGRhdGEgb3IgaWYgbm90IHNldCBnZW5lcmF0ZSBvbmVcbiAgICAgICAgc2VyaWVzR3JvdXBzW2ldLmFkZENsYXNzKFtcbiAgICAgICAgICBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzLFxuICAgICAgICAgICh0aGlzLmRhdGEuc2VyaWVzW2ldLmNsYXNzTmFtZSB8fCBvcHRpb25zLmNsYXNzTmFtZXMuc2VyaWVzICsgJy0nICsgQ2hhcnRpc3QuYWxwaGFOdW1lcmF0ZShpKSlcbiAgICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICAgIHZhciBlbmRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBkYXRhQXJyYXlbaV0gLyB0b3RhbERhdGFTdW0gKiAzNjA7XG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gZHJhdyB0aGUgYXJjIGZvciBhbGwgMzYwIGRlZ3JlZXMgd2UgbmVlZCB0byBhZGQgYSBoYWNrIHdoZXJlIHdlIGNsb3NlIHRoZSBjaXJjbGVcbiAgICAgICAgLy8gd2l0aCBaIGFuZCB1c2UgMzU5Ljk5IGRlZ3JlZXNcbiAgICAgICAgaWYoZW5kQW5nbGUgLSBzdGFydEFuZ2xlID09PSAzNjApIHtcbiAgICAgICAgICBlbmRBbmdsZSAtPSAwLjAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0YXJ0ID0gQ2hhcnRpc3QucG9sYXJUb0NhcnRlc2lhbihjZW50ZXIueCwgY2VudGVyLnksIHJhZGl1cywgc3RhcnRBbmdsZSAtIChpID09PSAwIHx8IGhhc1NpbmdsZVZhbEluU2VyaWVzID8gMCA6IDAuMikpLFxuICAgICAgICAgIGVuZCA9IENoYXJ0aXN0LnBvbGFyVG9DYXJ0ZXNpYW4oY2VudGVyLngsIGNlbnRlci55LCByYWRpdXMsIGVuZEFuZ2xlKSxcbiAgICAgICAgICBhcmNTd2VlcCA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSA8PSAxODAgPyAnMCcgOiAnMScsXG4gICAgICAgICAgZCA9IFtcbiAgICAgICAgICAgIC8vIFN0YXJ0IGF0IHRoZSBlbmQgcG9pbnQgZnJvbSB0aGUgY2FydGVzaWFuIGNvb3JkaW5hdGVzXG4gICAgICAgICAgICAnTScsIGVuZC54LCBlbmQueSxcbiAgICAgICAgICAgIC8vIERyYXcgYXJjXG4gICAgICAgICAgICAnQScsIHJhZGl1cywgcmFkaXVzLCAwLCBhcmNTd2VlcCwgMCwgc3RhcnQueCwgc3RhcnQueVxuICAgICAgICAgIF07XG5cbiAgICAgICAgLy8gSWYgcmVndWxhciBwaWUgY2hhcnQgKG5vIGRvbnV0KSB3ZSBhZGQgYSBsaW5lIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZSBmb3IgY29tcGxldGluZyB0aGUgcGllXG4gICAgICAgIGlmKG9wdGlvbnMuZG9udXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgZC5wdXNoKCdMJywgY2VudGVyLngsIGNlbnRlci55KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgU1ZHIHBhdGhcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIGRvbnV0IGNoYXJ0IHdlIGFkZCB0aGUgZG9udXQgY2xhc3MsIG90aGVyd2lzZSBqdXN0IGEgcmVndWxhciBzbGljZVxuICAgICAgICB2YXIgcGF0aCA9IHNlcmllc0dyb3Vwc1tpXS5lbGVtKCdwYXRoJywge1xuICAgICAgICAgIGQ6IGQuam9pbignICcpXG4gICAgICAgIH0sIG9wdGlvbnMuY2xhc3NOYW1lcy5zbGljZSArIChvcHRpb25zLmRvbnV0ID8gJyAnICsgb3B0aW9ucy5jbGFzc05hbWVzLmRvbnV0IDogJycpKTtcblxuICAgICAgICAvLyBBZGRpbmcgdGhlIHBpZSBzZXJpZXMgdmFsdWUgdG8gdGhlIHBhdGhcbiAgICAgICAgcGF0aC5hdHRyKHtcbiAgICAgICAgICAndmFsdWUnOiBkYXRhQXJyYXlbaV1cbiAgICAgICAgfSwgQ2hhcnRpc3QueG1sTnMudXJpKTtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgZG9udXQsIHdlIGFkZCB0aGUgc3Ryb2tlLXdpZHRoIGFzIHN0eWxlIGF0dHJpYnV0ZVxuICAgICAgICBpZihvcHRpb25zLmRvbnV0ID09PSB0cnVlKSB7XG4gICAgICAgICAgcGF0aC5hdHRyKHtcbiAgICAgICAgICAgICdzdHlsZSc6ICdzdHJva2Utd2lkdGg6ICcgKyAoK29wdGlvbnMuZG9udXRXaWR0aCkgKyAncHgnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaXJlIG9mZiBkcmF3IGV2ZW50XG4gICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgdHlwZTogJ3NsaWNlJyxcbiAgICAgICAgICB2YWx1ZTogZGF0YUFycmF5W2ldLFxuICAgICAgICAgIHRvdGFsRGF0YVN1bTogdG90YWxEYXRhU3VtLFxuICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgIGdyb3VwOiBzZXJpZXNHcm91cHNbaV0sXG4gICAgICAgICAgZWxlbWVudDogcGF0aCxcbiAgICAgICAgICBjZW50ZXI6IGNlbnRlcixcbiAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgICAgICAgIGVuZEFuZ2xlOiBlbmRBbmdsZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJZiB3ZSBuZWVkIHRvIHNob3cgbGFiZWxzIHdlIG5lZWQgdG8gYWRkIHRoZSBsYWJlbCBmb3IgdGhpcyBzbGljZSBub3dcbiAgICAgICAgaWYob3B0aW9ucy5zaG93TGFiZWwpIHtcbiAgICAgICAgICAvLyBQb3NpdGlvbiBhdCB0aGUgbGFiZWxSYWRpdXMgZGlzdGFuY2UgZnJvbSBjZW50ZXIgYW5kIGJldHdlZW4gc3RhcnQgYW5kIGVuZCBhbmdsZVxuICAgICAgICAgIHZhciBsYWJlbFBvc2l0aW9uID0gQ2hhcnRpc3QucG9sYXJUb0NhcnRlc2lhbihjZW50ZXIueCwgY2VudGVyLnksIGxhYmVsUmFkaXVzLCBzdGFydEFuZ2xlICsgKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSkgLyAyKSxcbiAgICAgICAgICAgIGludGVycG9sYXRlZFZhbHVlID0gb3B0aW9ucy5sYWJlbEludGVycG9sYXRpb25GbmModGhpcy5kYXRhLmxhYmVscyA/IHRoaXMuZGF0YS5sYWJlbHNbaV0gOiBkYXRhQXJyYXlbaV0sIGkpO1xuXG4gICAgICAgICAgdmFyIGxhYmVsRWxlbWVudCA9IHNlcmllc0dyb3Vwc1tpXS5lbGVtKCd0ZXh0Jywge1xuICAgICAgICAgICAgZHg6IGxhYmVsUG9zaXRpb24ueCxcbiAgICAgICAgICAgIGR5OiBsYWJlbFBvc2l0aW9uLnksXG4gICAgICAgICAgICAndGV4dC1hbmNob3InOiBkZXRlcm1pbmVBbmNob3JQb3NpdGlvbihjZW50ZXIsIGxhYmVsUG9zaXRpb24sIG9wdGlvbnMubGFiZWxEaXJlY3Rpb24pXG4gICAgICAgICAgfSwgb3B0aW9ucy5jbGFzc05hbWVzLmxhYmVsKS50ZXh0KCcnICsgaW50ZXJwb2xhdGVkVmFsdWUpO1xuXG4gICAgICAgICAgLy8gRmlyZSBvZmYgZHJhdyBldmVudFxuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoJ2RyYXcnLCB7XG4gICAgICAgICAgICB0eXBlOiAnbGFiZWwnLFxuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBncm91cDogc2VyaWVzR3JvdXBzW2ldLFxuICAgICAgICAgICAgZWxlbWVudDogbGFiZWxFbGVtZW50LFxuICAgICAgICAgICAgdGV4dDogJycgKyBpbnRlcnBvbGF0ZWRWYWx1ZSxcbiAgICAgICAgICAgIHg6IGxhYmVsUG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IGxhYmVsUG9zaXRpb24ueVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IG5leHQgc3RhcnRBbmdsZSB0byBjdXJyZW50IGVuZEFuZ2xlLiBVc2Ugc2xpZ2h0IG9mZnNldCBzbyB0aGVyZSBhcmUgbm8gdHJhbnNwYXJlbnQgaGFpcmxpbmUgaXNzdWVzXG4gICAgICAgIC8vIChleGNlcHQgZm9yIGxhc3Qgc2xpY2UpXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBlbmRBbmdsZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgnY3JlYXRlZCcsIHtcbiAgICAgICAgY2hhcnRSZWN0OiBjaGFydFJlY3QsXG4gICAgICAgIHN2ZzogdGhpcy5zdmcsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgcGllIGNoYXJ0IGFuZCByZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZHJhdyB0aGUgY2hhcnQuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyb2YgQ2hhcnRpc3QuUGllXG4gICAgICogQHBhcmFtIHtTdHJpbmd8Tm9kZX0gcXVlcnkgQSBzZWxlY3RvciBxdWVyeSBzdHJpbmcgb3IgZGlyZWN0bHkgYSBET00gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCBpbiB0aGUgcGllIGNoYXJ0IG5lZWRzIHRvIGhhdmUgYSBzZXJpZXMgcHJvcGVydHkgd2l0aCBhIG9uZSBkaW1lbnNpb25hbCBkYXRhIGFycmF5LiBUaGUgdmFsdWVzIHdpbGwgYmUgbm9ybWFsaXplZCBhZ2FpbnN0IGVhY2ggb3RoZXIgYW5kIGRvbid0IG5lY2Vzc2FyaWx5IG5lZWQgdG8gYmUgaW4gcGVyY2VudGFnZS4gVGhlIHNlcmllcyBwcm9wZXJ0eSBjYW4gYWxzbyBiZSBhbiBhcnJheSBvZiBvYmplY3RzIHRoYXQgY29udGFpbiBhIGRhdGEgcHJvcGVydHkgd2l0aCB0aGUgdmFsdWUgYW5kIGEgY2xhc3NOYW1lIHByb3BlcnR5IHRvIG92ZXJyaWRlIHRoZSBDU1MgY2xhc3MgbmFtZSBmb3IgdGhlIHNlcmllcyBncm91cC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdCB3aXRoIG9wdGlvbnMgdGhhdCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLiBDaGVjayB0aGUgZXhhbXBsZXMgZm9yIGEgZGV0YWlsZWQgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbcmVzcG9uc2l2ZU9wdGlvbnNdIFNwZWNpZnkgYW4gYXJyYXkgb2YgcmVzcG9uc2l2ZSBvcHRpb24gYXJyYXlzIHdoaWNoIGFyZSBhIG1lZGlhIHF1ZXJ5IGFuZCBvcHRpb25zIG9iamVjdCBwYWlyID0+IFtbbWVkaWFRdWVyeVN0cmluZywgb3B0aW9uc09iamVjdF0sW21vcmUuLi5dXVxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IHdpdGggYSB2ZXJzaW9uIGFuZCBhbiB1cGRhdGUgbWV0aG9kIHRvIG1hbnVhbGx5IHJlZHJhdyB0aGUgY2hhcnRcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gU2ltcGxlIHBpZSBjaGFydCBleGFtcGxlIHdpdGggZm91ciBzZXJpZXNcbiAgICAgKiBuZXcgQ2hhcnRpc3QuUGllKCcuY3QtY2hhcnQnLCB7XG4gICAgICogICBzZXJpZXM6IFsxMCwgMiwgNCwgM11cbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gRHJhd2luZyBhIGRvbnV0IGNoYXJ0XG4gICAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgICAqICAgc2VyaWVzOiBbMTAsIDIsIDQsIDNdXG4gICAgICogfSwge1xuICAgICAqICAgZG9udXQ6IHRydWVcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gVXNpbmcgZG9udXQsIHN0YXJ0QW5nbGUgYW5kIHRvdGFsIHRvIGRyYXcgYSBnYXVnZSBjaGFydFxuICAgICAqIG5ldyBDaGFydGlzdC5QaWUoJy5jdC1jaGFydCcsIHtcbiAgICAgKiAgIHNlcmllczogWzIwLCAxMCwgMzAsIDQwXVxuICAgICAqIH0sIHtcbiAgICAgKiAgIGRvbnV0OiB0cnVlLFxuICAgICAqICAgZG9udXRXaWR0aDogMjAsXG4gICAgICogICBzdGFydEFuZ2xlOiAyNzAsXG4gICAgICogICB0b3RhbDogMjAwXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIERyYXdpbmcgYSBwaWUgY2hhcnQgd2l0aCBwYWRkaW5nIGFuZCBsYWJlbHMgdGhhdCBhcmUgb3V0c2lkZSB0aGUgcGllXG4gICAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgICAqICAgc2VyaWVzOiBbMjAsIDEwLCAzMCwgNDBdXG4gICAgICogfSwge1xuICAgICAqICAgY2hhcnRQYWRkaW5nOiAzMCxcbiAgICAgKiAgIGxhYmVsT2Zmc2V0OiA1MCxcbiAgICAgKiAgIGxhYmVsRGlyZWN0aW9uOiAnZXhwbG9kZSdcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gT3ZlcnJpZGluZyB0aGUgY2xhc3MgbmFtZXMgZm9yIGluZGl2aWR1YWwgc2VyaWVzXG4gICAgICogbmV3IENoYXJ0aXN0LlBpZSgnLmN0LWNoYXJ0Jywge1xuICAgICAqICAgc2VyaWVzOiBbe1xuICAgICAqICAgICBkYXRhOiAyMCxcbiAgICAgKiAgICAgY2xhc3NOYW1lOiAnbXktY3VzdG9tLWNsYXNzLW9uZSdcbiAgICAgKiAgIH0sIHtcbiAgICAgKiAgICAgZGF0YTogMTAsXG4gICAgICogICAgIGNsYXNzTmFtZTogJ215LWN1c3RvbS1jbGFzcy10d28nXG4gICAgICogICB9LCB7XG4gICAgICogICAgIGRhdGE6IDcwLFxuICAgICAqICAgICBjbGFzc05hbWU6ICdteS1jdXN0b20tY2xhc3MtdGhyZWUnXG4gICAgICogICB9XVxuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFBpZShxdWVyeSwgZGF0YSwgb3B0aW9ucywgcmVzcG9uc2l2ZU9wdGlvbnMpIHtcbiAgICAgIENoYXJ0aXN0LlBpZS5zdXBlci5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsXG4gICAgICAgIHF1ZXJ5LFxuICAgICAgICBkYXRhLFxuICAgICAgICBDaGFydGlzdC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKSxcbiAgICAgICAgcmVzcG9uc2l2ZU9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIENyZWF0aW5nIHBpZSBjaGFydCB0eXBlIGluIENoYXJ0aXN0IG5hbWVzcGFjZVxuICAgIENoYXJ0aXN0LlBpZSA9IENoYXJ0aXN0LkJhc2UuZXh0ZW5kKHtcbiAgICAgIGNvbnN0cnVjdG9yOiBQaWUsXG4gICAgICBjcmVhdGVDaGFydDogY3JlYXRlQ2hhcnQsXG4gICAgICBkZXRlcm1pbmVBbmNob3JQb3NpdGlvbjogZGV0ZXJtaW5lQW5jaG9yUG9zaXRpb25cbiAgICB9KTtcblxuICB9KHdpbmRvdywgZG9jdW1lbnQsIENoYXJ0aXN0KSk7XG5cbiAgcmV0dXJuIENoYXJ0aXN0O1xuXG59KSk7XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgdGhpcy50ZXh0ID0gdGhpcy5yZXEubWV0aG9kICE9J0hFQUQnIFxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dCBcbiAgICAgOiBudWxsO1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiBzdHIubGVuZ3RoXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cyB8fCAxMjIzID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBlcnIgPSBudWxsO1xuICAgIHZhciByZXMgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTsgXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICB9XG5cbiAgICBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51bnNldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaikgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGlmICgyID09IGZuLmxlbmd0aCkgcmV0dXJuIGZuKGVyciwgcmVzKTtcbiAgaWYgKGVycikgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICBmbihyZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSBnZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG4gICAgaWYgKDAgPT0geGhyLnN0YXR1cykge1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmRlbCA9IGZ1bmN0aW9uKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyJdfQ==
