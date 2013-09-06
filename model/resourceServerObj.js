var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./dbConn').db();

var ResourceServer = new Schema({
    id: String,
    resourceName: String,
    url: String,
    description: String
});

module.exports = db.model('ResourceServer', ResourceServer);