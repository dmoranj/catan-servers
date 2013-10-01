'use strict';

var HouseService = require("./houseService"),
    async = require('async'),
    _ = require('underscore');


function accumulateHouses(houses) {
  return _.chain(houses)
      .reduce(function iterator(memo, type) {
        memo[type] = (++memo[type]) || 1;
        return memo;
      }, {})
      .map(function iterator(value, key) {
        return {
          type: key,
          count: value
        };
      })
      .value();
}

function finalizeTop(items) {
  return items.map(function iterator(item) {
    item.houses = accumulateHouses(item.houses);
    return item;
  });
}

function aggregationReduceTop(designs, houses) {
  return _.reduce(houses, function iterator(memo, properties, owner) {
    var obj = {
      owner: owner,
      houses: [],
      points: 0
    };

    properties.forEach(function iterator(property) {
      var originalDesign = designs[property.designId];
      if (!originalDesign) {
        console.warn('%s design associated to a property of %s ' +
            'does not exists as a registered design', property.designId, owner);
        return;
      }
      obj.houses.push(originalDesign.type);
      obj.points += originalDesign.value;
    });

    memo.push(obj);

    return memo;
  }, []);
}

function top(cb) {
  async.parallel({
    designs: HouseService.listDesigns,
    houses: HouseService.listHouses
  }, function aggregationCallback(err, data) {
    if (err) {
      return cb(err);
    }

    cb(null, finalizeTop(aggregationReduceTop(
        _.indexBy(data.designs, 'id'),
        _.groupBy(data.houses, 'owner')
    )));
  });
}

module.exports = {
  top: top
};

