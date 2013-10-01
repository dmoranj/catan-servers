"use strict";

var express = require('express'),
    routes = require('./routes'),
    config = require('./config'),
    restTools = require('./lib/restTools'),
    resources = require('./lib/resourceService'),
    http = require('http'),
    uuid = require('node-uuid'),
    path = require('path'),
    redis = require('redis'),
    connection;

var app = express();

function getRedisConnection() {
    var cli = redis.createClient(config.redis.port, config.redis.host);

    cli.select(config.redis.database);

    cli.on('error', function(err){
        console.log("Couldn't recover from redis error");
        process.exit(1);
    });

    return cli;
}

/**
 * Creates a new Steel resource (an UUID) and add it to the DB.
 */
function addSteel() {
    resources.create(config.steelServer.type, function (err, result) {
        console.log(config.steelServer.type + " created");
    });
}

/**
 * First event in the protocol: ask the requestor for a House Visiting certificate. This certificate will be expedited
 * in the HTTP endpoint path /casa, indicating the address of the house. The certificate will be generated in this same
 * method each time the conversation is initiated.
 */
function askForHouseVisitingCertificate (socket, data) {
    this.state = 1;
    this.uuidCasa = uuid.v4(),
    this.ackCasa = uuid.v4();

    connection.hset("acks-casa", this.uuidCasa, this.ackCasa);

    socket.emit('¿Pasó usted por mi casa?', {
        address: this.uuidCasa
    });
}

/**
 * Second step in the protocol: the requestor shows the House Visiting certificate. If no certificate is shown or if the
 * state of the conversation is not the appropiate (state == 1) the state returns to zero and an error is emitted.
 *
 * If the certificate is valid, a Grandma Visiting certificate is expedited, to be picked in the HTTP endpoint path
 * /abuela, with the given name (same mechanism as in the last step).
 */
function checkHouseCertificate (socket, data) {

    if (this.state != 1) {
        this.state = 0;
        socket.emit('Error', {
            message: "Tried to access stage 2 from stage other than 1",
            action: "Restart handshake"
        });
    } else if (data && data.confirmation && data.confirmation == this.ackCasa) {
        this.uuidAbuela = uuid.v4(),
            this.ackAbuela = uuid.v4();

        this.state = 2;

        connection.hset("acks-abuela", this.uuidAbuela, this.ackAbuela);

        socket.emit('¿Vio usted a mi abuela?', {
            grandMaName: this.uuidAbuela
        });
    } else {
        this.state = 0;
        socket.emit('Error', {
            message: "Either the address was not confirmed or it was not correct.",
            data: data,
            action: "Restart handshake"
        });
    }
}

/**
 * Third step in the algorithm: check the Grandma Certificate. If its not valid, state returns to zero and an error is
 * emitted.
 *
 * If its valid, a steel is removed from the db and granted to the visitor. Next step is optional, but polite. To avoid
 * the certificate being reused, the state is set to zero no matter the result.
 */
function granmaSightConfirmation (socket, data) {
    if (this.state != 2) {
        socket.emit('Error', {
            message: "Tried to access stage 3 from stage other than 2",
            action: "Restart handshake"
        });
    } else if (data && data.grandMaName && data.grandMaName == this.ackAbuela) {
        resources.findAndRemove(config.steelServer.type, function (error, removedSteel) {
            if (error) {
                socket.emit('Error', {
                    message: "Internal error in the server: " + error,
                    action: "Alert"
                });
            } else if (removedSteel) {

                socket.emit("¡Adios Don Pepito!", {
                    resource: removedSteel.id,
                    resourceType: config.steelServer.type
                });

                console.log(config.steelServer.type + " chopped!");
            } else {
                socket.emit('Error', {
                    message: "Steel depleted. Try again.",
                    action: "Repeat"
                });
            }
        })

    } else {
        socket.emit('Error', {
            message: "Either the grandma name was not confirmed or it was not correct.",
            data: data,
            action: "Restart handshake"
        });
    }

    this.state = 0;
}

/**
 * Initiates the socket IO communication, assigning the handlers to every event in the protocol.
 */
function initiateSocketIO() {
    var io = require('socket.io').listen(config.steelServer.socketIOPort);
    io.set('log level', 1);

    io.sockets.on('connection', function (socket) {
        var connectionState = {
                state: 0,
                uuidCasa: null,
                uuidAbuela: null,
                ackCasa: null,
                ackAbuela: null
            };

        socket.emit('¡Hola Don Pepito!', {});

        socket.on('¡Hola Don Jose!', askForHouseVisitingCertificate.bind(connectionState, socket));

        socket.on("Por su casa yo pasé", checkHouseCertificate.bind(connectionState, socket));

        socket.on("A su abuela yo la vi", granmaSightConfirmation.bind(connectionState, socket));

        socket.on("¡Adios Don Jose!", function (data) {
            console.log("Protocol finished");
        });
    });
}

/**
 * Grants the House Visit Certificate for the address asked.The certificate is retrieved from Redis.
 */
function visitCasa(req, res) {
    if (!req.body.address) {
        res.json(400, {
            message: "No address was given. No confirmation will be returned."
        });
    } else {
        connection.hget("acks-casa", req.body.address, function (error, data) {
            if (error) {
                res.json(500, {
                    message: "There was an error looking for the address"
                });
            } else if (data) {
                res.json(200, {
                    message: "Wellcome to the house. This is your certificate.",
                    certificate: data
                })
            } else {
                res.json(404, {
                    message: "The given address was not found"
                });
            }
        });
    }
}

/**
 * Grants the Granma Visit Certificate for the selected granma.The certificate is retrieved from Redis.
 */
function greetGranma(req, res) {
    if (!req.body.granMaName) {
        res.json(400, {
            message: "No Granma name was given. No confirmation will be returned."
        });
    } else {
        connection.hget("acks-abuela", req.body.granMaName, function (error, data) {
            if (error) {
                res.json(500, {
                    message: "There was an error looking for Granma " + req.body.granMaName
                });
            } else if (data) {
                res.json(200, {
                    message: "Hello sweetie. This is your certificate.",
                    certificate: data
                })
            } else {
                res.json(404, {
                    message: "The given granma was not found"
                });
            }
        });
    }
}

function signupRoutes(appServer) {
    appServer.post("/casa", visitCasa);
    appServer.post('/abuela', greetGranma);
}

function start() {
    app.configure(function () {
        app.set('port', process.env.PORT || config.steelServer.port);
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

resources.createServer(config.steelServer.type,
    config.steelServer.host + "/" +   config.steelServer.port,
    config.steelServer.description,
    function (error) {
        connection = getRedisConnection();
        initiateSocketIO();
        setInterval(addSteel, config.steelServer.period);
        start();
    });