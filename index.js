'use strict';

var hot = require('./lib/hotjs');

if (hot === undefined) {
    console.log("hot undefined");
} else {
    hot.initialize();
    hot.start();
}
