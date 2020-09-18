const token = mapboxgl.accessToken = 'pk.eyJ1IjoiYXJpbWFudGFzIiwiYSI6ImNrZHlwZ3ZiODFtd3YydXNnamR5N3EwOXAifQ.radY3kY4b51TeLkcLMrFbw';
const coordinates = localStorage.getItem('coordinates').slice(0, -1);
const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?&geometries=geojson&access_token=${token}`;

// Initialize map object
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-1.607978, 53.212166],
    zoom: 7
});


// Function to draw the route after route has been submitted
function drawRoute(coords){
    map.on('load', function() {
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coords
                }
            }
        });
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#888',
                'line-width': 8
            }
        });
    });
}

// Fetch data from url to get coordinates for the route
function getData(url) {
    return fetch(url)
        .then(response => response.json())
        .then(result => result);
}

getData(url)
    .then(result => drawRoute(result.routes[0].geometry.coordinates));



