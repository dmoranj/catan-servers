'use strict';

var rankingService = require('../lib/rankingService'),
    restTools = require("../lib/restTools");

module.exports = {

  ranking: function(req, res) {
    rankingService.top(function(err, data) {
      if (err) {
        return res.json(500, restTools.generateError("101", err));
      }
      res.json(data);
    });
  }

};