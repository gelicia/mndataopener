function loadData(){
var width = 960,
    height = 1160;

var svg = d3.selectAll("svg#mapMain")
    .attr("width", width)
    .attr("height", height);

	d3.json("data/mncounties.json", function(error, mn) {
		svg.append("path")
	    .datum(topojson.feature(mn, mn.objects.counties))
	    .attr("d", d3.geo.path().projection(d3.geo.mercator()));
	});
}