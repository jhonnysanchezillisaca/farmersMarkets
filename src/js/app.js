'use strict';


var simpleListModel = {
    items: ko.observableArray([]),
    wikipediaArticles: ko.observableArray([]),
    query: ko.observable(''),
    search: function(value) {
    simpleListModel.items.removeAll();
    if (value === '') {
        for (var location in locations) {
            if (locations[location].name.lenght > 0) {
                locations[location].location.setVisible(true);
                simpleListModel.items.push(locations[locations]);
            }
        }
    }
    for(var location in locations) {
        // Filters the locations by name and hides the marker from the map
        if (locations[location].name.toLowerCase().indexOf(
            value.toLowerCase()) >= 0) {
                locations[location].location.setVisible(true);
                simpleListModel.items.push(locations[location]);
            } else {
                locations[location].location.setVisible(false);
            }
        }
}};


simpleListModel.query.subscribe(simpleListModel.search);

ko.applyBindings(simpleListModel);
