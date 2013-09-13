var
    config = {};

config.endpoint = {
    port: 3001,
    edit: true
};

config.woodServer = {
    port: 3003,
    period: 5000,
    type: "Piedra"
};

config.mongo = {
    host: "localhost",
    db: 'catan-servers',
    user: '',
    password: ''
};

module.exports = config;