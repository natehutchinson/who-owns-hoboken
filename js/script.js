mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nIiwiYSI6IjAyYzIwYTJjYTVhMzUxZTVkMzdmYTQ2YzBmMTM0ZDAyIn0.owNd_Qa7Sw2neNJbK6zc1A';

// set boundaries so user cannot pan away from Hoboken
const bounds = [
    [-74.06, 40.72831], // Southwest coordinates
    [-74.00955, 40.76555] // Northeast coordinates
];

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.03083, 40.74675],
    zoom: 13.69,
    minZoom: 13.69, // prevent user from zooming out too far
    maxBounds: bounds
});

map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);

map.addControl(new mapboxgl.NavigationControl());


map.on('load', function () {
    // add data sources    
    map.addSource('hoboken-boundaries', {
        type: 'geojson',
        data: './data/hoboken-boundaries.geojson'
    })



    // add Hoboken border
    map.addLayer({
        id: 'hoboken-border',
        type: 'line',
        source: 'hoboken-boundaries',
        paint: {
            'line-color': '#56566b',
            'line-width': 3

        }
        


    })
})