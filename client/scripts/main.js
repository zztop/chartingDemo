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
