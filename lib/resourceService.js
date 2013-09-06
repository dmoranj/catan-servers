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



/*
createResource("Madera", function (error, res) {
    console.log("Madera creada");
});
*/

/*
removeResources("8b1408c4-e15b-40a4-a26f-b3d51ef72a5f", function (error, res) {
    console.log("Madera borrada");
})*/

/*
listResources(function (error, listRes) {
    for (var i=0; i < listRes.length; i++) {
        console.log("Recurso " + listRes[i].name + ": " + listRes[i].id);
    }
});
    */