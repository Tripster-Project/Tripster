var map;
var infowindow;
var routeContainer;
var hotelResultsArr = [];
var foodResultsArr = [];
var gasResultsArr = [];
var markersArr = [];
var waypts = [];
var spacedArr = [];
var pathArr = [];
var routeLegsArr;
var finalRouteArr = [];  // We will place all hotel/food/gas/etc waypoints in here, and then create a piecewise route using them (25 or 23 waypoints at a time due to waypoint limit)
var finalRouteName = '';
//
var splitRouteArr = [];

// Index arrays for splitting up the route into multiple sections
var wayIndexArr = [];
var spaceIndexArr = [];

var generatedRenderers = [];

var totalNumResults = 0;
var totalRouteLength = 0;
var startMarker;
var endMarker;
var directionsService;
var directionsRenderer;
var processingDelay = 0; // The time in milliseconds to delay the code while the route generation works and finds hotels/gas/food/etc
// This delay should be increased accordingly every time a setTimeout is added

// Greg's key for google maps api
var greg_key = 'AIzaSyCRNEvG_-m566HAKsTaGxkDagaa1sc8Hg8';

// This key can only be used on the JSFiddle link I found, and is only for testing the maps API there
// Use this key and that link to do any API testing that will involve multiple API calls
// Link: https://jsfiddle.net/fnapur0z/
// You will have to replace the code from here to the JSFiddle code, and use this key
var test_key = 'AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk';

var liam_key ='AIzaSyBrmHbAT4UIqlTH8PaKkbyVpKoSnsoPS4c';

// Replace string below with one of the above keys to activate maps api
var api_key = '';

document.addEventListener('DOMContentLoaded', load_APIs);

// Load any Google API's here so that we can easily change the key being used, or remove the key for testing.
// This makes it easier than having to change the key in every script tag in the html file
// Add libraries to the src URL using the same format as with 'places'
function load_APIs(){
    var maps_api_js = document.createElement('script');
    maps_api_js.type = 'text/javascript';
    maps_api_js.src = 'https://maps.googleapis.com/maps/api/js?key=' + liam_key + '&callback=initMap&libraries=places,geometry';

    document.getElementsByTagName('body')[0].appendChild(maps_api_js);
}

// Function to initialize location inputs with Autocomplete
// Allows user to start typing location and google will autocomplete for them
function init_autocomplete_inputs(){
    var start_input = document.getElementById('start');

    var end_input = document.getElementById('end');
    var home_page_term;
    if(home_page_term = document.getElementById('saveTerm')){
        var home_page_autocomplete = new google.maps.places.Autocomplete(home_page_term);
    }
    var waypoint_input = document.getElementById('waypointslist');
    waypoint_input = waypoint_input.getElementsByTagName('input');
    var start_autocomplete = new google.maps.places.Autocomplete(start_input);
    for(x in waypoint_input){
      var waypoint_autocomplete = new google.maps.places.Autocomplete(waypoint_input[x]);
    }
    
    var end_autocomplete = new google.maps.places.Autocomplete(end_input);

}

