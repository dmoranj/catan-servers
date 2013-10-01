'use strict';

var rankingService = require('../lib/rankingService'),
    restTools = require("../lib/restTools");

function ranking(req, res) {
  rankingService.top(function(err, data) {
    if (err) {
      return res.json(500, restTools.generateError("101", err));
    }
    res.json(data);
  });
}

module.exports = {
  ranking: ranking
};