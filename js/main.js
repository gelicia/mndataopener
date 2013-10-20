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

	d3.json("data/mncounties.json", function(error, mn) {
		svg.append("path")
	    .datum(topojson.feature(mn, mn.objects.counties))
	    .attr("d", path)
	    .attr({
	    	fill: '#fff',
	    	stroke: '#000'
	    });
	});
}