function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsRenderer = new google.maps.DirectionsRenderer;
    var geocoder = new google.maps.Geocoder;

    infowindow = new google.maps.InfoWindow;

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

    document.getElementById('submit').addEventListener('click', function() {
    		waypts = [];
        show_loading_message();
        setTimeout(function(){
        		calculateAndDisplayRoute(directionsService, directionsRenderer);
        }, 1000);

        //update_route_option(document.getElementById('route-container'));
    });

    // After initializing tthe map, initialize autocomplete for the inputs
    init_autocomplete_inputs();
    //add_marker(-25.363, 131.044, map);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    var temp = document.getElementById('waypointslist');
    temp = temp.getElementsByTagName('input');
    var x = temp.length;
    for(var i=0; i<x; i++){
      if(temp[i].value != ''){
        waypts.push({
          location: temp[i].value,
          stopover: true
        });
      }
    }

    directionsRenderer.setMap(null);
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: 'DRIVING',
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

						pathArr = route.overview_path;
            // Get array containing each leg of the route, which will have the latlngs of  the waypoints
            routeLegsArr = route.legs;
            startMarker = new google.maps.Marker({
        				position: pathArr[0],
        				map: map,
        				title: 'Starting Location'
    				});
            endMarker = new google.maps.Marker({
        				position: pathArr[pathArr.length - 1],
        				map: map,
        				title: 'Destination'
    				});

      			totalNumResults = 0;
      			hotelResultsArr = [];
            foodResultsArr = [];
            gasResultsArr = [];
            //finalRouteArr = [];
            wayIndexArr = [];
            spaceIndexArr = [];
            processingDelay = 0;
						totalRouteLength = get_total_route_length(pathArr);
      			spacedArr = get_spaced_loc_arr(pathArr, totalRouteLength);
            create_index_arrays();

            clear_previous_route();

            // If previously added hotel/food/gas markers, remove them before adding new ones
            if(markersArr.length != 0){clearMarkersAndResults();}

						find_hotels_along_route(spacedArr, totalRouteLength, find_gas_along_route);
            // Everything done after this point should be within this timeout, since searching for the hotels and everything added a certain amount of delay
						setTimeout(function(){
            		generate_created_route();
            }, processingDelay + 3000);

            console.log('Processing Delay: ' + processingDelay.toString());
            tripOptions.updateRoute();
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
    finalRouteName = document.getElementById('start').value + " -> " + document.getElementById('end').value;
    //console.log(directionsRenderer);
    
    //directionsRenderer.setMap(null);
    //directionsService.route = [];
}

/*
function regenerate_route_with_added_waypoints(directionsService, directionsRenderer){
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

        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
*/

function generate_created_route(){
		//console.log('Found ' + foodResultsArr.length.toString() + ' Restaurants');
    console.log('Number of Pings: ' + spacedArr.length.toString());
    //console.log('Total Results From All N-Searches: ' + totalNumResults.toString());
    //console.log('Number of Waypoints: ' + waypts.length.toString());

    generate_final_route_arr();

    directionsRenderer.setDirections({routes: []});
    directionsRenderer.setMap(null);

    split_final_route_arr();

    add_waypoint_markers();
		// Add starting location markers
    // Later on i may also add waypoint markers here but i may do that when adding the waypoints to the route
    markersArr.push(startMarker);
    markersArr.push(endMarker);
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(startMarker.position);
    bounds.extend(endMarker.position);
    map.fitBounds(bounds);
    google.maps.event.addListener(startMarker, 'click', function(){
   			infowindow.setContent('Starting Point');
        infowindow.open(map, startMarker);
    });
    google.maps.event.addListener(endMarker, 'click', function(){
    		infowindow.setContent('Destination');
        infowindow.open(map, endMarker);
    });
    directionsRenderer.setMap(null);
    directionsRenderer.setOptions({
    		suppressMarkers: true
    });


		remove_loading_message();
    //directionsRenderer.setMap(map);
}

function clear_previous_route(){
		// Clear the previously drawn route
    if(generatedRenderers.length != 0){
    		for(var i = 0; i < generatedRenderers.length; i++){
    				generatedRenderers[i].setDirections({routes: []});
            //generatedRenderers[i] = null;
    		}
        generatedRenderers = [];
    }
}

