var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = require('./dbConn').db();

var Resource = new Schema({
    id: String,
    name: String,
    retrieved: Boolean,
    rnd: { type: [Number], index: true }
});

Resource.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
}

module.exports = db.model('Resource', Resource);
