/*jshint expr: true*/

'use strict';
var expect = require('chai').expect,
mongoose = require('mongoose'),
_ = require('underscore'),
chai = require('chai'),
chaiAsPromised = require('chai-as-promised'),
bluebird = require('bluebird');
chai.use(chaiAsPromised);
mongoose.Promise = bluebird;

describe('mongodb database', function() {
   var server,
   app,
   db,
   appPath = '../../../../',
   Location = require(appPath + 'models/location-schema.server.model.js');

   before(function() {
      var express = require('express');
      app = express();
      db = require('mongoose').connect('mongodb://localhost/test');
      server = app.listen(3000);
   });

   after(function() {
      server.close();
   });

   afterEach(function(done) {
      Location.remove({})
      .then(function() {
         return Location.find({});
      })
      .then(function(result) {
         expect(result.length).to.be.equal(0);
      })
      .then(function() {
         done();
      })
      .catch(function(err) {
         done(err);
      });
   });

   describe('location schema', function() {
      it('should exist', function(done) {
         expect(Location).to.exist;
         done();
      });
      it('can be saved in db', function(done) {
         Location.create({
            cords: {
               latitude: 51.6828,
               longitude: 18.1814
            },
            address: "Saczyn, Polska"
         })
         .then(function(){
            return Location.find({address: 'Saczyn, Polska'}); 
         })
         .then(function(result) {
            expect(result).to.exist;
         })
         .catch(function(err) {
            expect(err).to.not.exist;
         })
         .finally(function() {
            done();
         });
      });
      it('should reject documents without cords', function() {
         function locationFactory(baseObject, obj) {
            return _.extend({}, baseObject, obj);
         }
         var validLocation = {
            address: 'Kalisz, Poland',
            cords: {
               latitude: 51.6828,
               longitude: 18.1814
            }
         },
         locFactory = locationFactory.bind(null, validLocation),
         locationWithoutCords = locFactory({ cords: undefined }),
         locationWithoutLatitude = locFactory({ cords: { longitude: 18.1814 }}),
         locationWithoutLongitude = locFactory({ cords: { latitude: 51.6828 }}),
         locationWithoutAddress = locFactory({ address: undefined }),
         locationWithEmptyAddress = locFactory({ address: ' '}),
         badLocationsArr = [
            locationWithoutCords,
            locationWithoutLatitude,
            locationWithoutLongitude,
            locationWithoutAddress,
            locationWithEmptyAddress
         ],
         promisesArr = [],
         validationRegexp = /Location validation failed/;
         _.each(badLocationsArr, function(val) {
            promisesArr.push(Location.create(val));
         });
         return expect(bluebird.any(promisesArr)).to.be.eventually.rejected
         .then(function(resultObject) {
            resultObject.forEach(function(val) {
               expect(val.message.match(validationRegexp)).to.be.ok;
            });
         });
      });
   });
});
