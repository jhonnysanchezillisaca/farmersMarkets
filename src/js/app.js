'use strict';

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

    // Set timeout in case wikipedia response doesn't work
    var wikiRequestTimeout = setTimeout(function(){
        $('#wikipediaArticles').text('Failed to get wikipedia resources');
    }, 8000);

    $.ajax({
        url: wikipediaURLToQuery,
        dataType: 'jsonp'})
        .done(function(data) {
        simpleListModel.wikipediaArticles.removeAll();
        data.query.geosearch.forEach(function(entry) {
            simpleListModel.wikipediaArticles.push({url: 'http://en.wikipedia.org/?curid=' + entry.pageid,
                title: entry.title});
        });
        // Stop the timeout that is set to set an error in wikipedia response
        clearTimeout(wikiRequestTimeout);
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
            infoWMessage: messageForInfowindow});

        // Push to items to make the data visible on load
        simpleListModel.items.push(locations[i]);
        }
}).fail(function() {
    $('#markets').text('Unable to load the data. Please try again later.');
    }
);


var simpleListModel = {
    items: ko.observableArray([]),
    wikipediaArticles: ko.observableArray([]),
    query: ko.observable(''),
    search: function(value) {
        // Close the infowindow if it is open
        infowindow1.close();
        if (value === '') {
            locations.forEach(function(location) {
                if (location.name.lenght > 0) {
                    location.location.setVisible(true);
                }
            });
        }
        locations.forEach(function(location) {
            // Filters the locations by name and hides the marker from the map
            if (location.name.toLowerCase().indexOf(
                value.toLowerCase()) >= 0) {
                    location.location.setVisible(true);
                } else {
                    location.location.setVisible(false);
                }
        });
    },
};


simpleListModel.query.subscribe(simpleListModel.search);

ko.applyBindings(simpleListModel);
