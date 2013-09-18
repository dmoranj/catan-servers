uuid = require("node-uuid"),
    Merchant = require("../model/merchantObj"),
    async = require("async");

function createMerchant(merchantName, url, callback) {
    var id = uuid.v4(),
        res = new Merchant();

    res.id = id;
    res.name = merchantName;
    res.url = url;

    res.save(callback);
}

function cleanMerchants(callback) {
    Merchant.remove({}, callback);
}

function listMerchants(callback) {
    Merchant.find({}, "name id url", callback);
}

function removeMerchant(resourceId, callback) {
    Merchant.remove({id: resourceId}, callback);
}

exports.createMerchant = createMerchant;
exports.cleanMerchants = cleanMerchants;
exports.listMerchants = listMerchants;
exports.removeMerchant = removeMerchant;
