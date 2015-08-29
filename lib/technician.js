'use strict';

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

function find(region, date, time, callback) {
    var validRegions = ["north", "center", "south"];
    var lengthOfDate = 8;
    var lengthOfTime = 4;

    logger.debug("find available technician");

    if (!region) {
        handler.error("Technician region is undefined");
    } else if (!date) {
        handler.error("Technician date is undefined");
    } else if (!time) {
        handler.error("Technician time is undefined");
    } else if (date.length !== lengthOfDate) {
        handler.error("Technician date is invalid");
    } else if (time.length !== lengthOfTime) {
        handler.error("Technician time is invalid");
    } else if (validRegions.indexOf(region) < 0) {
        handler.error("Technician region is invalid");
    } else {
        technicians.find({region:region, schedule:{$elemMatch:{date:{$eq:date},time:{$ne:time}}}}, {tech_id:'', first_name:'', last_name:'', schedule:''})
            .toArray(function(err, res) {
                if (res.length === 0) {
                    logger.debug("did not find available techs that has the required date " + date);
                    logger.debug("trying to find techs that are available on this date " + date);
                    technicians.find({region:region, schedule:{$elemMatch:{date:{$ne:date}}}}, {tech_id:'', first_name:'', last_name:'', schedule:''})
                        .toArray(function(err, res) {
                            if (res.length === 0) {
                                logger.debug("trying to find techs that has no schedule yet");
                                technicians.find({region:region, schedule:{$size:0}}, {tech_id:'', first_name:'', last_name:'', schedule:''})
                                    .toArray(function(err, res) {
                                        handler.call(callback, err, res);
                                    });
                            } else {
                                handler.call(callback, err, res);
                            }
                        });
                } else {
                    handler.call(callback, err, res);
                }
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
            if (!err && res) {
                var date = schedInfo.date;
                var time = schedInfo.time;
                var city = schedInfo.city;
                var address = schedInfo.address;

                if (!res.schedule) {
                    handler.error(callback, "Failed to get technician's schedule");
                } else if (hasScheduleOnSameDateAndTime(res.schedule, date, time)) {
                    handler.error(callback, "Technician has schedule in this date and time");
                } else {
                    res.schedule.push(
                        {
                            date: date,
                            time: time,
                            city: city,
                            address: address
                        }
                    );

                    technicians.update({tech_id:res.tech_id}, /*{schedule:res.schedule}*/res, function(err, res) {
                        handler.call(callback, err, res);
                    });
                }
            } else {
                handler.error(callback, "Failed to get technician");
            }
        });
    }
}

function removeSchedule(techId, date, time, callback) {
    logger.debug("remove technician schedule");
    if (!techId) {
        handler.error("Technician id is undefined");
    } else if (isNaN(techId)) {
        handler.error("Technician id is invalid");
    } else if (!date || !time) {
        handler.error("Technician date or time is undefined");
    } else {
        getById(techId, function(err, res) {
            if (!res.schedule) {
                handler.error(callback, "Failed to get technician's schedule");
            } else {
                for (var i = 0; i < res.schedule.length; i++) {
                    if (res.schedule[i].date === date && res.schedule[i].time === time) {
                        res.schedule.splice(i, 1);
                    }
                }
                technicians.update({tech_id:techId}, res, function(err, res) {
                    handler.call(callback, err, res);
                });
            }
        });
    }
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

function hasScheduleOnSameDateAndTime(schedule, date, time) {
    for (var i = 0; i < schedule.length; i++) {
        var dateAndTime = schedule[i];
        if (dateAndTime.date === date && dateAndTime.time === time) {
            return true;
        }
    }

    return false;
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