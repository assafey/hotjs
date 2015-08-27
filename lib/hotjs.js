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
var custPacks = require("./customer_packages");


function initialize() {
    app.use(logger('dev'));

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());


    // get all technicians
    app.get('/tech_list', function (request, response) {
        tech.getAll(function(err, res) {
           sendResult(response, err, res);
        });
    });

    // add new technician
    app.post('/tech', function (request, response) {
        var techInfo = request.body;
        tech.add(techInfo, function(err, res) {
            sendResult(response, err, res);
        });
    });

    // get technician by id
    app.get('/tech/:tech_id', function (request, response) {
        var params = request.params;
        var techId = params.tech_id;
        tech.getById(techId, function(err, res) {
           sendResult(response, err, res);
        });
    });

    // delete technician by id
    app.delete('/tech/:tech_id', function (request, response) {
        var params = request.params;
        var techId = params.tech_id;
        tech.remove(techId, function(err, res){
           sendResult(response, err, res);
        });
    });

    // search available technician by date and region
    app.get('/tech/:region/:date/:time', function (request, response) {
        var params = request.params;
        var region = params.region;
        var date = params.date;
        var time = params.time;
        tech.find(region, date, time, function(err, res) {
           sendResult(response, err, res);
        });
    });

    // update a schedule of a technician
    app.put('/tech/schedule/:tech_id', function (request, response) {
        var params = request.params;
        var techId = params.tech_id;
        var schedInfo = request.body;
        tech.addSchedule(techId, schedInfo, function(err, res) {
           sendResult(response, err, res);
        });
    });

    // delete schedule of a technician by date and time
    app.delete('/tech/schedule/:tech_id/:date/:time', function (request, response) {
        var params = request.params;
        var techId = params.tech_id;
        var date = params.date;
        var time = params.time;
        tech.removeSchedule(techId, date, time, function(err, res) {
            sendResult(response, err, res);
        });
    });

    // creates index for technicians
    app.post('/tech_index/:index_name', function (request, response) {
        var params = request.params;
        var indexName = params.index_name;
        tech.createIndex(indexName, function(err, res) {
           sendResult(response, err, res);
        });
    });

    // deletes index for technicians
    app.post('/tech_index/:index_name', function (request, response) {
        var params = request.params;
        var indexName = params.index_name;
        tech.dropIndex(indexName, function(err, res) {
            sendResult(response, err, res);
        });
    });



    // get customer by id
    app.get('/customer/:cust_id', function (request, response) {
        var params = request.params;
        var custId = params.cust_id;
        customer.getById(custId, function(err, res) {
            sendResult(response, err, res);
        });
    });

    // add new customer
    app.post('/customer', function (request, response) {
        var custInfo = request.body;
        customer.add(custInfo, function(err, res) {
            sendResult(response, err, res);
        });
    });

    // get all customers
    app.get('/customer_list/:offset/:limit', function (request, response) {
        var params = request.params;
        var offset = params.offset;
        var limit = params.limit;
        customer.getAll(offset, limit, function(err, res) {
           sendResult(response, err, res);
        });
    });

    // delete a customer by id
    app.delete('/customer/:cust_id', function (request, response) {
        var params = request.params;
        var custId = params.cust_id;
        customer.deleteById(custId, function(err, res) {
           sendResult(response, err, res);
        });
    });




    // add new package
    app.post('/package', function (request, response) {
        var packInfo = request.body;
        pack.add(packInfo, function(err, res) {
            sendResult(response, err, res);
        });
    });

    // get all packages
    app.get('/package_list', function(request, response) {
        pack.getAll(function(err, res) {
           sendResult(response, err, res);
        });
    });

    // get package by type and one detail
    app.get('/package/:type/:detail', function (request, response) {
        var params = request.params;
        var type = params.type;
        var detail = params.detail;
        pack.find(type, detail, function(err, res) {
           sendResult(response, err, res);
        });
    });

    // delete a package
    app.delete('/package/:pack_id', function(request, response) {
        var params = request.params;
        var packId = params.pack_id;
        pack.remove(packId, function(err, res) {
           sendResult(response, err, res);
        });
    });

    // update a cost of a package
    app.put('/package/:pack_id/:cost', function (request, response) {
        var params = request.params;
        var packId = params.pack_id;
        var cost = params.cost;
        pack.update(packId, cost, function(err, res) {
           sendResult(response, err, res);
        });
    });


    // add a package to a specific customer
    app.post('/customer/package/:cust_id', function (request, response) {
        var params = request.params;
        var custId = params.cust_id;
        var packInfo = request.body;
        custPacks.addPackage(custId, packInfo, function(err, res) {
            sendResult(response, err, res);
        })
    });

    // remove a package from a specific customer
    app.delete('/customer/package/:cust_id/:pack_id', function (request, response) {
        var params = request.params;
        var custId = params.cust_id;
        var packId = params.pack_id;
        custPacks.removePackage(custId, packId, function(err, res) {
            sendResult(response, err, res);
        })
    });

    // get all packages of a specific customer
    app.get('/customer/package_list/:cust_id', function(request,response) {
        var params = request.params;
        var custId = params.cust_id;
        custPacks.getAllPackages(custId, function(err, res) {
           sendResult(response, err, res);
        });
    });
}

function start() {
    server.listen(3000);
    console.log('Listening on port %d', server.address().port);
}

function sendResult(response, err, res) {
    if (err) {
        response.send(err);
    } else {
        response.send(res);
    }
}

//######################################################
// Export Module
//######################################################

module.exports = {
    initialize : initialize,
    start : start
};