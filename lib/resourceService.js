var uuid = require("node-uuid"),
    Resource = require("../model/resourceObj");

function createResource(resourceName, callback) {
    var id = uuid.v4(),
        res = new Resource();

    res.id = id;
    res.name = resourceName;

    res.save(callback);
}

function listResources(callback) {
    Resource.find({}, "name id", callback);
}

function findAndRemove(callback) {
    Resource.findOneAndRemove().exec(callback);
}

function getResource(id, callback) {
    Resource.findOne({id: id}, callback);
}

function removeResources(resourceId, callback) {
    Resource.remove({id: resourceId}, callback);
}

exports.create = createResource;
exports.list = listResources;
exports.remove = removeResources;
exports.get = getResource;
exports.findAndRemove = findAndRemove;
