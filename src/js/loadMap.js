var map;

/**
* Initializes the map and sets the defult center and the default zoom
**/
function initMap() {
    var seattle = {lat: 47.64, lng: -122.35};
    map = new google.maps.Map(document.getElementById('map'), {
        center: seattle,
        zoom: 12
    });
}
