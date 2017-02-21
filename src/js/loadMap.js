'use strict';

var map, infowindow1;

var lastOpenInfoWindow,
    wikipediaArticles = [],
    locations = [];

/**
* @description Attachs a infowindow to a marker and sets a click listener in
* the marker toopen the infowindow. Also sets an animation to the marker.
* @param {Marker} marker The google maps marker to associate with an infowindow
* @param {String} message The message for the infowindow to display when opened
* @return {InfoWindow} The infowindow object created
**/
function attachMessages(marker, message) {
    // Closes the last opened infowindow automatically
    marker.addListener('click', function() {
        infowindow1.close();
        infowindow1.setContent(message);
        infowindow1.open(marker.get('map'), marker);
        // Animation
        setAnimationWithTimeout(marker);

        // Make geo query wikipedia
        makeWikipediaGEORequest(marker.position.lat(), marker.position.lng());
    });
}

/**
* @description Gets articles from wikipedia near a given location and push it
* to the wikipediaArticles variable of the model
* @param {float} latitude Latitude of the location to search
* @param {float} longitude Longitude of the location to search
**/
function makeWikipediaGEORequest(latitude, longitude) {
    var wikipediaURL = 'https://en.wikipedia.org/w/api.php?';
    var wikipediaURLToQuery = wikipediaURL +
        'action=query&format=json&list=geosearch&gscoord='
        + latitude + '%7C' + longitude + '&gsradius=10000&gslimit=10';

    $.ajax({
        url: wikipediaURLToQuery,
        dataType: 'jsonp'})
        .done(function(data) {
        simpleListModel.wikipediaArticles.removeAll();
        data.query.geosearch.forEach(function(entry) {
            simpleListModel.wikipediaArticles.push({url: 'http://en.wikipedia.org/?curid=' + entry.pageid,
                title: entry.title});
        });
    }).fail(function() {
        simpleListModel.wikipediaArticles.removeAll();
        simpleListModel.wikipediaArticles.push(
            {title: 'Failed to get wikipedia resources',
            url: '#'});
    });
}


/**
* @description Attach a bouncing animation to the marker. The marker bounces
* for 2117ms.
* @param {Marker} marker The marker to attach the bounce animation
**/
function setAnimationWithTimeout(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1400);
}


/**
* @description Shows the infowindow of a location and closes the previous open
* infowindow. Also sets an animation to the marker and gets
* wikipedia articles
* @param {Object} location The location object as stored in the model
**/
function showInfoOfLocation(location) {
    infowindow1.close();
    infowindow1.setContent(location.infoWMessage);
    infowindow1.open(map, location.location);

    // Animation of the marker
    setAnimationWithTimeout(location.location);

    // Wikipedia Articles
    makeWikipediaGEORequest(location.location.position.lat(),
                            location.location.position.lng());
}


/**
* Checks is there's no error loading the map
**/
var mapError = function() {
    $('#map').text('Couldn\'t load the map, please try again later');
}


/**
* Initializes the map and sets the defult center and the default zoom
**/
function initMap() {
    var seattle = {lat: 47.64, lng: -122.35};
    map = new google.maps.Map(document.getElementById('map'), {
        center: seattle,
        zoom: 12
    });
    // Creates the infowindow global object
    infowindow1 = new google.maps.InfoWindow({});

    // Retrieves data of the Farmers Markets from Seattle and store them in
    // the model
    $.ajax({
        url: 'https://data.seattle.gov/resource/3c4b-gdxv.json?city_feature=Farmers Markets',
        type: 'GET',
        data: {
            '$limit': 5000,
        },
    }).done(function(data) {
        for (var i = 0; i < data.length; i++) {
            // Creates the marker
            var marker = new google.maps.Marker({
                position: {lat: parseFloat(data[i].latitude),
                    lng: parseFloat(data[i].longitude)},
                    map: map});
            // Creates the message to show in the infowindow
            var messageForInfowindow = '<h3>' + data[i].common_name +
            '</h3><a href="' + data[i].website +
            '">Website</a>';
            // Adds click event listener to the marker to show the infowindow
            attachMessages(marker, messageForInfowindow);
            // Adds the data to the model
            locations.push({
                name: data[i].common_name,
                address: data[i].address,
                website: data[i].website,
                location: marker,
                infoWMessage: messageForInfowindow,
                visible: true});

            // Push to items to make the data visible on load
            simpleListModel.items.push(locations[i]);
            }
    }).fail(function() {
        $('#markets').text('Unable to load the data. Please try again later.');
        }
    );
}
