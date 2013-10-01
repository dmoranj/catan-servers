
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    config = require('./config'),
    resources = require('./lib/resourceService'),
    http = require('http'),
    path = require('path');

var app = express();

function signupRoutes() {
    app.get('/design', routes.listDesigns);
    app.get('/house', routes.listHouses);
    app.post('/house', routes.createHouse);
    app.get('/resource/server', routes.listServers);
    app.get('/merchant', routes.listMerchants);
    app.post('/merchant', routes.createMerchant);

    if (config.endpoint.edit) {
        app.get('/resource', routes.getResources);
        app.delete('/design/:id', routes.deleteDesign);
        app.post('/design', routes.createDesign);
    }
}

function start() {
    app.configure(function () {
        app.set('port', process.env.PORT || config.endpoint.port);
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(require('cors')());
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    });

    app.configure('development', function () {
        app.use(express.errorHandler());
    });

    signupRoutes();

    http.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });
}

resources.cleanResources(function (error) {
    if (error) {
        console.log("Critical error cleaning resources: " + error);
    } else {
        start();
    }
})






