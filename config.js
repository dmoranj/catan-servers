var
    config = {};

config.endpoint = {
    port: 3001,
    edit: true
};

config.woodServer = {
    host: "http://localhost",
    port: 3003,
    period: 4000,
    type: "Madera"
};

config.woodServer.description = "Simple HTTP server without authentication. Can be " +
    "mined making a GET request to the '/chop' resource. It provides " + config.woodServer.type;

config.steelServer = {
    host: "http://localhost",
    port: 3005,
    socketIOPort: 3004,
    period: 4000,
    type: "Metal"
};

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