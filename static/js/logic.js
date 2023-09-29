// Create a map object that read in a map layer and colorarray
function CreateMap(map,colorarray){
   console.log(colorarray)

    let streetmap=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let baseMaps={
    "Street Map": streetmap
    }
    //Only the one overlay for now. I tried having overlay changed based on different datasets
    //That code didn't work and had some sort of memory leak :( 
    let overlayMaps = {
        "Earthquakes": map
      };
    //create the map centered on the U.S.
    let myMap = L.map("map", {
        center: [39.417, -101.810],
        layers:[streetmap,map],
        zoom: 4
      });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

    //create the legend 
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      var div = L.DomUtil.create("div", "info legend");
      var limits = [ 0, 10, 20,30, 40, 50, 60, 70, 80,90];
      colors=[]
      elev=[]

      //Create an array just for colors. Elev is not necessary but may be used in a later version.
      for (item in colorarray){
        colors.push(colorarray[item].color)
        elev.push(colorarray[item].elevation)

      }

      //loop to create the HTML portion of the legend using i style from style.css
      var color_count =0
      for (var i=0; i<limits.length; i++) {
          div.innerHTML+= '<i style="background:' + colors[color_count] + '"></i>'+limits[i]
          + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+')
          color_count +=25
        };
      return div
    };
    // Add the legend to the map
    legend.addTo(myMap);
}

let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"

function markers(){
    d3.json(url).then(function(data){
      //assigne variables and create our multiarray which will primarily be used to store rgb values 

      let earthquakes = data.features;
      let quakemarkers=[]
      let elevations=[];
      let multiarray=[]
      //seperate for loop to determine earthquake depth to find minimum depth later

      for (let i = 0; i < earthquakes.length; i++) {
        elevations.push(earthquakes[i].geometry.coordinates[2])
    }    
      let minimum=d3.min(elevations)

      //Colorscale will used the scaleSequential function from D3 Scale Chromatic library
      //This function converts take a domain and will assign rgb values to values within that domain
      let ColorScale=d3.scaleSequential(d3.interpolateRdYlGn).domain([90,minimum]);
  


      //Primary loop where arrays and markers are populated
      for (let i = 0; i < earthquakes.length; i++) {
        let location = earthquakes[i].geometry;
        let properties=earthquakes[i].properties;   
        let long=location.coordinates[0];
        let lat=location.coordinates[1];
        let elev=location.coordinates[2];
        let markeradius=properties.mag*3;
        let scalecolor= ColorScale(elev);

        multiarray.push({ elevation: elev, color: scalecolor, radius: markeradius });
        multiarray.sort((a, b) => a.elevation - b.elevation)

        let quakemarker = L.circleMarker([lat, long],{
          radius: markeradius,
          color:"#00",
          fillColor:scalecolor,
          fillOpacity:.75
      })
        .bindPopup("<h3>" + properties.place + "<h3><h3>Magnitude: " + properties.mag + "</h3><h3>Elevation: " + elev+ "' </h3>");
        quakemarkers.push(quakemarker);

      }
      //call the CreateMap function and pass the layergroup of quakemarkers and the array with colors
    CreateMap(L.layerGroup(quakemarkers),multiarray);


    })

}
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson").then(markers);

