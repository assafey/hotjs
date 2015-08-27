'use strict';

var CLUSTER_URL = "http://localhost:8091/";

var LoggerObject = require("./logger");
var logger = new LoggerObject.Logger("cust_packs");
var HandlerObject = require("./callbackHandler");
var handler = new HandlerObject.Handler(logger);

var pack = require("./package");

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

var bucket = customerCluster.openBucket('customer_packages', function(err) {
    if (err) {
        logger.error(err);
    } else {
        logger.info("Connected to couchbase");
    }
});

function addPackage(custId, packInfo, callback) {
    if (!custId) {
        handler.error(callback, "Cutomer id is undefined");
    } else if (!packInfo) {
        handler.error(callback, "Package is undefined");
    } else if (isNaN(custId)) {
        handler.error(callback, "Cutomer id is invalid");
    } else if (!pack.isPackageInfoValid(packInfo)) {
        handler.error(callback, "Package info is invalid");
    } else {
        logger.debug("adding package to cust_id: " + custId);
        var doc = pack.createPackageDocument(packInfo);
        customerExists(custId, function(exists) {
            var packId = guid();
            if (exists) {
               logger.debug("customer exists");
               bucket.get(custId, function(err, res) {
                   var documents = res.value;
                   documents.push({_id:packId, info:doc});
                   bucket.replace(custId, documents, function(err, res) {
                       handler.call(callback, err, {_id:packId});
                   });
               });
           } else {
               logger.debug("customer not exist");
               bucket.insert(custId, [{_id:packId, info: doc}], function(err, res) {
                    handler.call(callback, err, {_id:packId});
               });
           }
        });
    }
}

function removePackage(custId, packId, callback) {
    logger.debug("removing a package");
    if (!custId) {
        handler.error(callback, "Cutomer id is undefined");
    } else if (!packId) {
        handler.error(callback, "Package id is undefined");
    } else if (isNaN(custId)) {
        handler.error(callback, "Cutomer id is invalid");
    /*} else if (isNaN(packId)) {
        handler.error(callback, "Package id is invalid");*/
    } else {
        customerExists(custId, function(exists) {
            if (exists) {
                bucket.get(custId, function(err, res) {
                    if (err) {
                        handler.error(callback, err);
                    } else {
                        var jsonResponse = {removed: 0};
                        for (var i = 0; i < res.value.length; i++) {
                            if (res.value[i]._id === packId) {
                                res.value.splice(i, 1);
                                jsonResponse = {removed: 1};
                                break;
                            }
                        }
                        bucket.replace(custId, res.value, function(err, res) {
                            handler.call(callback, err, jsonResponse);
                        });
                    }
                });
            } else {
                handler.error(callback, "Customer not exist");
            }
        });
    }
}

function getAllPackages(custId, callback) {
    logger.debug("get all customer packages");
    if (!custId) {
        handler.error(callback, "Cutomer id is undefined");
    } else if (isNaN(custId)) {
        handler.error(callback, "Cutomer id is invalid");
    } else {
        bucket.get(custId, function(err, res) {
            if (res) {
                handler.call(callback, err, res.value);
            } else {
                handler.call(callback, err, []);
            }
        });
    }
}

function customerExists(custId, callback) {
    bucket.get(custId, function(err, res) {
       if (err || !res.value) {
           callback(false);
       } else {
           callback(true);
       }
    });
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}




//######################################################
// Export Module
//######################################################

module.exports = {
    addPackage : addPackage,
    removePackage : removePackage,
    getAllPackages : getAllPackages
};