var uuid = require("node-uuid"),
    Resource = require("../model/resourceObj"),
    ResourceServer = require("../model/resourceServerObj");

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
