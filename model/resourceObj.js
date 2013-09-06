var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./dbConn').db();

var Resource = new Schema({
    id: String,
    name: String
});

module.exports = db.model('Resource', Resource);
