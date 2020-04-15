var map;
var infowindow;

// Greg's key for google maps api
var greg_key = 'AIzaSyCRNEvG_-m566HAKsTaGxkDagaa1sc8Hg8';

// This key can only be used on the JSFiddle link I found, and is only for testing the maps API there
// Use this key and that link to do any API testing that will involve multiple API calls
// Link: https://jsfiddle.net/fnapur0z/
// You will have to replace the code from here to the JSFiddle code, and use this key
var test_key = 'AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk';

var liam_key ='AIzaSyBrmHbAT4UIqlTH8PaKkbyVpKoSnsoPS4c'

// Replace string below with one of the above keys to activate maps api
var api_key = '';

document.addEventListener('DOMContentLoaded', load_APIs);

// Load any Google API's here so that we can easily change the key being used, or remove the key for testing.
// This makes it easier than having to change the key in every script tag in the html file
// Add libraries to the src URL using the same format as with 'places'
function load_APIs(){
    var maps_api_js = document.createElement('script');
    maps_api_js.type = 'text/javascript';
    maps_api_js.src = 'https://maps.googleapis.com/maps/api/js?key=' + api_key + '&callback=initMap&libraries=places,geometry';

    document.getElementsByTagName('body')[0].appendChild(maps_api_js);
}

// Function to initialize location inputs with Autocomplete
// Allows user to start typing location and google will autocomplete for them
function init_autocomplete_inputs(){
    var start_input = document.getElementById('start');
    var waypoint_input = document.getElementById('waypoint');
    var end_input = document.getElementById('end');
    var home_page_term;
    if(home_page_term = document.getElementById('saveTerm')){
        var home_page_autocomplete = new google.maps.places.Autocomplete(home_page_term);
    }
    
    var start_autocomplete = new google.maps.places.Autocomplete(start_input);
    var waypoint_autocomplete = new google.maps.places.Autocomplete(waypoint_input);
    var end_autocomplete = new google.maps.places.Autocomplete(end_input);
    
}

function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsRenderer = new google.maps.DirectionsRenderer;
    var geocoder = new google.maps.Geocoder;

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4.3,
        center: {lat: 39.85, lng: -94.65},
        gestureHandling: 'cooperative'
    });
    directionsRenderer.setMap(map);

    // get current location of user
    var pos;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            // geoencode latlng as address
            geocoder.geocode({'location': pos}, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        document.getElementById('start').value = results[0].formatted_address;
                    } else {
                    window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        });
    }
   
    
    //console.log(str);
    

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
			var spacedArr = get_spaced_loc_arr(pathArr, get_total_route_length(pathArr));

			// Don't uncomment this function while using liam or greg key
            // For now only use this function (or most functions) with the test key in JSFiddle
           	//find_hotels_along_route(spacedArr, 1000);
            //mark_path(spacedArr);


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

function add_place_marker(place){
		var marker = new google.maps.Marker({
    		position: place.geometry.location,
        map: map,
        icon: {
            path: 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z',
            scale: 1.5,
            strokeColor: '#393939',
            fillOpacity: 1,
            fillColor: '#00B400',
            strokeWeight: 3
          }
    });

    google.maps.event.addListener(marker, 'click', function(){
    		infowindow.setContent(place.name);
        infowindow.open(map, this);
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
    		//if(i%1 == 0){
        add_marker(pathArr[i]);
        //}
    }
}

// Show all the points on the route
// where we will search nearby hotels/food/etc
// They should be properly spaced out in proportion to the trip length
function add_markers_spaced_out(pathArr, total_distance){
		var sum = 0;
    var retArr = [];
    var dis_meters = Math.log(total_distance);

		for (var i = 0; i < pathArr.length - 1; i++){
    		sum += google.maps.geometry.spherical.computeDistanceBetween(pathArr[i], pathArr[i+1]);
        if(3.1*Math.log10(sum) >= dis_meters){
        		retArr.push(pathArr[i+1]);
            sum = 0;
        }
    }
    mark_path(retArr);
}

function get_total_route_length(pathArr){
		var sum = 0;
    for (var i = 0; i < pathArr.length - 1; i++){
    		sum += google.maps.geometry.spherical.computeDistanceBetween(pathArr[i], pathArr[i+1]);
    }
    return sum;
}

function get_spaced_loc_arr(pathArr, total_distance){
		var sum = 0;
    var retArr = [];
    var dis_meters = Math.log(total_distance);

		for (var i = 0; i < pathArr.length - 1; i++){
    		sum += google.maps.geometry.spherical.computeDistanceBetween(pathArr[i], pathArr[i+1]);
        if(3.1*Math.log10(sum) >= dis_meters){
        		retArr.push(pathArr[i+1]);
            sum = 0;
        }
    }
    return retArr;
}

function callback(results, status){
    for(var i = 0; i < results.length; i++){
        add_place_marker(results[i]);
    }
}

function find_hotels_along_route(spacedArr, radius){
		var requests = [];
    for (var i = 0; i < spacedArr.length; i++){
    		requests[i] = {
       			location: spacedArr[i],
        		radius: radius,
            type: ['lodging']
        };
    }

    var service = new google.maps.places.PlacesService(map);
    for (var i = 0; i < requests.length; i++){
    	service.nearbySearch(requests[i], callback);
    }
}
