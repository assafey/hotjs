'use strict';

var CLUSTER_URL = "127.0.0.1:8091";

var LoggerObject = require("./logger");
var logger = new LoggerObject.Logger("tech");
var HandlerObject = require("./callbackHandler");
var handler = new HandlerObject.Handler(logger);

var client = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var url = 'mongodb://127.0.0.1:27017';

var technicians;
client.connect(url, function(err, db) {
    if (err) throw err;
    logger.info("Connected to mongodb");
    technicians = db.collection("technicians");
});

function add(techInfo, callback) {
    logger.debug("add new technician");
    if (!techInfo) {
        handler.error("Technician info is undefined");
    } else if (!isTechnicianInfoValid(techInfo)) {
        handler.error("Technician info is invalid");
    } else {
        var doc = createTechnicianDocument(techInfo);
        technicians.insertOne(doc, function(err, res) {
           handler.call(callback, err, res);
        });
    }
}

function remove(techId, callback) {
    logger.debug("remove technician");
    if (!techId) {
        handler.error("Technician id is undefined");
    } else if (isNaN(techId)) {
        handler.error("Technician is invalid");
    } else {
        technicians.removeOne({tech_id:techId}, function(err, res) {
           handler.call(callback, err, res);
        });
    }
}

function getAll(callback) {
    logger.debug("get all technicians");
    technicians.find({}).toArray(function(err, res) {
        handler.call(callback, err, res);
    });
}

function getById(techId, callback) {
    logger.debug("get technician");
    if (!techId) {
        handler.error("Technician id is undefined");
    } else if (isNaN(techId)) {
        handler.error("Technician is invalid");
    } else {
        technicians.findOne({tech_id:techId}, function(err, res) {
            handler.call(callback, err, res);
        });
    }
}

function find(region, date, callback) {
    var validRegions = ["north", "center", "south"];
    var lengthOfDate = 8;

    logger.debug("find available technician");

    if (!region) {
        handler.error("Technician region is undefined");
    } else if (!date) {
        handler.error("Technician date is undefined");
    } else if (date.length !== lengthOfDate) {
        handler.error("Technician date is invalid");
    } else if (validRegions.indexOf(region) < 0) {
        handler.error("Technician region is invalid");
    } else {
        date = date.substring(0, 3) + "-" + date.substring(4, 5) + "-" + date.substring(6, 7);
        var queryString = "{schedule:{$in:[" + date + "]}}"; // TODO - fix query
        technicians.find(queryString).toArray(function(err, res) {
           handler.call(callback, err, res);
        });
    }
}

function addSchedule(techId, schedInfo, callback) {
    logger.debug("add technician schedule");
    if (!techId) {
        handler.error("Technician id is undefined");
    } else if (isNaN(techId)) {
        handler.error("Technician id is invalid");
    } else if (!schedInfo) {
        handler.error("Technician schedule is undefined");
    } else if (!isScheduleInfoValid(schedInfo)) {
        handler.error("Technician schedule is invalid");
    } else {
        getById(techId, function(err, res) {
            var techDoc = res;
            var schedule = techDoc.schedule;
            logger.debug(JSON.stringify(schedule));
            handler.call(callback, err, res);
        });
    }
}

function removeSchedule(techId, date, time, callback) {
    logger.debug("remove technician schedule");

}

function createIndex(indexName, callback) {
    logger.debug("create technician index");
    technicians.ensureIndex(indexName, function(err, res) {
       handler.call(callback, err, res);
    });
}

function dropIndex(indexName, callback) {
    logger.debug("remove technician index");
    technicians.dropIndex(indexName, function(err, res) {
        handler.call(callback, err, res);
    });
}

function isScheduleInfoValid(schedInfo) {
    var lengthOfDate = 8;
    var lengthOfTime = 4;

    var date = schedInfo.date;
    var time = schedInfo.time;
    var city = schedInfo.city;
    var address = schedInfo.address;

    if (!date || !time || !city || !address) {
        return false;
    }

    if (isNaN(date) || isNaN(time)) {
        return false;
    }

    if (date.length !== lengthOfDate) {
        return false;
    }

    if (time.length !== lengthOfTime) {
        return false;
    }

    return true;
}

function isTechnicianInfoValid(techInfo) {
    var validRegions = ["north", "center", "south"];

    var techId = techInfo.tech_id;
    var firstName = techInfo.first_name;
    var lastName = techInfo.last_name;
    var phone = techInfo.phone;
    var region = techInfo.region;

    if (!techId || !firstName || !lastName || !phone || !region) {
        return false;
    }

    if (isNaN(techId)) {
        return false;
    }

    if (validRegions.indexOf(region) < 0) {
        return false;
    }

    return true;
}

function createScheduleDocument(schedInfo) {
    var date = schedInfo.date;
    var time = schedInfo.time;
    var city = schedInfo.city;
    var address = schedInfo.address;

    date = date.substring(0, 3) + "-" + date.substring(4, 5) + "-" + date.substring(6, 7);

    var doc = "{\"" + date + "\":[{\"" + time + "\":{\"city\":\"" + city + "\",\"address\":\"" + address + "\"}}]}";

    logger.debug("doc: " + doc);

    return JSON.parse(doc);
}

function createTechnicianDocument(techInfo) {
    var techId = techInfo.tech_id;
    var firstName = techInfo.first_name;
    var lastName = techInfo.last_name;
    var phone = techInfo.phone;
    var region = techInfo.region;

    var doc = "{\"tech_id\":\"" + techId + "\",\"first_name\":\"" + firstName + "\",\"last_name\":\"" + lastName + "\",\"phone\":\"" + phone + "\",\"region\":\"" + region + "\",\"schedule\":[]}";

    logger.debug("doc: " + doc);

    return JSON.parse(doc);
}

//######################################################
// Export Module
//######################################################

module.exports = {
    add : add,
    remove : remove,
    getAll : getAll,
    getById : getById,
    find : find,
    addSchedule : addSchedule,
    removeSchedule : removeSchedule,
    createIndex : createIndex,
    dropIndex : dropIndex
};