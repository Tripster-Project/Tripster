var map;

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
    maps_api_js.src = 'https://maps.googleapis.com/maps/api/js?key=' + liam_key + '&libraries=places&callback=init_autocomplete_inputs';

    document.getElementsByTagName('body')[0].appendChild(maps_api_js);
}

function init_autocomplete_inputs(){
    var home_page_term = document.getElementById('saveTerm');
    var home_page_autocomplete = new google.maps.places.Autocomplete(home_page_term);
}