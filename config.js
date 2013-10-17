var
    config = {};

config.endpoint = {
    port: 3001,
    edit: false
};

config.woodServer = {
    host: "http://10.95.195.163",
    port: 3003,
    period: 100,
    type: "Madera"
};

config.goldServer = {
    host: "http://10.95.195.163",
    port: 3008,
    period: 2000,
    type: "Oro",
    prerequisites: 4
};

config.cementServer = {
    // It's possible to connect to multiple servers or multiple connections per server
    queueServer: [{
        host: 'localhost',
        port: 5672, //AMQP default port
        login: 'guest',
        password: 'guest',
        heartbeat: 1200
      },
      {
        host: 'localhost',
        port: 5672,
        login: 'guest',
        password: 'guest',
        heartbeat: 1200
      },
      {
        host: 'localhost',
        port: 5672,
        login: 'guest',
        password: 'guest',
        heartbeat: 1200
      }],
    queueName: 'cemento',   // We don't create the queue, so it shall be created as PERSISTENT into RabbitMQ
    period: 100,
    type: "Cemento"
};

config.cementServer.description = "Simple AMQP producer to RabbitMQ. Can be " +
    "mined making consuming the resources from the RabbitMQ. It provides " + config.cementServer.type;
config.woodServer.description = "Simple HTTP server without authentication. Can be " +
    "mined making a GET request to the '/chop' resource. It provides " + config.woodServer.type;

config.steelServer = {
    host: "http://10.95.195.163",
    port: 3005,
    socketIOPort: 3004,
    period: 1000,
    type: "Metal"
};

config.steelServer.description = "Socket IO server that provides " + config.steelServer.type + ". To mine" +
    " it, follow the protocol described in the documentation."

config.mongo = {
    host: "localhost",
    db: 'catan-servers',
    user: '',
    password: ''
};

config.redis = {
    host: "localhost",
    port: "6379"
};

module.exports = config;