function split_final_route_arr(){
		var parts = [];
    var finalRouteLatLngArr = [];
    var n = 0;
    var maxWay;

    for(var i = 1; i < finalRouteArr.length; i++){
    		if('latlng' in finalRouteArr[i]){
        		finalRouteLatLngArr.push(finalRouteArr[i].latlng);
        		//console.log('WAYPOINT: ' + finalRouteArr[i].name.toString());
            //console.log(finalRouteArr[i].latlng);
        }
        else{
        		finalRouteLatLngArr.push(finalRouteArr[i].geometry.location);
        		//console.log(finalRouteArr[i].name);
        }
    }

    for(var i = 0, parts = [], maxWay = 25-1; i < finalRouteLatLngArr.length; i+= maxWay){
    		parts.push(finalRouteLatLngArr.slice(i, i + maxWay + 1));
    }

		/*
    for(var i = 0; i < parts.length; i++){
    		console.log('Part #' + (i+1).toString() + ': ');
        console.log(parts[i]);
    }
    */

		for(var i = 0; i < parts.length; i++){
    		var waypoints = [];
        for(var j = 1; j < parts[i].length - 1; j++){
        		waypoints.push({location: parts[i][j], stopover: false});
        }

        var service_options = {
        		origin: parts[i][0],
            destination: parts[i][parts[i].length - 1],
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: 'DRIVING'
        };

        //console.log('got here first');
        //console.log(service_options);
        directionsService.route(service_options, split_callback);
    }
}

function split_callback(response, status){
		if(status != 'OK'){
   		  console.log('Directions Request Failed Due to: ' + status);
        console.log(response)
        return;
    }

    //console.log('I get here');
    var renderer = new google.maps.DirectionsRenderer;
    renderer.setMap(map);
    renderer.setOptions({suppressMarkers: true, preserveViewport: true});
    renderer.setDirections(response);

    generatedRenderers.push(renderer);
}

function add_waypoint_markers(){
		for(var i = 0; i < wayIndexArr.length; i++){
    		var latlng = pathArr[wayIndexArr[i]];
        var title = waypts[i].location;
    		var marker = new google.maps.Marker({
        		position: latlng,
        		map: map,
        		title: title
    		});

        markersArr.push(marker);
    }
}

function create_index_arrays(){
		var error_val;

    // This is somewhat of a bandaid fix for the error value
    // Seems to be working for most cases, small, medium, and large so far
    if(totalRouteLength <= 100000){
    		error_val = 0.001;
    }else if(totalRouteLength <= 300000){
    		error_val = 0.01;
    }else if(totalRouteLength <= 600000){
    		error_val = 0.05;
    }else{
    		error_val = 0.1;
    }

		// Add indexes of all the waypoints in the pathArr
		for(var i = 1; i < routeLegsArr.length; i++){
    		// using variables here is mostly for readability
    		var legLat = routeLegsArr[i].start_location.lat();
        var legLng = routeLegsArr[i].start_location.lng();
        var s = true;

    		for(var j = 0; j < pathArr.length; j++){
        		// using variables here is mostly for readability
        		var pathLat = pathArr[j].lat();
            var pathLng = pathArr[j].lng();

            if(Math.abs(legLat - pathLat) <= error_val && Math.abs(legLng - pathLng) <= error_val && s){
            		wayIndexArr.push(j);
      					s = false;
                console.log('MATCH at Index: ' + j.toString() + ' of ' + (pathArr.length-1).toString());
            }else{console.log('No Match');}
        }
    }
}

function add_marker(latLng){
		var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: 'Hello World!'
    });

    markersArr.push(marker);
}

