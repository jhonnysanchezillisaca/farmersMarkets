'use strict';

var lastOpenInfoWindow;


/**
* Attachs a infowindow to a marker and sets a click listener in the marker to
* open the infowindow. Also sets an animation to the marker.
* @param {Marker} marker The google maps marker to associate with an infowindow
* @param {String} message The message for the infowindow to display when opened
* @return {InfoWindow} The infowindow object created
**/
function attachMessage(marker, message) {
    var infowindow = new google.maps.InfoWindow({
        content: message});
    // Closes the last opened infowindow automatically
    marker.addListener('click', function() {
        if (null != lastOpenInfoWindow) {
            lastOpenInfoWindow.close();
        }
        infowindow.open(marker.get('map'), marker);
        lastOpenInfoWindow = infowindow;

        // Animation
        setAnimationWithTimeout(marker);

        // Make geo query wikipedia
        makeWikipediaGEORequest(marker.position.lat(), marker.position.lng());
    });
    return infowindow;
}

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
        for (var entry in data.query.geosearch) {
            simpleListModel.wikipediaArticles.push({url: 'http://en.wikipedia.org/?curid=' + data.query.geosearch[entry].pageid,
                title: data.query.geosearch[entry].title});
        }
        // Stop the timeout that is set to set an error in wikipedia response
        clearTimeout(wikiRequestTimeout);
    });
}


/**
* Attach a bouncing animation to the marker. The marker bounces for 2117ms.
* @param {Marker} marker The marker to attach the bounce animation
**/
function setAnimationWithTimeout(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1411);
}


/**
* Shows the infowindow of a location and closes the previous open infowindow,
* if it exists. Also sets an animation to the marker and gets wikipedia articles
* @param {Object} location The location object as stored in the model
**/
function showInfoOfLocation(location) {
    // Displays infowindow on marker
    if (null != lastOpenInfoWindow) {
        lastOpenInfoWindow.close();
    }
    location.infowindow.open(map, location.location);
    lastOpenInfoWindow = location.infowindow;

    // Animation of the marker
    setAnimationWithTimeout(location.location);

    // Wikipedia Articles
    makeWikipediaGEORequest(location.location.position.lat(),
                            location.location.position.lng());

}

var wikipediaArticles = [];

var locations = [];

// Retrieves data of the Farmers Markets from Seattle and store them in
// the model
$.ajax({
    url: 'https://data.seattle.gov/resource/3c4b-gdxv.json?city_feature=Farmers Markets',
    type: 'GET',
    data: {
        '$limit': 5000,
    },
}).done(function(data) {
    for (var market in data) {
        var marker = new google.maps.Marker({
            position: {lat: parseFloat(data[market].latitude),
                lng: parseFloat(data[market].longitude)},
                map: map});
        var messageForInfowindow = '<h3>' + data[market].common_name +
        '</h3><a href="' + data[market].website +
        '">Website</a>';
        locations.push({
            name: data[market].common_name,
            address: data[market].address,
            website: data[market].website,
            location: marker,
            infowindow: attachMessage(marker, messageForInfowindow)});

        // Push to items to make the data visible on load
        simpleListModel.items.push(locations[market]);
        }
}).fail(function() {
    $('#markets').text('Unable to load the data. Please try again later.');
}
);


var simpleListModel =  {
items: ko.observableArray([]),
wikipediaArticles: ko.observableArray([]),
query: ko.observable(''),
search: function(value) {
    simpleListModel.items.removeAll();
    if (value === '') {
        for (var location in locations) {
            if (locations[location].name.lenght > 0) {
                locations[location].location.setMap(map);
                simpleListModel.items.push(locations[locations]);
            }
        }
    }
    for(var location in locations) {
        // Filters the locations by name and hides the marker from the map
        if (locations[location].name.toLowerCase().indexOf(
            value.toLowerCase()) >= 0) {
                locations[location].location.setMap(map);
                simpleListModel.items.push(locations[location]);
            } else {
                locations[location].location.setMap(null);
            }
        }
    },
};


// SimpleListModel.query.subscribe(SimpleListModel.search);
simpleListModel.query.subscribe(simpleListModel.search);

ko.applyBindings(simpleListModel);

console.log(Object.keys(simpleListModel.wikipediaArticles()).length);
