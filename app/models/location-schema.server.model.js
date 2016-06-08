'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var locationSchema = new Schema({
   cords: {
      latitude: {
         type: Number,
         required: true
      },
      longitude: {
         type: Number,
         required: true
      }
   },
   address: {
      type: String,
      required: true,
      trim: true
   }
});

mongoose.model('Location', locationSchema);