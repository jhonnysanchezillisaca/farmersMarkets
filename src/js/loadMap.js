var map;

/**
* Initializes the map and sets the defult center and the default zoom
**/
function initMap() {
    var seattle = {lat: 47.642146, lng: -122.400694};
    map = new google.maps.Map(document.getElementById('map'), {
        center: seattle,
        zoom: 10
    });
}
