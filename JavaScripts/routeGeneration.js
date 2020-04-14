var map;

// Greg's key for google maps api
var greg_key = 'AIzaSyCRNEvG_-m566HAKsTaGxkDagaa1sc8Hg8';

// This key can only be used on the JSFiddle link I found, and is only for testing the maps API there
// Use this key and that link to do any API testing that will involve multiple API calls
// Link: https://jsfiddle.net/fnapur0z/
// You will have to replace the code from here to the JSFiddle code, and use this key
var test_key = 'AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk';

// Replace string below with one of the above keys to activate maps api
var api_key = '';

document.addEventListener('DOMContentLoaded', load_APIs);

// Load any Google API's here so that we can easily change the key being used, or remove the key for testing.
// This makes it easier than having to change the key in every script tag in the html file
// Add libraries to the src URL using the same format as with 'places'
function load_APIs(){
    var maps_api_js = document.createElement('script');
    maps_api_js.type = 'text/javascript';
    maps_api_js.src = 'https://maps.googleapis.com/maps/api/js?key=' + api_key + '&callback=initMap&libraries=places';

    document.getElementsByTagName('body')[0].appendChild(maps_api_js);
}

// Function to initialize location inputs with Autocomplete
// Allows user to start typing location and google will autocomplete for them
function init_autocomplete_inputs(){
    var start_input = document.getElementById('start');
    var waypoint_input = document.getElementById('waypoint');
    var end_input = document.getElementById('end');

    var start_autocomplete = new google.maps.places.Autocomplete(start_input);
    var waypoint_autocomplete = new google.maps.places.Autocomplete(waypoint_input);
    var end_autocomplete = new google.maps.places.Autocomplete(end_input);
}

function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsRenderer = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4.3,
        center: {lat: 39.85, lng: -94.65},
        gestureHandling: 'cooperative'
    });
    directionsRenderer.setMap(map);

    document.getElementById('submit').addEventListener('click', function() {
        calculateAndDisplayRoute(directionsService, directionsRenderer);
        //update_route_option(document.getElementById('route-container'));
    });

    // After initializing tthe map, initialize autocomplete for the inputs
    init_autocomplete_inputs();
    //add_marker(-25.363, 131.044, map);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    var waypts = [];

    waypts.push({
        location: document.getElementById('waypoint').value,
        stopover: true
    });
    /*var checkboxArray = document.getElementById('waypoints');
    for (var i = 0; i < checkboxArray.length; i++) {
        if (checkboxArray.options[i].selected) {
            waypts.push({
                location: checkboxArray[i].value,
                stopover: true
            });
        }
    } */
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            var route = response.routes[0];
            var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;
                summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                    '</b><br>';
                summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
                summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
                summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';

            }

						var pathArr = route.overview_path;

            mark_path(pathArr);

            // Show individual steps of the route for testing
            //show_steps(response);

        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function add_marker(latLng){
		var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: 'Hello World!'
    });
}

function show_steps(directionResult){
		var myRoute = directionResult.routes[0].legs[0];

    for(var i=0; i<myRoute.steps.length; i++){
    		add_marker(myRoute.steps[i].start_point);
    }
}

function mark_path(pathArr){
		for(var i = 0; i < pathArr.length; i++){
    		if(i%10 == 0){
        		add_marker(pathArr[i]);
        }
    }
}
