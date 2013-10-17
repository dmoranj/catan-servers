var express = require('express'),
    routes = require('./routes'),
    config = require('./config'),
    restTools = require('./lib/restTools'),
    resources = require('./lib/resourceService'),
    http = require('http'),
    path = require('path');

var app = express();

function chop(req, res) {
    resources.findAndRemove(config.woodServer.type, function (error, removedWood) {
        if (error) {
            res.json(500, restTools.generateError("W001", error));
        } else if (removedWood) {
            res.json(200, removedWood);
            console.log(config.woodServer.type + " chopped!");
        } else {
            res.json(404, {message: "Wood not found. Wait it to grow"});
        }
    })
}

function addWood() {
    resources.create(config.woodServer.type, function (err, result) {
        console.log(config.woodServer.type + " created");
    });
}

function signupRoutes(appServer) {
    appServer.get('/chop', chop);
}

function start() {
    app.configure(function () {
        app.set('port', process.env.PORT || config.woodServer.port);
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

resources.createServer(config.woodServer.type,
    config.woodServer.host + ":" +   config.woodServer.port,
    config.woodServer.description,
    function (error) {
        start();
        setInterval(addWood, config.woodServer.period);
    });
