var
    config = {};

config.endpoint = {
    port: 3001,
    edit: true
};

config.woodServer = {
    port: 3001,
    period: 5000
};

config.mongo = {
    host: "localhost",
    db: 'catan-servers',
    user: '',
    password: ''
};

module.exports = config;