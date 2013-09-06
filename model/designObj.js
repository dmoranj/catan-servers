var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./dbConn').db();

var Design = new Schema({
    id: String,
    type: String,
    resources: Array,
    value: Number
});

module.exports = db.model('Design', Design);
