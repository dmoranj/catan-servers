var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./dbConn').db();

var GoldPrice = new Schema({
    id: String,
    gold: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    thing: [{ type: Schema.Types.ObjectId, ref: 'Resource' }]

});

GoldPrice.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
}

module.exports = db.model('GoldPrice', GoldPrice);
