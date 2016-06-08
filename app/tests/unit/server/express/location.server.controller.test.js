/*jshint expr: true*/

'use strict';
var chai = require('chai'),
expect = chai.expect,
chaiAsPromised = require('chai-as-promised'),
httpMocks = require('node-mocks-http'),
express = require('express'),
mongoose = require('mongoose'),
_ = require('underscore'),
Promise = require('bluebird');

describe('express', function() {
   var server,
   mongoConfig = {
      server: {
         socketOptions: {
            keepAlive: 3000,
            connectTimeoutMS: 3000
         }
      }
   },
   app,
   APP_PATH = '../../../../',
   db,
   mongodbURI = 'mongodb://localhost/test',
   location,
   Location;
   
   mongoose.Promise = Promise;
   chai.use(chaiAsPromised);

   before(function() {
      app = express();
      server = app.listen(3000);

      db = mongoose.connect(mongodbURI, mongoConfig);
      
      require(APP_PATH + 'models/location-schema.server.model.js');
      location = require(APP_PATH + 'controllers/location.server.controller');
      Location = mongoose.model('Location');

   });

   after(function() {
      server.close();
      mongoose.connection.close();
   });

   afterEach(function(done) {
      Location.remove({})
      .then(function() {
         return Location.find({});
      })
      .then(function(locations) {
         expect(locations.length).to.not.be.ok;
         done();
      })
      .catch(function(err) {
         expect(err).to.not.exist;
         done(err);
      });
   });
 
   describe('location middleware', function() {
      it('should load cords from db', function(done) {
         var sampleLocation = {
            cords: {
               latitude: 14.56,
               longitude: 16.22
            },
            address: "Saczyn, Poland"
         },
         req = httpMocks.createRequest(),
         res = httpMocks.createResponse();

         Location.create(sampleLocation)
         .then(function(res) {
            return Location.findOne({});
         })
         .then(function(doc) {
            expect(doc).to.be.ok;
            expect(doc.address).to.equal('Saczyn, Poland');
            expect(doc.cords.latitude).to.equal(14.56);
            expect(doc.cords.longitude).to.equal(16.22);

            req.body.query = {
               address: "Saczyn, Poland"
            };

            return expect(location.getLocationFromDB(req, res)).to.be.fulfilled;
         })
         .then(function(doc){
            expect(doc.address).to.be.equal(req.body.query.address);
            expect(doc.cords.latitude).to.be.equal(14.56);
            expect(doc.cords.longitude).to.be.equal(16.22);
            done();
         })
         .catch(function(err) {
            done(err);
         });
      }); 

      it('should query google maps', function(done) {
         var req = httpMocks.createRequest(),
         res = httpMocks.createResponse();

         req.body.query = {
            address: "Warsaw, Poland"
         };

         expect(location.getLocationFromGoogleMaps(req, res)).to.be.eventually.fulfilled
         .then(function(result) {
            expect(result.error_message).to.not.exist;
            done();
         })
         .catch(done);
      });

      it('should return req.location if already exists', function(done) {
         var req = httpMocks.createRequest(),
         res = httpMocks.createResponse();

         req.body.query = {
            address: "Kalisz, Poland"
         };
         var loc = {
            address: 'Poznan, Poland',
            cords: {
               latitude: 14.8912,
               longitude: 98.12321
            }
         };
         req.location = _.extend({}, loc);

         return expect(location.getLocationFromGoogleMaps(req, res)).to.be.eventually.fulfilled
         .then(function(response) {
            expect(response).to.be.deep.equal(loc);
            done();
         })
         .catch(done);
      });
   });
});
