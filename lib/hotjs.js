var express = require('express');
var http = require('http');
var logger = require('morgan');
var app = express();
var server = http.createServer(app);

function initialize() {
    app.use(logger('dev'));

    app.get( '/', function (request, response) {
        response.send('Hello Express');
    });
}

function start() {
    server.listen(3000);
    console.log('Listening on port %d', server.address().port);
}


//######################################################
// Export Module
//######################################################

module.exports = {
    initialize : initialize,
    start : start
};