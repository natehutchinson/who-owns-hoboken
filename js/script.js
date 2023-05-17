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
// define variable for highlighting landlords
let clickedLandlord = null;

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
    console.log(clickedLandlord);
    //// add data sources  
    // shade Hoboken polygon
    map.addSource('shade-hoboken', {
        type: 'geojson',
        data: './data/shade-hoboken.geojson'
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

    // shade out everything that is not Hoboken
    map.addLayer({
        id: 'shade-hoboken',
        type: 'fill',
        source: 'shade-hoboken',
        paint: {
            'fill-color': '#353540',
            'fill-opacity': 0.75
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

    //// define function to highlight all properties with same landlord on click
    const handleClick = (e) => {
        // if clicked landlord is not already highlighted, highlight all their properties
        if (clickedLandlord !== e.features[0].properties.company) {
            clickedLandlord = e.features[0].properties.company;
            // change all apartments not related to that landlord to gray
            map.setPaintProperty('apartment-points', 'circle-color',
                [
                    'case',
                    ['==', ['get', 'company'], clickedLandlord],
                    '#1b5bc2',
                    'gray'
                ]);
            // change all apartments not related to that landlord to be more transparent
            map.setPaintProperty('apartment-points', 'circle-opacity',
                [
                    'case',
                    ['==', ['get', 'company'], clickedLandlord],
                    .75,
                    .25
                ]);
            // change all condos not related to that landlord to gray
            map.setPaintProperty('condo-points', 'circle-color',
                [
                    'case',
                    ['==', ['get', 'company'], clickedLandlord],
                    '#cc7c14',
                    'gray'
                ]);
            // change all condos not related to that landlord to be more transparent
            map.setPaintProperty('condo-points', 'circle-opacity',
                [
                    'case',
                    ['==', ['get', 'company'], clickedLandlord],
                    .75,
                    .25
                ]);
        // if clicked landlord is already highlighted, restore defaults
        } else if (clickedLandlord = e.features[0].properties.company) {
            map.setPaintProperty('apartment-points', 'circle-color', '#1b5bc2');
            map.setPaintProperty('apartment-points', 'circle-opacity', .75);
            map.setPaintProperty('condo-points', 'circle-color', '#cc7c14');
            map.setPaintProperty('condo-points', 'circle-opacity', .75);
            clickedLandlord = null;
        }
        console.log(clickedLandlord);
    }

    // call function for both apartments and condos
    map.on('click', 'apartment-points', handleClick)
    map.on('click', 'condo-points', handleClick)


// add popups with additional info for each apartment

// Create a popup, but don't add it to the map yet
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

// Populate the popup and set its coordinates on hover- apartments
map.on('mouseenter', 'apartment-points', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    popup
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

// Make popup disappear when mouse leaves
map.on('mouseleave', 'apartment-points', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
});

// Populate the popup and set its coordinates on hover- condos
map.on('mouseenter', 'condo-points', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    popup
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

// Make popup disappear when mouse leaves
map.on('mouseleave', 'condo-points', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
});

    // map.on('click', 'apartment-points', (e) => {
    //     if (e.features.length > 0) {
    //     if (hoveredStateId !== null) {
    //     map.setFeatureState(
    //     { source: 'states', id: hoveredStateId },
    //     { hover: false }
    //     );
    //     }
    //     hoveredStateId = e.features[0].id;
    //     map.setFeatureState(
    //     { source: 'states', id: hoveredStateId },
    //     { hover: true }
    //     );
    //     }
    //     });


})

