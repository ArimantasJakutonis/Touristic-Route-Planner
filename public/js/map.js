mapboxgl.accessToken = 'pk.eyJ1IjoiYXhqOTQ2IiwiYSI6ImNrZDQ4YmU4OTFvN2Eyem83b3M2eTU5YmsifQ.KfscMAZV3uqS92gwchyhYg';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11',
});

// Load index page map
function loadMap(routes) {
  map.on('load', function() {
    map.addLayer({
      id: 'points',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: routes
        }
      },
      layout: {
        'icon-image': '{icon}-1',
        'icon-size': 1.5,
        'text-field': '{startAddress}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 0.9],
        'text-anchor': 'top'
      }
    });
  });
}

