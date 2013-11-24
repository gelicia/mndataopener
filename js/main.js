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



var allCountyInfo = [];

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
			allCountyInfo = studentData;

			//build the county list in a separate variable so we can sort them easily
			var countyList = studentData.map(function(d){return d.countyName;}).sort();

			d3.select("select#countyOptions").selectAll('option').data(countyList).enter()
			.append("option").attr("value", function(d){return d;}).text(function(d){return d;});

			svg.selectAll(".county")
			.data(topojson.feature(mn, mn.objects.counties).features).enter().append("path")
			.attr({
				d: path,
				id: function(d) {return d.properties.name;},
				stroke: '#000',
				'class' : function(d){
					var countyData = studentData.returnCountyInfo(d.properties.name);
					return 'county ' + (countyData.metroYear === "" ? 'nonMetro' : 'metro');} 
			})
			.on('click', function(d){
				var clickedCounty = studentData.returnCountyInfo(d.properties.name);
				//what happens when clicked depends on the selection option
				var displayOption = getRadioVal('displayOptions');
				if (displayOption == 'state'){
					var region = clickedCounty.metroYear === "" ? 'nonmetro' : 'metro';
					console.log(region);
					var element = document.getElementById('statewideOptions');
					element.value = region;
					toggleRegion(region);
				}
				else { //by county
					var element = document.getElementById('countyOptions');
					element.value = d.properties.name;
					toggleCounty(clickedCounty);
				}
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
}

function toggleRegion(regionType){
	if (regionType == 'all'){

	}
	else if (regionType == 'metro'){

	}
	else { //regionType == nonmetro

	}
}

function toggleDisplay(displayType) {
	if (displayType == 'state') {
		document.getElementById('statewideOptions').disabled = false;
		document.getElementById('cycleToggle').disabled = false;
		document.getElementById('countyOptions').disabled = true;
	}
	else { //displayType is county
		document.getElementById('statewideOptions').disabled = true;
		document.getElementById('cycleToggle').disabled = true;
		document.getElementById('countyOptions').disabled = false;
	}

}