function add_hotel_marker(place){
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

		markersArr.push(marker);
    google.maps.event.addListener(marker, 'click', function(){
    		infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

function add_gas_marker(place){
		var marker = new google.maps.Marker({
    		position: place.geometry.location,
        map: map,
        icon: {
        		anchor: new google.maps.Point(250, 0),
            path: 'M352.427,90.24l0.32-0.32L273.28,10.667L250.667,33.28l45.013,45.013c-20.053,7.68-34.347,26.987-34.347,49.707c0,29.44,23.893,53.333,53.333,53.333c7.573,0,14.827-1.6,21.333-4.48v153.813C336,342.4,326.4,352,314.667,352c-11.733,0-21.333-9.6-21.333-21.333v-96c0-23.573-19.093-42.667-42.667-42.667h-21.333V42.667C229.333,19.093,210.24,0,186.667,0h-128C35.093,0,16,19.093,16,42.667V384h213.333V224h32v106.667c0,29.44,23.893,53.333,53.333,53.333c29.44,0,53.333-23.893,53.333-53.333V128C368,113.28,362.027,99.947,352.427,90.24z M186.667,149.333h-128V42.667h128V149.333zM314.667,149.333c-11.733,0-21.333-9.6-21.333-21.333s9.6-21.333,21.333-21.333c11.733,0,21.333,9.6,21.333,21.333S326.4,149.333,314.667,149.333z',
            scale: 0.08,
            strokeColor: '#9E3F3F',
            fillOpacity: 1,
            fillColor: '#FB8181',
            strokeWeight: 3
          }
    });

		markersArr.push(marker);
    google.maps.event.addListener(marker, 'click', function(){
    		infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

function add_food_marker(place){
		var marker = new google.maps.Marker({
    		position: place.geometry.location,
        map: map,
        icon: {
        		anchor: new google.maps.Point(250, 500),
            path: 'M256,0C153.58,0,70.256,83.324,70.256,185.743c0,41.017,9.395,83.407,27.924,125.994c14.652,33.678,35.029,67.564,60.563,100.717c43.295,56.214,86.096,90.634,87.896,92.072l9.359,7.472l9.359-7.472c1.8-1.438,44.601-35.858,87.896-92.072c25.533-33.153,45.91-67.039,60.563-100.717c18.529-42.587,27.924-84.978,27.924-125.994C441.742,83.324,358.419,0,256,0z M265.885,157.724v15.001c0,25.553-17.282,47.132-40.767,53.702v111.068h-30.002V226.425c-23.484-6.569-40.766-28.148-40.766-53.702v-15.001v-43.266h30.002v43.266h10.765v-43.266h30.002v43.266h10.766v-43.266h30.001V157.724z M357.648,215.411c0,25.175-16.982,46.445-40.088,52.996v69.087h-30.002V270.5v-27.011V114.47h15.001c30.375,0,55.089,24.713,55.089,55.089V215.411z',
            scale: 0.08,
            strokeColor: '#B77D00',
            fillOpacity: 1,
            fillColor: '#FFC853',
            strokeWeight: 1,

          },
        zIndex: 10
    });

		markersArr.push(marker);
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

    // For now setting minimum distance between points as the approx distance from Boston to New York
    // Figured that distance would be a reasonable distance to drive in a day
    var max_drive_pref = 306000;

    console.log('Approx Total Distance is: ' + total_distance.toString());

    if(total_distance <= 306000){
    		// If it is a fairly small road trip we only need a couple stops
        for(var i = 0; i < pathArr.length - 1; i++){
        		sum += google.maps.geometry.spherical.computeDistanceBetween(pathArr[i], pathArr[i+1]);
						if(sum >= total_distance/2){
            		retArr.push(pathArr[i]);
                spaceIndexArr.push(i);
                sum = 0;
            }
        }
    }else if(total_distance <= (2*306000)){
    		// If the trip is a bit longer, add another stop
    		for(var i = 0; i < pathArr.length - 1; i++){
        		sum += google.maps.geometry.spherical.computeDistanceBetween(pathArr[i], pathArr[i+1]);
						if(sum >= total_distance/3){
            		retArr.push(pathArr[i]);
                spaceIndexArr.push(i);
                sum = 0;
            }
        }
    }else{
    		// If route is any longer, just add stops within the range of max preferred driving distance
    		for(var i = 0; i < pathArr.length - 1; i++){
        		sum += google.maps.geometry.spherical.computeDistanceBetween(pathArr[i], pathArr[i+1]);
            if(sum > max_drive_pref){
            		retArr.push(pathArr[i+1]);
                spaceIndexArr.push(i+1);
                sum = 0;
            }
        }
    }

    return retArr;
}

function sort_by_distance(currLoc, results){
		var distances = [];
    for(var i = 0; i < results.length; i++){
    		var dist = google.maps.geometry.spherical.computeDistanceBetween(currLoc, results[i].geometry.location);
        distances.push({
        		dist: dist,
            result: results[i]
        });
    }

    distances.sort(function(a, b){
				return ((a.dist)-(b.dist));
		});

    return distances[0].result;
}

function hotels_callback(results, status, currLoc){
		// for now we are just taking the first result for each route nearbySearch ping
    // Otherwise we would get wayyy too many results to have to sort through
    if (status == google.maps.places.PlacesServiceStatus.OK) {
				var result = sort_by_distance(currLoc, results);
    		add_hotel_marker(result);
    		hotelResultsArr.push(result);
    		//totalNumResults += results.length;

    }else{
    		console.log('Nearby Search Failed');
        console.log(status);
        // push a zero if there were no results from this nearbySearch
        // This will make the final route construction easier
        hotelResultsArr.push(0);
    }
}

function food_callback(results, status, currLoc){
		// for now we are just taking the second result for each route nearbySearch ping
    // Otherwise we would get wayyy too many results to have to sort through
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    		var result = sort_by_distance(currLoc, results);
    		add_food_marker(result);
   		  foodResultsArr.push(result);
    		//totalNumResults += results.length;
    }else{
    		console.log('Nearby Search Failed');
        console.log(status);

        // push a zero if there were no results from this nearbySearch
        // This will make the final route construction easier
        foodResultsArr.push(0);
    }
}

function gas_callback(results, status, currLoc){
		if (status == google.maps.places.PlacesServiceStatus.OK) {
    		var result = sort_by_distance(currLoc, results);
    		add_gas_marker(result);
    		gasResultsArr.push(result);
    		//totalNumResults += results.length;
    }else{
    		console.log('Nearby Search Failed');
        console.log(status);

        // push a zero if there were no results from this nearbySearch
        // This will make the final route construction easier
        gasResultsArr.push(0);
    }
}

function do_nearbySearch_hotels(requests, i){
		var pings = spacedArr.length;
    var delay = Math.max(1500, pings*100+100);

		setTimeout(function(){
    		if(!(i%3)){
    				var service = new google.maps.places.PlacesService(map);
    				service.nearbySearch(requests[i], function(results, status){
        				hotels_callback(results, status, spacedArr[i]);
        		});
        }
    }, delay*i);
}

function do_nearbySearch_gas(requests, i){
		var pings = spacedArr.length;
    var delay = Math.max(1500, pings*100+100);

		setTimeout(function(){
    		var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(requests[i], function(results, status){
        		gas_callback(results, status, spacedArr[i]);
        });
    }, delay*i);
}

function do_nearbySearch_food(requests, i){
		var pings = spacedArr.length;
    var delay = Math.max(1500, pings*100+100);

		setTimeout(function(){
    		var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(requests[i], function(results, status){
        		food_callback(results, status, spacedArr[i]);
        });
    }, delay*i);
}

function find_hotels_along_route(spacedArr, totalRouteLength, callback){
		var pings = spacedArr.length;
    var delay = Math.max(1500, pings*100+100);
   	var radius;

    radius = Math.max(15000, 2.2*((totalRouteLength / 5000)*Math.log(totalRouteLength / 600*Math.log(totalRouteLength))));

		var requests = [];
    for (var i = 0; i < spacedArr.length; i++){

    		requests[i] = {
       			location: spacedArr[i],
        		radius: 20000,
            type: ['lodging']

        }
    }

    for (var i = 0; i < requests.length; i++){
    		do_nearbySearch_hotels(requests, i);
    }

    var last_req = {
    		location: pathArr[pathArr.length - 1],
        radius: 20000,
        type: ['lodging']
    };

   	setTimeout(function(){
   		var service = new google.maps.places.PlacesService(map);
    	service.nearbySearch(last_req, function(results, status){
      		hotels_callback(results, status, pathArr[pathArr.length - 1]);
      });
   	}, ((spacedArr.length)*delay));

    processingDelay += ((spacedArr.length)*delay);

    callback(spacedArr, totalRouteLength, find_food_along_route);
}

function find_gas_along_route(spacedArr, totalRouteLength, callback){

   	var radius;

    radius = Math.max(15000, 2*((totalRouteLength / 5000)*Math.log(totalRouteLength / 600*Math.log(totalRouteLength))));

    //setTimeout(function(){console.log('Radius Value is: ' + radius.toString())}, 2000);

		var requests = [];
    for (var i = 0; i < spacedArr.length; i++){
    		requests[i] = {
       			location: spacedArr[i],
            type: ['gas_station'],
            radius: 20000
        };
    }

		//get_first_part_gas(requests, get_second_part_gas);
    for (var i = 0; i < requests.length; i++){
    		do_nearbySearch_gas(requests, i);
    }

    callback(spacedArr, totalRouteLength);
}

function find_food_along_route(spacedArr, totalRouteLength){
			var radius;

      radius = Math.max(10000, 2*((totalRouteLength / 5000)*Math.log(totalRouteLength / 600*Math.log(totalRouteLength))));

		//console.log('Radius Value is: ' + radius.toString());

		var requests = [];
    for (var i = 0; i < spacedArr.length; i++){
    		requests[i] = {
       			location: spacedArr[i],
        		radius: 20000,
            type: ['restaurant']
        };
    }

    for (var i = 0; i < requests.length; i++){
    		do_nearbySearch_food(requests, i);
    }

    // Add some buffer time to the processingDelay
    processingDelay += 1500;
}

function generate_final_route_arr(){
// This function should return each of the stops along the way in order
// Waypoints will be the waypoint name and latlng location
// Hotels/Gas/Food will be objects containing all the info

		var h = 0,
    		g = 0,
        f = 0,
        w = 0;
    // Add starting point latlng
    var startPoint = {
    		name: 'Starting Location',
        latlng: pathArr[0]
    }
    finalRouteArr.push(startPoint);

		for(var i = 0; i < spaceIndexArr.length; i++){
    		for(var j = 0; wayIndexArr[j] < spaceIndexArr[i]; j++){
        		//finalRouteArr.push(pathArr[wayIndexArr[j]]);
            var wpObj = {
                isWayPtn: "true",
            		name: waypts[w].location,
                latlng: pathArr[wayIndexArr[j]]
            }

            finalRouteArr.push(wpObj);
            w++;
        		wayIndexArr.shift();
    		}

        // Add hotels at appropriate intervals
        if(!(i%3)){
        		if(hotelResultsArr[h] != 0){
        				finalRouteArr.push(hotelResultsArr[h]);
                h++;
            }else{
            		h++;
            }
        }

        if(gasResultsArr[g] != 0){
        		finalRouteArr.push(gasResultsArr[g]);
            g++;
        }else{
        		g++;
        }

        if(foodResultsArr[f] != 0){
        		finalRouteArr.push(foodResultsArr[f]);
            f++;
        }else{
        		f++;
        }

        // If it is the last ping location along the spaced array
        // Just push the rest of the waypoints
        if(i == spaceIndexArr.length-1){
        		for(var j = 0; j < wayIndexArr.length; j++){
        				//finalRouteArr.push(pathArr[wayIndexArr[j]]);
                var wpObj = {
                    isWayPtn: "true",
            				name: waypts[w].location,
                		latlng: pathArr[wayIndexArr[j]]
           			}

            		finalRouteArr.push(wpObj);
                w++;
        				wayIndexArr.shift();
        		}
        }
    }

		// Add final destination before adding the final hotel to stay at
    var endPoint = {
    		name: 'Destination',
        latlng: pathArr[pathArr.length-1]
    }
		finalRouteArr.push(endPoint);
		// Add final hotel which will be near the detination
    finalRouteArr.push(hotelResultsArr[h]);

    //console.log(finalRouteArr);



    // Print finalRouteArr using this for loop to test if its working
    // finalRouteArr seems to be in the proper order, and working as inteded
    /*
    for(var i  = 0; i < finalRouteArr.length; i++){
				if('latlng' in finalRouteArr[i]){
        		console.log('WAYPOINT: ' + finalRouteArr[i].name.toString());
            console.log(finalRouteArr[i].latlng);
        }
        else{
        		console.log(finalRouteArr[i].name);
        }
    }
    */
}

function clearMarkersAndResults(){
		for (var i = 0; i < markersArr.length; i++ ) {
    		markersArr[i].setMap(null);
  	}
  	markersArr.length = 0;
}

function add_hotels_as_waypoints(){
		for(var i = 0; i < hotelResultsArr.length; i++){
				waypts.push({
       	 	location: hotelResultsArr[i].geometry.location,
        	stopover: true
    		});
    }
}

function add_gas_as_waypoints(){
		for(var i = 0; i < gasResultsArr.length; i++){
				waypts.push({
       	 	location: gasResultsArr[i].geometry.location,
        	stopover: true
    		});
    }
}

function add_food_as_waypoints(){
		for(var i = 0; i < foodResultsArr.length; i++){
				waypts.push({
       	 	location: foodResultsArr[i].geometry.location,
        	stopover: true
    		});
    }
}

function show_loading_message(){
		var loading_cover = document.getElementById('load-cover');
    loading_cover.style.zIndex = 10;
    loading_cover.style.opacity = 1;
}

function remove_loading_message(){
		var loading_cover = document.getElementById('load-cover');
    loading_cover.style.zIndex = -10;
    loading_cover.style.opacity = 0;
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

// Add and remove waypoints to trip.

let addWaypoints = new Vue ({
  el: '#addWaypoints',
  data: {
    inputs: [
      {
        name: '',
      },
      {
        name: '',
      },
      {
        name: '',
      },
      {
        name: '',
      },
    ]
  },
  methods: {
    addWaypoints(name) {
      this.inputs.push({name: '' });
      console.log(this.inputs);
    },
    add(index) {
      this.inputs.push({name: '' });
    },
    remove(index) {
      this.inputs.splice(index, 1);
    }
  },
  updated: function(){
    this. $nextTick(function () {
      console.log("tick");
      var temp = document.getElementById('waypointslist');
      temp = temp.getElementsByTagName('input');
      //console.log(temp.length);
      var index = temp.length-1;
      //console.log(temp);
      //console.log(temp[index]);
      //console.log(temp[index]);
      var tempAutocomplete = new google.maps.places.Autocomplete(temp[index]);
      tempAutocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
    })
  },
  mounted(){

  },

  template: `
    <div id="waypointslist" class="w-100">
      <div class="row badge p-2">
        <h4 class="p-2 text-left">Waypoints:</h4>
        <template v-for="(input, k) in inputs">
          {{ input.name }}
        </template>
      </div>

        <div class="form-group row w-100 mt-1" v-for="(input,k) in inputs" :key="k">
          <div class="parameter align-items-center input-group m-0">
            <input type="textbox" class="form-control col-auto mr-auto" value="">
            <div class="col-auto input-group-append">
              <span>
                <i class="fa fa-minus plus-submit-wypts minus-submit" @click="remove(k)" v-show="k || ( !k && inputs.length > 1)"></i>
                <i class="fa fa-plus plus-submit-wypts" @click="add(k)" v-show="k == inputs.length-1"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

});

let tripOptions = new Vue ({
  el: '#tripOptions',
  data: {
    routes:[],
  },
  methods: {
    updateRoute() {
      this.routes = finalRouteArr;
      console.log(this.routes);
    },
  },
  mounted() {
    this.routes = finalRouteArr;
    //console.log(this.routes);
  },
  template: `
    <div>
      <template v-for="route in routes">
        <template v-if="route.types">
          <div class="row">
            <b>{{ route.name }}: &nbsp;</b>
            <template v-for="type in route.types">
              <template v-if="type != 'point_of_interest'">
                <template v-if="type != 'establishment'">
                  <p style="display:inline-block;">{{ type }}&nbsp;</p>
                </template>
              </template>
            </template>
          </div>
        </template>
      </template>
    </div>
  `
});

function saveTrip() {
  
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user.uid);
      var userID = user.uid;

      var tripName = document.getElementById("myInput2").value;
      //var database = firebase.database();
      var location = {finalRouteName: finalRouteName, finalRouteArr: finalRouteArr, tripName: tripName,};
      var location2 = {finalRouteName: finalRouteName, finalRouteArr: finalRouteArr, tripName: tripName, userID: userID};
      //console.log(location);
      var locstr = JSON.stringify(location);
      var locstr2 = JSON.stringify(location2);
      //console.log(locstr);
      var parstr = JSON.parse(locstr);
      var parstr2 = JSON.parse(locstr2);
      //console.log(parstr);
      firebase.database().ref('users/' + userID + '/trips/' + tripName).set(parstr);
      firebase.database().ref('allTrips/' + tripName).set(parstr2);
    } else {
      window.location= "Login.html";
      console.log('no user signed in');
    }
  });
}

// Autocomplete

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

var userID;
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    userID = user.uid;
    console.log(userID);
    var tripsRef = firebase.database().ref('users/' + userID + '/trips');
    tripsRef.on('value', function(snapshot) {
      updateTrips(snapshot.val());
    });
  }
});

var tripNames = [];
function updateTrips(snapshot){
  console.log(snapshot);
  for( x in snapshot){
    tripNames.push(snapshot[x].tripName);
  }
  
}


/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("myInput"), tripNames);
autocomplete(document.getElementById("myInput2"), tripNames);

function importTrip() {
  var temp;
  var trip = document.getElementById("myInput").value;
  document.getElementById("myInput").value = '';
  document.getElementById("myInput2").value = trip;
  //console.log(trip);
  var userId = firebase.auth().currentUser.uid;
  //console.log('/users/' + userId + '/trips/' + trip);

  var tripsRef = firebase.database().ref('/users/' + userId + '/trips/' + trip);
  tripsRef.on('value', function(snapshot) {
    temp = snapshot.val();
    //var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
  // ...
  });
  console.log(temp);
  var trip = temp.finalRouteArr;
  console.log(trip);
  var i = 0;
  //finalRouteArr = trip;
  var geocoder = new google.maps.Geocoder;
  
  for( x in trip){
    if (trip[x].name == "Starting Location"){
      if(trip[x].latlng){
        console.log(trip[x].latlng);
        geocoder.geocode({'location': trip[x].latlng}, function(results, status) {
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
      }
    } else if (trip[x].name == "Destination"){
      if(trip[x].latlng){
        console.log(trip[x].latlng);
        geocoder.geocode({'location': trip[x].latlng}, function(results, status) {
          if (status === 'OK') {
              if (results[0]) {
                  document.getElementById('end').value = results[0].formatted_address;
              } else {
              window.alert('No results found');
              }
          } else {
              window.alert('Geocoder failed due to: ' + status);
          }
        });
      }
    } else if (trip[x].isWayPtn == "true"){
      var temp = document.getElementById('waypointslist');
      temp = temp.getElementsByTagName('input');
      console.log(i);
      temp[i].value = trip[x].name;
      console.log(temp[i].value);
      console.log(trip[x].name);
      i++;
    }
  }
  document.getElementById("submit").click();
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    
  } else {
      $(".hide-import").hide();
  }
});