//Check if info exists, by school number
Array.prototype.returnCountyInfo = function(county){
		for (var i = 0; i < this.length; i++) {
				if (this[i].countyName == county){
						return this[i];
				}
		}
		return undefined;
};

function getRadioVal (groupName){
	var radioElements = document.getElementsByName(groupName);
	for(var i = 0; i < radioElements.length; i++){
		if(radioElements[i].checked){
			return radioElements[i].value;
		}
	}
}

var statewideOptionList = [
	{condensedName: 'all', friendlyName: 'All Counties'},
	{condensedName: 'metro', friendlyName: 'All Metropolitan Counties'},
	{condensedName: 'MinneapolisStPaulBloomingtonMNWI', friendlyName: 'Minneapolis-St. Paul-Bloomington MN-WI Metro Region'},
	{condensedName: 'StCloudMN', friendlyName: 'St. Cloud MN Metro Region'},
	{condensedName: 'MankatoNorthMankatoMN', friendlyName: 'Mankato-North Mankato MN Metro Region'},
	{condensedName: 'DuluthMNWI', friendlyName: 'Duluth MN-WI Metro Region'},
	{condensedName: 'FargoNDMN', friendlyName: 'Fargo ND-MN Metro Region'},
	{condensedName: 'RochesterMN', friendlyName: 'Rochester MN Metro Region'},
	{condensedName: 'LaCrosseOnalaskaWIMN', friendlyName: 'La Crosse-Onalaska WI-MN Metro Region'},
	{condensedName: 'GrandForksNDMN', friendlyName: 'Grand Forks ND-MN Metro Region'},
	{condensedName: 'nonmetro', friendlyName: 'All Non-Metropolitan Counties'}
];


var allCountyInfo = [];
var countyJson = {};
var width = 400,height = 430;

//other functions use the projection/path for highlighting certain sections
var projection = d3.geo.conicEqualArea()
	.center([1.5, 46.5])
	.rotate([95, 0])
	.parallels([29.5, 45.5])
	.scale(4000)
	.translate([width / 2, height / 2]);

var path = d3.geo.path()
	.projection(projection);

function loadData(){
	var svg = d3.selectAll("svg#mapMain")
		.attr("width", width)
		.attr("height", height);

	d3.json("data/mncounties.json", function(errorJ, mn) {
		countyJson=mn;
		d3.csv("data/ruralPostSecondary.csv", function(errorC, studentData){
			allCountyInfo = studentData;

			//build the county list in a separate variable so we can sort them easily
			var countyList = studentData.map(function(d){return d.countyName;}).sort();
			d3.select("select#countyOptions").selectAll('option').data(countyList).enter()
			.append("option").attr("value", function(d){return d;}).text(function(d){return d;});

			//build the metro area list
			d3.select("select#statewideOptions").selectAll('option').data(statewideOptionList).enter()
			.append("option").attr("value", function(d){return d.condensedName;}).text(function(d){return d.friendlyName;});

			svg.selectAll(".county")
			.data(topojson.feature(mn, mn.objects.counties).features).enter().append("path")
			.attr({
				d: path,
				id: function(d) {return d.properties.name;},
				stroke: '#000',
				'class' : function(d){
					var countyData = studentData.returnCountyInfo(d.properties.name);
					return 'county ' + (countyData.metro === "" ? 'nonMetro' : countyData.metro );} 
			})
			.on('click', function(d){
				var clickedCounty = studentData.returnCountyInfo(d.properties.name);
				//what happens when clicked depends on the selection option
				var displayOption = getRadioVal('displayOptions');
				if (displayOption == 'state'){
					var region = clickedCounty.metro === "" ? 'nonmetro' : clickedCounty.metro;
					var stateElement = document.getElementById('statewideOptions');
					stateElement.value = region;
					toggleRegion(region);
				}
				else { //by county
					var countyElement = document.getElementById('countyOptions');
					countyElement.value = d.properties.name;
					toggleCounty(clickedCounty);
				}
			});

			svg.append("path")
			.datum(topojson.mesh(mn, mn.objects.counties, function(a, b) { return a === b; }))
			.attr({
				"id": "highlightPath",
				"d": path,
				"fill": "none",
				"stroke-width": 3,
				"stroke": "#0955c4"
			});
		});
	});
}

function getSelectToggleCounty(){
	var e = document.getElementById("countyOptions");
	var county = e.options[e.selectedIndex].text;
	toggleCounty(allCountyInfo.returnCountyInfo(county));
}

