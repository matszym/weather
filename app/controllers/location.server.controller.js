'use strict';

var Promise = require('bluebird'),
mongoose = require('mongoose'),
_ = require('underscore'),
GoogleMaps = require('google-locations'),
config = require('../../config/config.js'),
Location = mongoose.model('Location');

mongoose.Promise = Promise;

exports.getLocationFromDB = function(req, res) {
   return new Promise(function(resolve, reject) {
      Location.findOne(req.query.address)
      .then(function(loc) {
         req.location = loc;
         resolve(req.location);
      })
      .catch(function(err) {
         res.json(err);
         reject(err);
      });
   });
};

exports.getLocationFromGoogleMaps = function(req, res, serviceConfig) {
   serviceConfig = serviceConfig || {};

   var locations = new GoogleMaps(config.googleMapsAPI, serviceConfig);

   return new Promise(function(resolve, reject) {
      if(req.location) {
         resolve(req.location);
      }

      var query = {
         address: req.body.query.address
      },
      /**
       * locations.geocodeAddress is not a pure function, 
       * it mutates config objects, so we make copy of query object
       */
      queryCopy = _.extend({}, query),
      search = Promise.promisify(locations.geocodeAddress.bind(locations, queryCopy));
      search()
      .then(function(result) {
         var loc = result.results[0].geometry.location;
         loc = _.extend({}, {
            cords: {
               latitude: loc.lat,
               longitude: loc.lng
            },
            address: req.body.query.address
         });

         var options = {
            upsert: true
         };
         console.log('Find one and update');
         return Location.findOneAndUpdate(query, loc, options).exec().timeout(1000, 'Database timeout, could not save location.');
      })
      .then(function(oldDoc) {
         console.log('found oldDoc');
         return Location.findOne(query);
      })
      .then(function(doc) {
         console.log('Found new doc');
         if(doc) {
            req.location = doc;
            resolve(doc);
         }
         else {
            throw new Error('Database error, could not save location.');
         }
      })
      .catch(Promise.TimeoutError, function(error) {
         res.json(error);
         reject(error);
      })
      .catch(function(err) {
         console.log(err);
         res.json(err);
         reject(err);
      });
   });
};
