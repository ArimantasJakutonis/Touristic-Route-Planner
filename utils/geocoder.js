const NodeGeocoder = require('node-geocoder');

// Mapquest provides geocoding service to transfer the location into coordinatesgit
const options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: 'NeBeo0DZ5mu201WLq3bb1vK7opG6iUMj',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
