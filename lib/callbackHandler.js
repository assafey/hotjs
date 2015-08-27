'use strict';

var logger = require("./logger");

function Handler(logger) {
    this.logger = logger;
    return this;
}

Handler.prototype.call = function call(callback, err, res) {
    if (err) {
        this.error(callback, err);
    } else {
        this.result(callback, res);
    }
};

Handler.prototype.error = function error(callback, err) {
    this.logger.error(err);
    callback(err, undefined);
};

Handler.prototype.result = function result(callback, res) {
    if (res) {
        this.logger.info(JSON.stringify(res));
    }
    callback(undefined, res);
};

//######################################################
// Export Module
//######################################################

module.exports.Handler = Handler;