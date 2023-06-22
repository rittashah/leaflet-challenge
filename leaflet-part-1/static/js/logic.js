// Store our API endpoing as baseurl
var baseurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL
d3.json(baseurl).then(function(data){
    // console.log(data)
    // Once e get a response, send the data.features and data.features object to the createFeatures function.
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeinfo){

    // Give each feature a popup describing the place and time of the earthquakes
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeinfo object
    function CircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: colorselection(feature.geometry.coordinates[2]),
        color: colorselection(feature.geometry.coordinates[2]),
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.35
       } 
       return L.circleMarker(latlng,options);
    }
    // Create a variable for earthquakes to house latlng, each feature for popup, and cicrle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeinfo, {
        onEachFeature: onEachFeature,
        pointToLayer: CircleMarker
    });

    // Send earthquakes layer to the createMap function - will start creating the map and add features
    createMap(earthquakes);
}

// Circles color palette based on mag (feature) data marker: data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
function colorselection(depth){
    switch(true){
        case(-10 <= depth && depth <= 10):
            return "#adff2f"; // yellow green
        case (10 < depth && depth <=30):
            return "#ffff00";//yellow
        case (30< depth && depth <=50):
            return "#ffa500";//orange
        case (50 <depth && depth <= 70):
            return "#ff8c00";//dark orange
        case (70 <depth && depth <=90):
            return "#ff4500";//ornage red
        default:
            return "#ff0000";//red
    }
}

// Create map legend to provide context for map data
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var depth = [-10, 10, 30, 50, 70, 90];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    // go through each magnitude item to label and color the legend
    // push to labels array as list item
    for (var i = 0; i < depth.length; i++) {
          labels.push('<ul style="background-color:' + colorselection(depth[i] + 1) + '"> <span>' +depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '' : '+') + '</span></ul>');
        }

      // add each label list item to the div under the <ul> tag
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };


// Create map
function createMap(earthquakes) {
  var mykey=config.api_key
   // Define outdoors and graymap layers
   let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "outdoors-v11",
    accessToken: mykey
  })

  let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "light-v10",
    accessToken: mykey
  });

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Outdoors": streetstylemap,
    "Grayscale": graymap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      39.8282, -98.5795
    ],
    zoom: 4,
    layers: [streetstylemap, earthquakes]
  });
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}