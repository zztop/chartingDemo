'use strict';
var Hapi = require('hapi');

// Create a server with a host and port
var server = Hapi.createServer('localhost', 8000);



server.route([{
    method: 'GET',
    path: '/asset/{path*}',
    handler: {
        directory: {
            // path: function(request){
            //     return 'client/dst/' +  request.params.path;
            // },
            path:'./client/dst',
            listing: false,
            index: false
        }

    }
}]);

server.views({
    path: './views',
    engines: {
        html: 'swig'
    }
});

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply.view('index');
    }
});


// server.pack.require('./plugin', function(err) {
//     if (err) {
//         throw err;
//     }
//     // Start the server
//     server.start(function() {
//         console.log('Server started  at' + server.info.uri);
//     });
// });

server.start(function() {
    console.log('Server started  at' + server.info.uri);
});
