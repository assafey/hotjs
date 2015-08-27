'use strict';

var hot = require('./lib/hot');

if (hot === undefined) {
    console.log("hot undefined");
} else {
    hot.initialize();
    hot.start();
}
