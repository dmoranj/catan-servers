var uuid = require("node-uuid"),
    House = require("../model/houseObj"),
    Design = require("../model/designObj"),
    resourceService = require("./resourceService"),
    async = require("async");

function buildHouse (login, type, resources, callback) {
    var id = uuid.v4(),
        home = new House();

    home.id = id;
    home.owner = login;
    home.designId = type;

    home.save(callback);
}

function checkResource(resource, callback) {
    resourceService.get(resource, function (err, res) {
        if (err) {
            callback(null);
        } else if (!res) {
            callback("Resource not found: " + resource);
        } else {
            callback(null, res);
        }
    });
}

function checkResources(resources, callback) {
    async.map(resources, checkResource, function (err, resultList) {
        if (err) {
            callback(err);
        } else {
            var matchs = {},
                used = {},
                result = true;

            for (var b in resultList) {
                if (resultList[b]) {
                    if (matchs[resultList[b].name]) {
                        matchs[resultList[b].name]++;
                    } else {
                        matchs[resultList[b].name]=1;
                    }

                    if (used[resultList[b].id]) {
                        result = false;
                    } else {
                        used[resultList[b].id] = true;
                    }
                }
            }

            if (result) {
                callback(null, matchs);
            } else {
                callback("Resources invalid or not found");
            }
        }
    });
}

function matchNeeds(designId, granted, callback) {
    Design.findOne({id: designId}, function (error, design) {
        if (error) {
            callback("Design not found");
        } else {
            var needs = {},
                result = true;

            for (var r=0; r < design.resources.length; r++) {
                if (needs[design.resources[r]]) {
                    needs[design.resources[r]] ++
                } else {
                    needs[design.resources[r]] = 1;
                }
            }

            for (var key in needs) {
                if (!(granted[key] && granted[key] == needs[key])) {
                    result = false;
                }
            }

            if (result) {
                callback(null)
            } else {
                var errorString = "Design needs did not match the provided resources. Expected [";

                for (var i=0; i < design.resources.length; i++) {
                    errorString += design.resources[i] + ",";
                }

                errorString += "] got [";

                for (var i=0; i < granted.length; i++) {
                    errorString += granted[i] + ",";
                }

                errorString += "]";

                callback(errorString);
            }
        }
    });
}

function filterHouseFields(house, number, callback) {
    var filteredHouse = {
        designId: house.designId,
        owner: house.owner,
        id: house.id
    };

    callback(null, filteredHouse);
}

function removeResources (resources, callback) {
    async.map(resources, resourceService.remove, callback);
}

function buyHouse(login, designId, resources, callback) {
    async.waterfall([
        async.apply(checkResources, resources),
        async.apply(matchNeeds, designId),
        async.apply(removeResources, resources),
        async.apply(buildHouse, login, designId),
        filterHouseFields
    ], callback)
}

function createDesign(type, resources, value, callback) {
    var id = uuid.v4(),
        des = new Design();

    des.id = id;
    des.type = type;
    des.resources = resources;
    des.value = value;

    des.save(callback);
}

function removeDesign(designId, callback) {
    Design.remove({id: designId}, callback);
}

function removeHouse(houseId, callback) {
    House.remove({id: houseId}, callback);
}

function listDesigns(callback) {
    Design.find()
        .select({_id: 0, __v: 0})
        .exec(callback);
}

function listHouses(callback) {
    House.find()
        .select({_id: 0, __v: 0})
        .exec(callback);
}

exports.buyHouse = buyHouse;
exports.listHouses = listHouses;
exports.listDesigns = listDesigns;
exports.removeDesign = removeDesign;
exports.removeHouse = removeHouse;
exports.createDesign = createDesign;

exports.checkResources = checkResources;
exports.matchNeeds = matchNeeds;
exports.removeResources = removeResources;
