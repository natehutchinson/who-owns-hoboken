//// import landlords data
import landlords from './data/landlords.geojson' assert { type: 'json' };
console.log(landlords);

//// Initialize sidebar content
/// I do this using JS because clicking stuff changes the sidebar text, and this way I only 
/// need to write out the html that initially populates the sidebar once, which makes it easier to make changes

// store default sidebar text as a variable
var sidebarCode = '<p>Click on your building to see who owns it, and what else they own.</p>' +
    '<p>If you notice any inaccurate information or would like some help organizing your building, ' +
    '<a href="mailto:who.owns.hoboken@gmail.com">email us!</a>' +
    '</p>'

// add text to sidebar
$('#sidebar').html(sidebarCode)

// initialize basemap
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

// define variable for highlighting landlords
let clickedLandlord = null;

// load map
map.on('load', function () {
    //console.log(clickedLandlord);
    //// add data sources  
    // add polygon to shade everything but Hoboken
    map.addSource('shade-hoboken', {
        type: 'geojson',
        data: './data/shade-hoboken.geojson'
    })
    // add condo data
    map.addSource('condos', {
        type: 'geojson',
        data: './data/condos.geojson'
    })
    // add apartment data
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

    //// define a function to make changes when user clicks on a property
    /// function highlights all properties with same landlord as clicked property
    /// also populates the sidebar with info about clicked property and selected landlord's portfolio
    const handleClick = (e) => {
        // if clicked landlord is not already highlighted, highlight all their properties
        if (clickedLandlord !== e.features[0].properties.company) {
            clickedLandlord = e.features[0].properties.company;
            console.log(clickedLandlord);
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
            //// populate sidebar
            // If the  building has a name, use that as header, otherwise use address
            if (e.features[0].properties.building_name) {
                $('#sidebar').html(`
                <div>
                <h2><b>${e.features[0].properties.building_name}</b></h2>
                <p>${e.features[0].properties.property_location}</p>
                </div>`)
            } else {
                $('#sidebar').html(`
                <div>
                <h2><b>${e.features[0].properties.property_location}</b></h2>
                </div>
                `)
            }
            // add additional details about the property to the sidebar
            $('#sidebar').append(`
            <div>
            <p>This property is owned by <b>${e.features[0].properties.company}</b>, whose business
            address is ${e.features[0].properties.owners_mailing_address}, 
            ${e.features[0].properties.city_state_zip} </p>
            </div>
            `)
            // vary text depending on rent control status of property
            if (e.features[0].properties.rent_control === "YES") {
                $('#sidebar').append(`
                <div>
                <p>This property is rent controlled.</p>
                </div>
                `)
            } else {
                $('#sidebar').append(`
                <div>
                <p>This property's rent control status is unconfirmed, though it is eligible for 
                a rent control exemption. If you would like help determining whether the landlord
                ever filed an exemption, <a href="mailto:who.owns.hoboken@gmail.com">email us!</a>
                If it is in fact exempt from rent control, it will be subject to rent control 30 years
                after the date of its construction, which will be in
                ${e.features[0].properties.rent_control_year}.</p>
                </div>
                `)
            }
            $('#sidebar').append(`
            <div>
            <p>This property has ${e.features[0].properties.units2} units. The landlord owns a total
            of ${e.features[0].properties.total_units} in Hoboken.</p>
            </div>
            `)
            //// add table for all of landlord's properties
            $('#sidebar').append(`
            <div>
            <p><b>${e.features[0].properties.company}</b> owns the following buildings in Hoboken: </p>
            </div>
            `)
            /// create blank table
            $('#sidebar').append(`
            <table>
                <th>Address</th>
                <th>Name</th>
                <th># Units</th>
                <th>Rent controlled?</th>
                <th>Year Built</th>
            </table>
            `)
            /// store results for just the clicked landlord
            const filteredResults = landlords.features.filter((feature) => {
                return feature.properties.company === clickedLandlord
            })
            //console.log(filteredResults)
            /// populate table with results for clicked landlord
            filteredResults.forEach((feature) => {
                $('#sidebar tbody').append(`<tr class="child">
                    <td>${feature.properties.property_location}</td>
                    <td>${feature.properties.building_name}</td>
                    <td>${feature.properties.units2}</td>
                    <td>${feature.properties.rent_control}</td>
                    <td>${feature.properties.yr_built}</td>
                    </tr>`)
            })
        // if user clicks a property that is already highlighted, restore defaults
        } else if (clickedLandlord = e.features[0].properties.company) {
            map.setPaintProperty('apartment-points', 'circle-color', '#1b5bc2');
            map.setPaintProperty('apartment-points', 'circle-opacity', .75);
            map.setPaintProperty('condo-points', 'circle-color', '#cc7c14');
            map.setPaintProperty('condo-points', 'circle-opacity', .75);
            // revert to default sidebar content
            $('#sidebar').html(sidebarCode)
            clickedLandlord = null;
        }
        //console.log(e.features[0].properties.building_name);
        //console.log(e.features[0].properties.property_location);
    }

    // call function for both apartments and condos
    map.on('click', 'apartment-points', handleClick)
    map.on('click', 'condo-points', handleClick)


    //// add popups with additional info on hover for each apartment

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
})