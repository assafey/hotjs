'use strict';

var express = require('express'); // express object
var http = require('http'); // for creating http server
var logger = require('morgan'); // logs every request to terminal
var bodyParser = require('body-parser'); // helps parsing the request body
var app = express(); // our a[[
var server = http.createServer(app); // the server


var customer = require("./customer");
var pack = require("./package");
var tech = require("./technician");


function initialize() {
    app.use(logger('dev'));

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    // get all technicians
    app.get('/tech_list', function (request, response) {
        response.send(tech.getAll());
    });

    // add new technician
    app.post('/tech', function (request, response) {
        var body = request.body;
        var name = body.name;
        response.send("Add new technician '" + name + "'");
    });

    // get technician by id
    app.get('/tech/:tech_id', function (request, response) {
        var params = request.params;
        var techId = params.tech_id;
        response.send("Technician " + custId);
    });

    // search available technician by date and region
    app.get('/tech/:region/:date', function (request, response) {
        var params = request.params;
        var region = params.region;
        var date = params.date;
        response.send("Available technicians from region = " + region + " on date = " + date);
    });

    // update a schedule of a technician
    app.put('/tech/:tech_id/:date/:time', function (request, response) {
        var params = request.params;
        var techId = params.tech_id;
        var date = params.date;
        var time = params.time;
        var body = request.body;
        var city = body.city;
        var address = body.address;
        response.send("New schedule for tech_id(" + techId + ") on [" + date + ", " + time + "] in [" + city + ", " + address + "]");
    });

    // delete schedule of a technician by date and time
    app.delete('/tech/:date/:time', function (request, response) {
        var params = request.params;
        var date = params.date;
        var time = params.time;
        response.send("Delete technician schedule [" + date + ", " + time + "]");
    });

    // creates index for technicians by region
    app.post('/tech_index/:index_name', function (request, response) {
        var params = request.params;
        var indexName = params.index_name;
        response.send("Creates index for technicians by '" + indexName + "'");
    });

    // get customer by id
    app.get('/customer/:cust_id', function (request, response) {
        var params = request.params;
        var custId = params.cust_id;
        response.send("Customer " + custId);
    });

    // add new customer
    app.post('/customer', function (request, response) {
        var body = request.body;
        var name = body.name;
        response.send("Add new customer '" + name + "'");
    });

    // get all customers
    app.get('/customer_list', function (request, response) {
        response.send("All customers");
    });

    app.delete('/customer/:cust_id', function (request, response) {
        var params = request.params;
        var custId = params.cust_id;
        response.send("Delete customer " + custId);
    });

    // add new package
    app.post('/pack', function (request, response) {
        var body = request.body;
        var name = body.name;
        var types = body.types;
        var cost = body.cost;
        var details = body.details;
        response.send("Add new package name = " + name + " cost = " + cost);
    });

    // get package by type and one detail
    app.get('/pack/:type/:detail', function (request, response) {
        var params = request.params;
        var type = params.type;
        var detail = params.detail;
        response.send("Package for type = " + type + " and detail = " + detail);
    });

    // update a cost of a package
    app.put('/pack/:pack_id/:cost', function (request, response) {
        var params = request.params;
        var packId = params.pack_id;
        var cost = params.cost;
        response.send("Update package " + packId + " with cost = " + cost);
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