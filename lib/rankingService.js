'use strict';

var HouseService = require("./houseService"),
    async = require('async'),
    _ = require('underscore');

module.exports = {
  top: function(cb) {
    async.parallel({
      designs: HouseService.listDesigns,
      houses: HouseService.listHouses
    }, function (err, data) {
      if (err) {
        return cb(err);
      }
      var designs = _.indexBy(data.designs, 'id'),
          houses = _.groupBy(data.houses, 'owner');

      cb (null, _.reduce(houses, function(memo, properties, owner) {
        var obj = {
          owner: owner,
          designs: [],
          points: 0
        };
        properties.forEach(function(design) {
          if (!designs[design.designId]) {
            console.warn('%s design associated to a property of %s does not exists as a registered design', design.designId, owner);
            return;
          }
          obj.designs.push(designs[design.designId].type);
          obj.points += designs[design.designId].value;
        });
        memo.push(obj);
        return memo;
      }, []));
    });
  }
};

