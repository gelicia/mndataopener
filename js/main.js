//Check if info exists, by school number
Array.prototype.returnCountyInfo = function(county){
        for (var i = 0; i < this.length; i++) {
                if (this[i].countyName == county){
                        return this[i];
                }
        }
        return undefined;
};

function loadData(){
var width = 400,
    height = 430;

var svg = d3.selectAll("svg#mapMain")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.conicEqualArea()
   .center([1.5, 46.5])
    .rotate([95, 0])
    .parallels([29.5, 45.5])
    .scale(4000)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

	d3.json("data/mncounties.json", function(errorJ, mn) {
		d3.csv("data/ruralPostSecondary.csv", function(errorC, studentData){
			console.log(mn);

			svg.selectAll(".county")
			.data(topojson.feature(mn, mn.objects.counties).features).enter().append("path")
			.attr({
				d: path,
				fill: function(d, i){ 
					var countyData = studentData.returnCountyInfo(d.properties.name);
					return countyData == undefined ? "#696969" : "#ff0000";
				},
				stroke: '#000'
			})
			.classed('county', true);
		});
	});
}