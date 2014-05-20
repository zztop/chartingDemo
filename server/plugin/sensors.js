"use strict";
var exec = require("child_process").exec;
var sockjs = require("sockjs");

var sockServer = sockjs.createServer(),
    connections = [];
sockServer.on("connection", function(conn) {
    connections.push(conn);
    var number = connections.length;
    conn.write("Welcome, User " + number);
    conn.on("data", function(message) {
        console.log(message);
    });
    conn.on("close", function() {
        for (var ii = 0; ii < connections.length; ii++) {
            connections[ii].write("User " + number + " has disconnected");
        }
    });
});
var isSockServerInstalled = false;
exports.register = function(plugin, options, next) {
    plugin.route({
        path: "/plugin/sensor",
        method: "GET",
        handler: function(request, reply) {
            exec("sensors", function(err, stdout) {
                if (err) {
                    reply(err);
                }
                // console.log(request.server);

                if (!isSockServerInstalled) {
                    sockServer.installHandlers(request.server.listener, {
                        prefix: "/sensor"
                    });
                    isSockServerInstalled = true;
                }

                reply(stdout);
                // body...
            });

        }
    });
    next();
};
