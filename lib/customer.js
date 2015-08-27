'use strict';

var CLUSTER_URL = "http://localhost:8091/";

var LoggerObject = require("./logger");
var logger = new LoggerObject.Logger("customer");
var HandlerObject = require("./callbackHandler");
var handler = new HandlerObject.Handler(logger);

//### Testing ###
//var couchbase = require("couchbase").Mock;
//var customerCluster = new couchbase.Cluster();
//###############
var couchbase = require("couchbase");
var customerCluster = new couchbase.Cluster(CLUSTER_URL);
//###############

if (!customerCluster) {
    console.log("Couchbase service is OFF!");
    return;
}

var customerBucket = customerCluster.openBucket('customer', function(err) {
    if (err) {
        logger.error(err);
    } else {
        logger.info("Connected to couchbase");
    }
});

function add(custInfo, callback) {
    logger.debug("adding new customer");
    if (!custInfo) {
        handler.error(callback, "customer info undefined");
    } else if (!isCustomerInfoValid(custInfo)) {
        handler.error(callback, "customer info invalid");
    } else {
        logger.debug("everything OK, adding document");
        var customerDoc = createCustomerDoc(custInfo);
        var custId = custInfo.cust_id;
        customerBucket.insert(custId, customerDoc, function(err, res) {
            handler.call(callback, err, {});
        });
    }
}

function getAll(offset, limit, callback) {
    logger.debug("get customer list");

    if (!offset) {
        handler.error(callback, "No offset");
    } else if (!limit) {
        handler.error(callback, "No limit");
    } else {
        var viewAllCustomers = couchbase.ViewQuery.from('dev_customers', 'all_customers').skip(offset).limit(limit);
        customerBucket.query(viewAllCustomers, function (err, results) {
            var customers = [];
            for (var i = 0; i < results.length; i++) {
                results[i].value.cust_id = results[i].key;
                customers.push(results[i].value);
            }
            handler.call(callback, err, customers);
        });
    }
}

function getById(custId, callback) {
    logger.debug("get customer by id");
    if (!custId) {
        handler.error(callback, "Customer id is undefined");
    } else if (isNaN(custId)) {
        handler.error(callback, "Customer id is invalid");
    } else {
        logger.debug("cust_id:" + custId);
        customerBucket.get(custId, function(err, res) {
            handler.call(callback, err, res.value);
        });
    }
}

function deleteById(custId, callback) {
    logger.debug("delete customer by id");
    if (!custId) {
        handler.error(callback, "Customer id is undefined");
    } else if (isNaN(custId)) {
        handler.error(callback, "Customer id is invalid");
    } else {
        logger.debug("cust_id:" + custId);
        customerBucket.remove(custId, function(err, res) {
            handler.call(callback, err, {});
        });
    }
}

function createCustomerDoc(custInfo) {
    var firstName = custInfo.first_name;
    var lastName = custInfo.last_name;
    var phone = custInfo.phone;

    var city = custInfo.city;
    var address = custInfo.address;
    var region = custInfo.region;

    var location =
        "{" +
        "\"city\":\"" + city + "\"," +
        "\"address\":\"" + address + "\"," +
        "\"region\":\"" + region + "\"" +
        "}";

    var document =
        "{" +
        "\"first_name\":\"" + firstName + "\"," +
        "\"last_name\":\"" + lastName + "\"," +
        "\"phone\":\"" + phone + "\"," +
        "\"location\":" + location +
        "}";

    logger.debug("doc: " + document);

    return JSON.parse(document);
}

function isCustomerInfoValid(custInfo) {
    var validRegions = ["north", "center", "south"];

    var custId = custInfo.cust_id;
    var firstName = custInfo.first_name;
    var lastName = custInfo.last_name;
    var phone = custInfo.phone;

    var city = custInfo.city;
    var address = custInfo.address;
    var region = custInfo.region;

    logger.debug("id:" + custId + " fname:" + firstName + " lname:" + lastName +
        " phone:" + phone + " city:" + city + " addr:" + address + " region:" + region);

    if (!custId || !firstName || !lastName || !phone || !city || !address || !region) {
        return false;
    }

    if (validRegions.indexOf(region) < 0) {
        return false;
    }

    if (isNaN(custId)) {
        return false;
    }

    return true;
}


//######################################################
// Export Module
//######################################################

module.exports = {
    add : add,
    getAll : getAll,
    getById : getById,
    deleteById : deleteById
};