'use strict';

var rankingService = require('../lib/rankingService');

module.exports = {

  ranking: function(req, res) {
    rankingService.top(function(err, data) {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
    return;
    res.json([
      { owner: 'paquito', designs:['Casa', 'Mansión'], points:10 },
      { owner: 'andres', designs:['Mansión', 'Mansión'], points:40 },
      { owner: 'luis', designs:['Casa', 'Chabola'], points:20 },
      { owner: 'jose', designs:['Casa', 'Choza'], points:30 },
      { owner: 'amparo', designs:['Alcantarilla', 'Mansión'], points:50 },
      { owner: 'pozi', designs:['Mansión'], points:60 }
    ]);
  }

};