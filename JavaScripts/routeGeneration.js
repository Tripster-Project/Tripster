var map;
var infowindow;
var hotelResultsArr = [];
var foodResultsArr = [];
var gasResultsArr = [];
var markersArr = [];
var waypts = [];
var spacedArr = [];
var pathArr = [];
var totalNumResults = 0;
var totalRouteLength = 0;
var startMarker;
var endMarker;
var directionsService;
var directionsRenderer;

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
    maps_api_js.src = 'https://maps.googleapis.com/maps/api/js?key=' + api_key + '&callback=initMap&libraries=places,geometry';

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
    var waypoint_autocomplete = new google.maps.places.Autocomplete(waypoint_input[0]);
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


    //console.log(str);

    document.getElementById('submit').addEventListener('click', function() {
    		waypts = [];
        calculateAndDisplayRoute(directionsService, directionsRenderer);
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
    //waypts.push({
    //    location: document.getElementById('waypoint').value,
    //    stopover: true
    //});
    /*var checkboxArray = document.getElementById('waypoints');
    for (var i = 0; i < checkboxArray.length; i++) {
        if (checkboxArray.options[i].selected) {
            waypts.push({
                location: checkboxArray[i].value,
                stopover: true
            });
        }
    } */


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
						totalRouteLength = get_total_route_length(pathArr);
      			spacedArr = get_spaced_loc_arr(pathArr, totalRouteLength);

						// Don't uncomment this function while using liam or greg key
            // For now only use this function (or most functions) with the test key in JSFiddle
            // If previously added hotel/food/gas markers, remove them before adding new ones
            if(markersArr.length != 0){clearMarkersAndResults();}

      			setTimeout(function(){find_hotels_along_route(spacedArr, totalRouteLength)}, 0);
            setTimeout(function(){find_gas_along_route(spacedArr, totalRouteLength)}, 10000);
            setTimeout(function(){find_food_along_route(spacedArr, totalRouteLength, generate_created_route);}, 20000);

        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

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

function generate_created_route(){
		console.log('Found ' + foodResultsArr.length.toString() + ' Restaurants');
    console.log('Number of Pings: ' + spacedArr.length.toString());
    console.log('Total Results From All N-Searches: ' + totalNumResults.toString());
    console.log('Number of Waypoints: ' + waypts.length.toString());

    add_hotels_as_waypoints();
    //add_food_as_waypoints();
    add_gas_as_waypoints();

    markersArr.push(startMarker);
    markersArr.push(endMarker);
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

    regenerate_route_with_added_waypoints(directionsService, directionsRenderer);
    directionsRenderer.setMap(map);
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
        if(2.77*Math.log10(sum) >= dis_meters){
        		retArr.push(pathArr[i+1]);
            sum = 0;
        }
    }
    return retArr;
}

function hotels_callback(results, status){
		// for now we are just taking the first result for each route nearbySearch ping
    // Otherwise we would get wayyy too many results to have to sort through
    if (status == google.maps.places.PlacesServiceStatus.OK) {

    		add_hotel_marker(results[0]);
    		hotelResultsArr.push(results[0]);
    		totalNumResults += results.length;

    }
}

function food_callback(results, status){
		// for now we are just taking the second result for each route nearbySearch ping
    // Otherwise we would get wayyy too many results to have to sort through
    if (status == google.maps.places.PlacesServiceStatus.OK) {

    		if(results[1] != null){
    				add_food_marker(results[1]);
   		  		foodResultsArr.push(results[1]);
    				totalNumResults += results.length;
   			}else{
    				add_food_marker(results[0]);
    				foodResultsArr.push(results[0]);
    				totalNumResults += results.length;
    		}
    }
}

function gas_callback(results, status){
		if (status == google.maps.places.PlacesServiceStatus.OK) {
    		add_gas_marker(results[0]);
    		gasResultsArr.push(results[0]);
    		totalNumResults += results.length;
    }
}

function find_hotels_along_route(spacedArr, totalRouteLength){

   	var radius;

    radius = Math.max(2000, ((totalRouteLength / 5000)*Math.log(totalRouteLength / 600*Math.log(totalRouteLength))));

    //setTimeout(function(){console.log('Radius Value is: ' + radius.toString())}, 2000);

		var requests = [];
    for (var i = 0; i < spacedArr.length; i++){
    		requests[i] = {
       			location: spacedArr[i],
        		radius: radius,
            type: ['lodging']
        };
    }


    for (var i = 0; i < requests.length/3; i++){
    		//if(!(i%5)){sleep(2000);}
        if(!(i%4)){sleep(2000);}
        var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(requests[i], hotels_callback);
    }
    setTimeout(function(){

    		for(var i = parseInt(requests.length/3); i < 2*(requests.length/3); i++){
    				var service = new google.maps.places.PlacesService(map);
    				service.nearbySearch(requests[i], hotels_callback);
    		}

    }, 2000);

    setTimeout(function(){

    		for(var i = parseInt(2*(requests.length/3)); i < requests.length; i++){
    				var service = new google.maps.places.PlacesService(map);
    				service.nearbySearch(requests[i], hotels_callback);
    		}

    }, 3000);


    setTimeout(function(){

    		lastReq = {
    				location: pathArr[0],
        		radius: 10000,
        		type: ['lodging']
    		};
    		var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(lastReq, hotels_callback);

    }, 4000);
}

function find_gas_along_route(spacedArr, totalRouteLength){

   	var radius;

    radius = Math.max(2000, ((totalRouteLength / 5000)*Math.log(totalRouteLength / 600*Math.log(totalRouteLength))));

    //setTimeout(function(){console.log('Radius Value is: ' + radius.toString())}, 2000);

		var requests = [];
    for (var i = 0; i < spacedArr.length; i++){
    		requests[i] = {
       			location: spacedArr[i],
        		radius: radius,
            type: ['gas_station']
        };
    }


    for (var i = 0; i < requests.length/3; i++){
    		//if(!(i%5)){sleep(2000);}
        if(!(i%4)){sleep(2500);}
        var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(requests[i], gas_callback);
    }
    setTimeout(function(){

    		for(var i = parseInt(requests.length/3); i < 2*(requests.length/3); i++){
    				var service = new google.maps.places.PlacesService(map);
    				service.nearbySearch(requests[i], gas_callback);
    		}

    }, 3000);

    setTimeout(function(){

    		for(var i = parseInt(2*(requests.length/3)); i < requests.length; i++){
    				var service = new google.maps.places.PlacesService(map);
    				service.nearbySearch(requests[i], gas_callback);
    		}

    }, 4000);


    setTimeout(function(){

    		lastReq = {
    				location: pathArr[0],
        		radius: 10000,
        		type: ['gas_station']
    		};
    		var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(lastReq, gas_callback);

    }, 5000);
}

function find_food_along_route(spacedArr, totalRouteLength, callback){
			var radius;

      radius = Math.max(2000, ((totalRouteLength / 5000)*Math.log(totalRouteLength / 600*Math.log(totalRouteLength))));

		console.log('Radius Value is: ' + radius.toString());

		var requests = [];
    for (var i = 0; i < spacedArr.length; i++){
    		requests[i] = {
       			location: spacedArr[i],
        		radius: radius,
            type: ['restaurant']
        };
    }

		for (var i = 0; i < requests.length/3; i++){
    		//if(!(i%5)){sleep(2000);}
        if(!(i%4)){sleep(2500);}
        var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(requests[i], food_callback);
    }
    setTimeout(function(){

    		for(var i = parseInt(requests.length/3); i < 2*(requests.length/3); i++){
    				var service = new google.maps.places.PlacesService(map);
    				service.nearbySearch(requests[i], food_callback);
    		}

    }, 3000);

    setTimeout(function(){

    		for(var i = parseInt(2*(requests.length/3)); i < requests.length; i++){
    				var service = new google.maps.places.PlacesService(map);
    				service.nearbySearch(requests[i], food_callback);
    		}

    }, 4000);


    setTimeout(function(){

    		lastReq = {
    				location: pathArr[0],
        		radius: 10000,
        		type: ['restaurant']
    		};
    		var service = new google.maps.places.PlacesService(map);
    		service.nearbySearch(lastReq, food_callback);

    }, 5000);

    setTimeout(function(){callback();}, 6000);
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
        name: ''
      }
    ]
  },
  methods: {
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

})
/*
<div class="parameter row align-items-center">
    <div class="col-auto mr-auto"><h5>Hotels</h5></div>
    <div class="col-auto"><button class="plus-submit" data-toggle="modal" data-target="#hotelModal"><i class="fa fa-plus"></i></button></div>
</div> */
