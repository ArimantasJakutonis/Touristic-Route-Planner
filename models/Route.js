const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');


// Touristic route model schema
const RouteSchema = new mongoose.Schema({
      destinationAddress: {
        type: String,
        required: [true, 'Please add a start address'],
      },
      startAddress: {
        type: String,
        required: [true, 'Please add an address']
      },
      location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String
      },
      startLocation: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
});

// Use geocoder to create coordinates for route

RouteSchema.pre('validate', async function(next) {
  const startLoc = await geocoder.geocode(this.startAddress);
  this.startLocation = {
    type: 'Point',
    coordinates: [startLoc[0].longitude, startLoc[0].latitude],
    formattedAddress: startLoc[0].formattedAddress
  }

  const loc = await geocoder.geocode(this.destinationAddress);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress
  }
  next();
});

module.exports = mongoose.model('Route', RouteSchema);
