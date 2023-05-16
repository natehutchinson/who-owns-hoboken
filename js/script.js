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

// add search bar for user to find their address
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);
// add navigation control
map.addControl(new mapboxgl.NavigationControl());


map.on('load', function () {
    //// add data sources  
    // Hoboken polygon  
    map.addSource('hoboken-boundaries', {
        type: 'geojson',
        data: './data/hoboken-boundaries.geojson'
    })
    // condo data
    map.addSource('condos', {
        type: 'geojson',
        data: './data/condos.geojson'
    })
    // apartment data
    map.addSource('apartments', {
        type: 'geojson',
        data: './data/apts.geojson'
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

    // add points for apartments
    map.addLayer({
        id: 'apartment-points',
        type: 'circle',
        source: 'apartments',
        paint: {
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [13.69, 1.5],
                    [14, 1.75],
                    [14.5, 2.5],
                    [15, 4]
                ]
            },
            'circle-opacity': .75,
            'circle-color': '#1b5bc2'
        }
    })

    // add points for condos
    map.addLayer({
        id: 'condo-points',
        type: 'circle',
        source: 'condos',
        paint: {
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [13.69, 1.5],
                    [14, 1.75],
                    [14.5, 2.5],
                    [15, 4]
                ]
            },
            'circle-opacity': .75,
            'circle-color': '#cc7c14'
        }
    })

    // add popups with additional info for each apartment
    map.on('mouseenter', 'apartment-points', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <table class="key-value-table">
                <tr>
                <td class="key">Address:</td>
                <td class="value">${e.features[0].properties.clean_address}</td>
                </tr>
                <tr>
                <td class="key">Landlord:</td>
                <td class="value">${e.features[0].properties.company}</td>
                </tr>
                <tr>
                <td class="key">Rent controlled?:</td>
                <td class="value">${e.features[0].properties.rent_control}</td>
                </tr>
                </table>
            `
            )
            .addTo(map);
    });

    map.on('mouseleave', 'apartment-points', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    // add popups with additional info for each apartment
    map.on('mouseenter', 'condo-points', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <table class="key-value-table">
                <tr>
                <td class="key">Address:</td>
                <td class="value">${e.features[0].properties.clean_address}</td>
                </tr>
                <tr>
                <td class="key">Rent controlled?:</td>
                <td class="value">${e.features[0].properties.rent_control}</td>
                </tr>
                </table>
            `
            )
            .addTo(map);
    });

    map.on('mouseleave', 'condo-points', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
})

