var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./dbConn').db();

var Merchant = new Schema({
    id: String,
    url: String,
    name: String
});

module.exports = db.model('Merchant', Merchant);
