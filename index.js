'use strict';
var Hapi = require('hapi');
var Path = require('path');
var superAgent = require('superagent');
var Boom = require('boom');
var openMap =require('./openMap.config').config;






var server = new Hapi.Server();
server.connection({
    port: 3000
});



server.route([{
    method: 'GET',
    path: '/asset/{path*}',
    handler: {
        directory: {
            // path: function(request){
            //     return 'client/dst/' +  request.params.path;
            // },
            path: ['./client/dst', './client/img'],
            listing: false,
            index: false
        }

    }
}]);

server.views({
    path: Path.join(__dirname, 'views'),
    engines: {
        html: require('swig')
    }
});

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply.view('index');
    }
});


// server.pack.require('. / plugin ', function(err) {
//     if (err) {
//         throw err;
//     }
//     // Start the server
//     server.start(function() {
//         console.log('Server started at ' + server.info.uri);
//     });
// });


server.route({
    method: 'GET',
    path: '/gettemp',
    handler: function(request, reply) {

        var cityUrl = openMap.url + 'city?id=524901&units=metric&APPID=' + openMap.appId;

        console.log(cityUrl);
        superAgent.get(cityUrl).end(function(data) {
            if (data.ok) {
                var response = {};
                response.min = [];
                response.max = [];
                response.avg = [];
                response.dates = [];
                data.body.list.forEach(function(temp) {
                    response.min.push(temp.main['temp_min']);
                    response.max.push(temp.main['temp_max']);
                    response.avg.push(temp.main.temp);
                    response.dates.push(temp['dt_txt']);
                });

                reply(response);

            }
            else{
                 return reply(Boom.badRequest('Unsupported parameter'));
            }

        });

    }
});

server.start(function() {
    console.log('Server started at ' + server.info.uri);
});
