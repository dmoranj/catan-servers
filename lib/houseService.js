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
            callback("Resource not found");
        } else {
            callback(null, res);
        }
    });
}

function checkResources(resources, callback) {
    async.map(resources, checkResource, function (err, resultList) {
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
                callback("Design needs did not match the provided resources");
            }
        }
    });
}

function removeResources (resources, callback) {
    async.map(resources, resourceService.remove, callback);
}

function buyHouse(login, designId, resources, callback) {
    async.waterfall([
        async.apply(checkResources, resources),
        async.apply(matchNeeds, designId),
        async.apply(removeResources, resources),
        async.apply(buildHouse, login, designId)
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
    Design.find(callback);
}

function listHouses(callback) {
    House.find(callback);
}

exports.buyHouse = buyHouse;
exports.listHouses = listHouses;
exports.listDesigns = listDesigns;
exports.removeDesign = removeDesign;
exports.removeHouse = removeHouse;
exports.createDesign = createDesign;



/*
buyHouse ("dmj", "59395755-77b3-45ad-a4e4-c090308b08d3", [
    "4dc9fd59-37d0-45d5-b1f7-8921d0454045",
    "d8f1a500-5f4f-4be7-b8bc-c3138f7b1a70",
    "608807c3-db66-4e47-a09f-d296a2de45b3"
], function (error) {
    console.log("Se ha logrado comprar la casA?: [" + error + "]");
})
*/

/*
createDesign("Choza", ["Madera", "Madera", "Madera"], 1, function (err, res) {
    console.log("Created design");
})
*/

/*
removeDesign("8deef822-a023-425b-9a2e-efe8c0aeaa53", function (err, res) {
    console.log("Design removed");
})*/

/*
listDesigns(function (error, listRes) {
    for (var i=0; i < listRes.length; i++) {
        console.log("Recurso " + listRes[i].type + ": " + listRes[i].value);
    }
});
*/