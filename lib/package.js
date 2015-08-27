'use strict';

var LoggerObject = require("./logger");
var logger = new LoggerObject.Logger("package");
var HandlerObject = require("./callbackHandler");
var handler = new HandlerObject.Handler(logger);

var client = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var url = 'mongodb://127.0.0.1:27017';

var packages;
client.connect(url, function(err, db) {
    if (err) throw err;
    logger.info("Connected to mongodb");
    packages = db.collection("packages");
});

function add(packInfo, callback) {
    logger.debug("adding package");
    if (!packInfo) {
        handler.error(callback, "Package info is undefined");
    } else if (!isPackageInfoValid(packInfo)) {
        handler.error(callback, "Package info is invalid");
    } else {
        var document = createPackageDocument(packInfo);
        packages.insertOne(document, function(err, res) {
            handler.call(callback, err, res);
        });
    }
}

function find(type, detail, callback) {
    logger.debug("find package");
    if (!type || !detail) {
        handler.error(callback, "Package type and detail are undefined");
    } else if (type && detail) {
        packages.find({types: {"$in":[type]},details:{"$in":[detail]}}).toArray(function (err, res) {
            handler.call(callback, err, res);
        });
    } else if (type) {
        packages.find({types: {"$in":[type]}}).toArray(function (err, res) {
            handler.call(callback, err, res);
        });
    } else {
        packages.find({details:{"$in":[detail]}}).toArray(function (err, res) {
            handler.call(callback, err, res);
        });
    }
}

function getAll(callback) {
    logger.debug("get all packages");
    packages.find({}).toArray(function(err, res) {
       handler.call(callback, err, res);
    });
}

function update(packId, cost, callback) {
    logger.debug("update package");
    if (!packId) {
        handler.error(callback, "Package id is undefined");
    } else if (!cost) {
        handler.error(callback, "Package cost is undefined");
    } else if (isNaN(cost)) {
        handler.error(callback, "Package cost is invalid");
    } else {
        packages.updateOne({_id:new ObjectID(packId)}, {$set:{cost:cost}}, function(err, res) {
           handler.call(callback, err, res);
        });
    }
}

function remove(packId, callback) {
    logger.debug("remove package");
    if (!packId) {
        handler.error(callback, "Package id is undefined");
    } else {
        packages.removeOne({_id:new ObjectID(packId)}, {safe:true}, function(err, res) {
           handler.call(callback, err, res);
        });
    }
}

function createPackageDocument(packInfo) {
    var name = packInfo.name;
    var types = packInfo.types;
    var cost = packInfo.cost;
    var details = packInfo.details;

    var jsonArrayDetails = "[";
    var splitDetails = details.split(",");
    for (var i = 0; i < splitDetails.length; i++) {
        var detail = splitDetails[i];
        if (i === 0) {
            jsonArrayDetails += "\"" + detail + "\"";
        } else {
            jsonArrayDetails += ",\"" + detail + "\"";
        }
    }
    jsonArrayDetails += "]";

    var jsonArrayTypes = "[";
    var splitTypes = types.split(",");
    for (var i = 0; i < splitTypes.length; i++) {
        var type = splitTypes[i];
        if (i === 0) {
            jsonArrayTypes += "\"" + type + "\"";
        } else {
            jsonArrayTypes += ",\"" + type + "\"";
        }
    }
    jsonArrayTypes += "]";

    var doc = "{\"name\":\"" + name + "\",\"cost\":\"" + cost + "\",\"details\":" + jsonArrayDetails + ",\"types\":" + jsonArrayTypes + "}";

    logger.debug("doc: " + doc);

    return JSON.parse(doc);
}

function isPackageInfoValid(packInfo) {
    var validTypes = ["TV", "Phone", "Internet"];

    var name = packInfo.name;
    var types = packInfo.types;
    var cost = packInfo.cost;
    var details = packInfo.details;

    if (!name || !types || !cost || !details) {
        return false;
    }

    // validate types
    var splitTypes = types.split(",");
    for (var i = 0; i < splitTypes.length; i++) {
        var type = splitTypes[i];
        if (validTypes.indexOf(type) < 0) {
            return false;
        }
    }

    return true;
}

//######################################################
// Export Module
//######################################################

module.exports = {
    add : add,
    find : find,
    update : update,
    getAll : getAll,
    remove : remove,
    createPackageDocument : createPackageDocument,
    isPackageInfoValid : isPackageInfoValid
};