function getSelectToggleRegion(){
	var e = document.getElementById("statewideOptions");
	var region = e.options[e.selectedIndex].value;
	toggleRegion(region);
}

function toggleCounty(countyInfo){
	console.log(countyInfo);

	d3.select("#highlightPath").remove();

	d3.selectAll("svg#mapMain").append("path")
	.datum(topojson.mesh(countyJson, countyJson.objects.counties, function(a, b) { return a.properties.name == countyInfo.countyName || b.properties.name == countyInfo.countyName; }))
	.attr({
		"id": "highlightPath",
		"d": path,
		"fill": "none",
		"stroke-width": 3,
		"stroke": "#0955c4"
	});
}

function toggleRegion(regionType){
	console.log(regionType);
	d3.select("#highlightPath").remove();

	if (regionType == 'all'){
		d3.selectAll("svg#mapMain").append("path")
		.datum(topojson.mesh(countyJson, countyJson.objects.counties, function(a, b) { return a === b; }))
		.attr({
			"id": "highlightPath",
			"d": path,
			"fill": "none",
			"stroke-width": 3,
			"stroke": "#0955c4"
		});
	}
	else if (regionType == 'metro'){
		d3.selectAll("svg#mapMain").append("path")
		.datum(topojson.mesh(countyJson, countyJson.objects.counties, function(a, b) { 
			var aCounty = allCountyInfo.returnCountyInfo(a.properties.name);
			var bCounty = allCountyInfo.returnCountyInfo(b.properties.name);
			//I realize this logic can be simplified but I need it spelled out
			return (aCounty.metro === "" && bCounty.metro !== "") || //either border between metro and non metro
				(aCounty.metro !== "" && bCounty.metro === "") || //either border between metro and non metro
				(aCounty.metro !== "" && aCounty === bCounty) || //or border between metro and outside
				(bCounty.metro !== "" && aCounty === bCounty);  })) //or border between metro and outside
		.attr({
			"id": "highlightPath",
			"d": path,
			"fill": "none",
			"stroke-width": 3,
			"stroke": "#0955c4"
		});
	}
	else if (regionType == 'nonmetro'){
		d3.selectAll("svg#mapMain").append("path")
		.datum(topojson.mesh(countyJson, countyJson.objects.counties, function(a, b) { 
			var aCounty = allCountyInfo.returnCountyInfo(a.properties.name);
			var bCounty = allCountyInfo.returnCountyInfo(b.properties.name);
			//I realize this logic can be simplified but I need it spelled out
			return (aCounty.metro === "" && bCounty.metro !== "") || //either border between metro and non metro
				(aCounty.metro !== "" && bCounty.metro === "") || //either border between metro and non metro
				(aCounty.metro === "" && aCounty === bCounty) || //or border between nonmetro and outside
				(bCounty.metro === "" && aCounty === bCounty);  })) //or border between nonmetro and outside
		.attr({
			"id": "highlightPath",
			"d": path,
			"fill": "none",
			"stroke-width": 3,
			"stroke": "#0955c4"
		});
	}
	else  { //specific metro region
		d3.selectAll("svg#mapMain").append("path")
		.datum(topojson.mesh(countyJson, countyJson.objects.counties, function(a, b) { 
			var aCounty = allCountyInfo.returnCountyInfo(a.properties.name);
			var bCounty = allCountyInfo.returnCountyInfo(b.properties.name);
			//I realize this logic can be simplified but I need it spelled out
			return (aCounty.metro === regionType && bCounty.metro !== regionType) || //either border between specified region and outside specified region
				(aCounty.metro !== regionType && bCounty.metro === regionType) || //either border between metro and non metro
				(aCounty.metro === regionType && aCounty === bCounty) || //or border between nonmetro and outside
				(bCounty.metro === regionType && aCounty === bCounty);  })) //or border between nonmetro and outside
		.attr({
			"id": "highlightPath",
			"d": path,
			"fill": "none",
			"stroke-width": 3,
			"stroke": "#0955c4"
		});
	}
}

function toggleDisplay(displayType) {
	if (displayType == 'state') {
		document.getElementById('statewideOptions').disabled = false;
		document.getElementById('countyOptions').disabled = true;
	}
	else { //displayType is county
		document.getElementById('statewideOptions').disabled = true;
		document.getElementById('countyOptions').disabled = false;
	}

}