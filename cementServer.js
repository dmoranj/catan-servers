
/**
 * Module dependencies.
 */

var amqp = require('amqp'),
    routes = require('./routes'),
    config = require('./config'),
    restTools = require('./lib/restTools'),
    resources = require('./lib/resourceService'),
    path = require('path');

(function cementServer() {
    this.connections = [];

    function createConnection(i) {
        var conn = amqp.createConnection({
            port: config.cementServer.queueServer[i].port,
            host: config.cementServer.queueServer[i].host,
            login: config.cementServer.queueServer[i].login,
            password: config.cementServer.queueServer[i].password,
            heartbeat: config.cementServer.queueServer[i].heartbeat
        });

        // Events for this queue
        conn.on('ready', (function() {
            console.log("Message Broker, Queue ready --> Connected to one Message Broker");
            this.connections.push(conn);
        }).bind(this));

        conn.on('close', (function() {
            console.log("Message Broker, Queue closed");
            this.removeConnection(conn);
        }).bind(this));

        conn.on('error', (function(error) {
            console.log("Message Broker, Queue error");
            this.removeConnection(conn);
        }).bind(this));

        conn.on('heartbeat', (function() {
            console.log("Message Broker, Heartbeat");
        }).bind(this));
    }

    function removeConnection(conn) {
        var index = this.connections.indexOf(conn);
        if (index >= 0) {
            this.connections.splice(index, 1);
        }
    }

    function pushToTheQueue(data) {
        // Send to one of the connections that is connected to a queue
        // TODO: send randomly , not to the first open connection (which is the easiest 'algorithm')
        var send = false;
        this.connections.forEach(function(connection) {
          if(connection && !send) {
            connection.publish(config.cementServer.queueName, data);
            send = true;
          }
        });
    }

    function addCement() {
        resources.create(config.cementServer.type, function (err, result) {
            console.log(config.cementServer.type + " created");
        });
    }

    function loadCement() {
        // Load the cement to the "truck" (the Queue ;)
        // As soon as we load it to the truck, the resource is delivered
        resources.findAndRemove(config.cementServer.type, function (error, removedCement) {
            if (error) {
                console.log('Error loading cement into the truck: ' + error);
            } else if (removedCement) {
                pushToTheQueue(removedCement);
                console.log(config.cementServer.type + " loaded into the truck!");
            } else {
                console.log('Cement not found. Wait it to grow');
            }
        });
    }

    function start() {
        // Create connection to the broker
        for (var i = config.cementServer.queueServer.length - 1; i >= 0; i--) {
            process.nextTick(createConnection.bind(this, i));
        }
    }

    resources.createServer(config.cementServer.type,
        config.cementServer.queueName,
        config.cementServer.description,
        function (error) {
            start();
            setInterval(function() {
                addCement();
                loadCement();
            }, config.cementServer.period);
        });
})();
