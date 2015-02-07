'use strict';
var Hapi = require('hapi');
var Path = require('path');

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
        var news = [{
            title: 'Blaah Blaah',
            desciption: 'Blaah blaah balck sheep have you any wool. Yes sir sir three bags full.one for my master ',
            source: 'Google Inc',
            img: ''

        }];
        reply.view('index', news);
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

server.start(function() {
    console.log('Server started at ' + server.info.uri);
});
