var nouns = require("./nouns.json"),
    express = require('express'),
    routes = require('./routes'),
    config = require('./config'),
    restTools = require('./lib/restTools'),
    resources = require('./lib/resourceService'),
    GoldPrice = require('./model/goldPriceObj'),
    Resource = require('./model/resourceObj'),
    houseService = require('./lib/houseService'),
    uuid = require('node-uuid'),
    async = require('async'),
    apply = require('async').apply,
    http = require('http'),
    path = require('path');

function generateThing() {
    var prefixIndex = Math.floor(nouns.prefix.length * Math.random()),
        sufixIndex = Math.floor(nouns.sufix.length * Math.random()),
        coreIndex = Math.floor(nouns.core.length * Math.random());

    return nouns.prefix[prefixIndex] + nouns.core[coreIndex] + " " + nouns.sufix[sufixIndex];
}

function createStuffForGold(billUUID, gold, thing, callback) {
    var res = new GoldPrice();

    res.id = billUUID;
    res.gold = gold._id;
    res.thing = thing._id;

    res.save(callback);
}

/**
 * Adds a gold piece to the Resource pool, creating all the stuff needed to buy it.
 */
function addGold(globalCallback) {
    resources.create(config.goldServer.type, function (err, goldResult) {
        async.times(config.goldServer.prerequisites,

            /**
             * Add all the things needed for the gold purchase to the resource list
             */
            function addThings(n, callback) {
                resources.create(generateThing(), callback);
            },

            /**
             * Create the gold price object, containing the list of things needed to buy the gold.
             */
            function createGoldPrice(err, thingsList) {
                if (err) {
                    resources.remove(goldResult.id);
                    globalCallback(err);
                } else {
                    var billUUID = uuid.v4();

                    async.map(thingsList, apply(createStuffForGold, billUUID, goldResult), globalCallback);
                }
            }
        );
        console.log(config.goldServer.type + " created");
    });
}

function errorHandler(error, result) {
    if (error) {
        console.log("Couldn't create gold due to the following error: " + error);
    } else {
        console.log("Gold Mining successfully completed");
    }
}

function getRandomGold(callback) {
    Resource
        .findOne({
            name: "Oro",
            rnd: {$gte: Math.random()}
        })
        .sort({rnd:1})
        .exec(callback);
}

/**
 * The random selection of gold might not return any result, even if there is gold in the resource pool, if the random
 * number drawn is higher than any rnd field in the created golds. If that's the case, the first gold in the pool is
 * returned. If there is none, an error is returned.
 */
function checkGoldExist(gold, callback) {
    if (gold) {
        callback(null, gold);
    } else {
        Resource
            .findOne({name: "Oro"})
            .exec(function (error, newGold) {
                if (error) {
                    callback(error);
                } else if (newGold) {
                    callback(null, newGold);
                } else {
                    callback("No more gold in the mine. Let it grow.");
                }
            });
    }
}

function getGoldPrerequisites(gold, callback) {
    GoldPrice
        .find({
            gold: gold._id
        })
        .select({_id: 0, __v: 0, rnd: 0})
        .populate('thing', "name")
        .populate('gold', "id")
        .exec(callback)
}

function createPrerequisiteList(thingList, callback) {
    var goldUUID = thingList[0].id,
        cleanList,
        payload;

    cleanList = thingList.map(function cleanPrerequisites(thing) {
        return thing.thing[0].name;
    });

    payload = {
        billID: goldUUID,
        price: cleanList
    };

    callback(null, payload);
}

function getGoldBill(req, res) {
    function buildResponse (error, data) {
        if (error) {
            res.json(500, {
                error: 1243,
                message: "An error occurred picking one gold Up"
            });
        } else {
            res.json(200, data);
        }
    }

    async.waterfall([
        getRandomGold,
        checkGoldExist,
        getGoldPrerequisites,
        createPrerequisiteList
    ], buildResponse);
}

function getPrice(billId, callback) {
    GoldPrice
        .find({
            id: billId
        })
        .select({_id: 0, __v: 0, rnd: 0})
        .populate('thing')
        .populate('gold')
        .exec(callback)
}

function matchNeeds(thingsList, resources, callback) {
    var needs = {},
        result = true;

    for (var r=0; r < thingsList.length; r++) {
        if (needs[thingsList[r]]) {
            needs[thingsList[r]] ++
        } else {
            needs[thingsList[r]] = 1;
        }
    }

    for (var key in needs) {
        if (!(resources[key] && resources[key] == resources[key])) {
            result = false;
        }
    }

    if (result) {
        callback(null);
    } else {
        callback("Wrong Things offered. Look at your bill!");
    }
}

function buyGold(req, res) {
    function buildResponse(goldId, error) {
        if (error) {
            res.json(500, {
                message: error
            })
        } else {
            res.json(200, {
                type: "Oro",
                value: goldId
            });
        }
    }

    getPrice(req.body.billID, function (error, priceList) {
        if (error) {
            buildResponse(error);
        } else {
            var goldId = priceList[0].gold[0].id,
                thingsList= priceList.map(function cleanPrerequisites(thing) {
                    return thing.thing[0].name;
                });

            async.waterfall([
                apply(houseService.checkResources, req.body.resources),
                apply(matchNeeds, thingsList),
                apply(houseService.removeResources, req.body.resources),
                Resource.update.bind(Resource, {id: goldId}, {retrieved: true})
            ], apply(buildResponse, goldId));
        }
    });
}

function getThings(req, res) {
    Resource
        .findOne({
            rnd: {$gte: Math.random()}
        })
        .nin("name", ['Oro', 'Madera', 'Cemento', 'Metal'])
        .sort({rnd:1})
        .select({_id: 0, __v: 0, rnd: 0, retrieved: 0})
        .exec(function (error, thing) {
            if (error) {
                res.json(500, {
                    error: 1243,
                    message: "An error occurred picking one Thing up"
                });
            } else {
                res.json(200, thing);
            }
        });
}

function signupRoutes(appServer) {
    appServer.get('/comproOro', getGoldBill);
    appServer.post('/comproOro', buyGold);

    appServer.get('/cajondesastre', getThings);
}

function start() {
    app.configure(function () {
        app.set('port', process.env.PORT || config.goldServer.port);
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    });

    app.configure('development', function () {
        app.use(express.errorHandler());
    });

    signupRoutes(app);

    http.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });
}


var app = express();

resources.createServer(config.goldServer.type,
    config.goldServer.host + "/" +   config.goldServer.port,
    config.goldServer.description,
    function (error) {
        start();
        setInterval(apply(addGold, errorHandler), config.goldServer.period);
    });


