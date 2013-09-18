var
    config = {};

config.endpoint = {
    port: 3001,
    edit: true
};

config.woodServer = {
    host: "http://localhost",
    port: 3004,
    period: 4000,
    type: "Piedra"
};

config.woodServer.description = "Simple HTTP server without authentication. Can be " +
    "mined making a GET request to the '/chop' resource. It provides " + config.woodServer.type;

config.mongo = {
    host: "localhost",
    db: 'catan-servers',
    user: '',
    password: ''
};

module.exports = config;