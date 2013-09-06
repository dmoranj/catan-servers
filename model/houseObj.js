var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./dbConn').db();

var House = new Schema({
    id: String,
    designId: String,
    owner: String
});

module.exports = db.model('House', House);
