// Create a map object
function CreateMap(map){
    let streetmap=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let baseMaps={
    "Street Map": streetmap
    }
    let overlayMaps = {
        "Earthquakes": map
      };
    let myMap = L.map("map", {
        center: [39.417, -101.810],
        layers:[streetmap,map],
        zoom: 4
      });
    // Adding the tile layer
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
}

let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"

function markers(){
    d3.json(url).then(function(data){
        console.log(data);
        let quakemarkers=[]
        let earthquakes = data.features;
        let elevations=[];
        for (let i = 0; i < earthquakes.length; i++) {
            elevations.push(earthquakes[i].geometry.coordinates[2])
        }
        let minimum=d3.min(elevations)
        let maximum=d3.max(elevations)
        console.log(minimum)
        console.log(maximum)
        let ColorScale=d3.scaleSequential(d3.interpolateRdYlGn).domain([90,minimum]);

        for (let i = 0; i < earthquakes.length; i++) {
          let location = earthquakes[i].geometry;
          let properties=earthquakes[i].properties;   
          let long=location.coordinates[0];
          let lat=location.coordinates[1];
          let elev=location.coordinates[2];
          let markeradius=properties.mag*3;
          let scalecolor= ColorScale(elev);
          let quakemarker = L.circleMarker([lat, long],{
            radius: markeradius,
            color:"#00",
            fillColor:scalecolor,
            fillOpacity:.75
        })
          .bindPopup("<h3>" + properties.place + "<h3><h3>Magnitude: " + properties.mag + "</h3><h3>Elevation: " + elev+ "' </h3>");
          quakemarkers.push(quakemarker);

        }
        CreateMap(L.layerGroup(quakemarkers));


    })

}
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson").then(markers);

