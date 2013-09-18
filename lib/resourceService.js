var uuid = require("node-uuid"),
    Resource = require("../model/resourceObj"),
    ResourceServer = require("../model/resourceServerObj"),
    async = require("async");

function createResource(resourceName, callback) {
    var id = uuid.v4(),
        res = new Resource();

    res.id = id;
    res.name = resourceName;
    res.retrieved = false;

    res.save(callback);
}

function listResources(callback) {
    Resource.find({}, "name id", callback);
}

function findAndRemove(type, callback) {
    Resource.findAndModify({ retrieved: false, name: type }, null, { "$set" : {retrieved: true} }, { fields: { id: 1, name: 1, retrieved: 1 } } , function (error, newValue, results) {
        if (error) {
            callback(error);
        } else {
            callback(null, newValue);
        }
    });
}

function getResource(id, callback) {
    Resource.findOne({id: id}, callback);
}

function removeResources(resourceId, callback) {
    Resource.remove({id: resourceId}, callback);
}

function createResourceServer(resourceName, url, description, callback) {
    var id = uuid.v4(),
        server = new ResourceServer();

    server.id = id;
    server.resourceName = resourceName;
    server.url = url;
    server.description = description;

    server.save(callback);
}

function removeResourceServer(resourceServerId, callback) {
    ResourceServer.remove({id: resourceServerId}, callback);
}

function cleanResources(callback) {
    async.series([
        function (innerCallback) {
            ResourceServer.remove({}, innerCallback);
        },
        function (innerCallback) {
            Resource.remove({}, innerCallback);
        }
    ], callback);
}

function listResourceServers(callback) {
    ResourceServer.find(callback);
}

exports.create = createResource;
exports.list = listResources;
exports.remove = removeResources;
exports.createServer = createResourceServer;
exports.listServers = listResourceServers;
exports.removeServer = removeResourceServer;
exports.get = getResource;
exports.findAndRemove = findAndRemove;
exports.cleanResources = cleanResources;
