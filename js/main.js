function loadData(){
var width = 960,
    height = 1160;

var svg = d3.selectAll("svg#mapMain")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.albers()
    .center([-94, 46])
    .rotate([0, 0])
    .parallels([50, 60])
    .scale(8000)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

	d3.json("data/mncounties.json", function(error, mn) {
		svg.append("path")
	    .datum(topojson.feature(mn, mn.objects.counties))
	    .attr("d", path);
	});
}