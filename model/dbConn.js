"use strict";

var
    mongoose = require('mongoose'),
    config = require('../config'),
    defaultDb;
/**
 * This module sets up the connection with the mongodb through mongoose. This connection will be used
 * in mongoose schemas to persist objects.
 */

/**
 * Creates a new connection to the Mongo DB.
 *
 * @returns {*}
 *
 * @private
 */
function createConn() {
    var db = mongoose.createConnection(config.mongo.host, config.mongo.db);
    db.db.serverConfig.options.auto_reconnect = true;
    db.on('error', function (error) {
        console.error("Error connecting to the db: " + error);
        process.exit(1);
    });

    return db;
}

exports.createConn = createConn;
exports.db = function () {
    if (!defaultDb) {
        defaultDb = createConn();
    }

    return defaultDb;
};