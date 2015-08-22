'use strict';

var enable = {
    "debug" : true,
    "error" : true,
    "info" : true,
    "warning" : true,
    "fatal" : true
}

function Logger(name) {
    this.name = name;
}

Logger.prototype.debug = function debug(msg) {
    if (enable["debug"]) {
        print("DBG", this.name, msg);
    }
};

Logger.prototype.error = function error(msg) {
    if (enable["error"]) {
        print("ERR", this.name, msg);
    }
};

Logger.prototype.info = function info(msg) {
    if (enable["info"]) {
        print("INF", this.name, msg);
    }
};

Logger.prototype.warning = function warning(msg) {
    if (enable["warning"]) {
        print("WRN", this.name, msg);
    }
};

Logger.prototype.fatal = function fatal(msg) {
    if (enable["fatal"]) {
        print("FTL", this.name, msg);
    }
};

function print(severity, name, msg) {
    if (name) {
        console.log(severity + " " + getDate() + ": " + name + "> " + msg);
    } else {
        console.log(severity + " " + getDate() + ": " + msg);
    }
}

function getDate() {
    var now = new Date();
    return "[" + now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDay() + "," +
        now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds() + "]";
}

//######################################################
// Export Module
//######################################################

module.exports.Logger = Logger;