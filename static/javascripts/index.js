/*define svg container dimensions*/
var svgWidth = 1000;
var svgHeight = 560;

/*define margins around bubble chart area*/
var margin = {
  top: 80,
  right: 20,
  bottom: 20,
  left: 80
};

/*calculate bubble chart area dimensions*/
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

/*create the SVG container and set the origin point of bubble chart*/
var svg = d3.select("#bubbleChart").append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
    
var bubbleChartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


/*define various scales used for x axis, y axis, radius of bubbles and color of bubbles*/
var xScale = d3.scaleLog().domain([50, 1300]).range([0, width]); /*use log scale so bubbles will not be displayed too closely*/
var yScale = d3.scaleLinear().domain([0, 18]).range([height, 0]);
var radiusScale = d3.scaleSqrt().domain([0, 4e7]).range([0, 20]); /*use square root scale to scale on large population numbers */
var colorScale = d3.scaleOrdinal(d3.schemeCategory10); /*use d3 ordinal color scale for different category of states*/

/*define x and y axis*/
var bottomAxis = d3.axisBottom(xScale);
bottomAxis.ticks(10, d3.format(",d")); /*make x axis tick show in integers on a log scale*/

var leftAxis = d3.axisLeft(yScale).ticks(10);

/*add x and y axis*/
bubbleChartGroup.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`)
  .call(bottomAxis);

bubbleChartGroup.append("g")
  .attr("class", "y axis")
  .call(leftAxis);

/*add x and y axis labels*/
bubbleChartGroup.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", height - 6)
  .text("Violent crime rate per 100,000 population");

bubbleChartGroup.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 6)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Unemployment rate");

/*add year label and set it to be the first year in the data*/
var label = bubbleChartGroup.append("text")
  .attr("class", "year label")
  .attr("text-anchor", "end")
  .attr("x", parseInt(`${margin.left}`)+width/2.5)
  .attr("y", parseInt(`${margin.top}`)+height/8)
  .text(1976);

/*use d3-tip library to create tooltips*/ 
var toolTip = d3.tip()
  .attr('class', 'd3-tip')
  .direction('s')
  .html(function(data) {
    return `<strong>${data.stateName}</strong> <hr> <strong>Population:&nbsp&nbsp&nbsp </strong>` 
      + parseInt(`${data.population}`).toLocaleString() 
      + "<br><strong>Unemployment rate:&nbsp&nbsp&nbsp</strong>"
      + parseFloat(`${data.unemploymentRate}`).toFixed(2) + "% <br> <strong>Violent Crime Rate:&nbsp&nbsp&nbsp </strong>" 
      + parseFloat(`${data.violentCrimeRate}`/100000*100).toFixed(2) + "%"
  })

/*add tooltips*/
bubbleChartGroup.call(toolTip)

/*local data*/
d3.json("static/data/chartData.json", function(data) {
	var bubbleData = data.chartData;
  /*create a list of years from the data*/
  var yearList = bubbleData[0].year;    
  /*create the inital bubble chart*/
	var circleGroup = bubbleChartGroup.selectAll(".circle")
		.data(interpolateData(1976)) /*bind first year's data*/
		.enter()
		.append("circle")
		.attr("class", "circle")
		.attr("r", data=>radiusScale(data.population))
		.attr("cx", data=>xScale(data.violentCrimeRate))
		.attr("cy", data=>yScale(data.unemploymentRate))
		.attr("opacity",.8)
		.style("fill", data=>colorScale(data.category))
		.sort(order) /*sort the bubbles based on radius so that smaller bubbles are always on top of larger bubbles*/

	/*add events for bubbles*/
  circleGroup.on("mouseover",function (data){
	toolTip.show(data);
	});

	circleGroup.on("mouseout",function (data){
	toolTip.hide(data);
	});
	 
	/*define function to sort the bubbles based on radius*/
  function radius(d) { return d.population; }
  function order(a, b) { return radius(b) - radius(a); } /*sort in descending order*/
  	
	/*add an overlay on top of year label*/
  var box = label.node().getBBox();
  var overlay = bubbleChartGroup.append("rect")
		.attr("class", "overlay")
		.attr("x", box.x)
		.attr("y", box.y)
		.attr("width", box.width)
		.attr("height", box.height-30)
		.on("mouseover", enableInteraction);
  
  /*define a function to start transition of bubbles*/
	function animate() {
		bubbleChartGroup.transition()
		.duration(30000)
		.ease(d3.easeLinear)
		.tween("year",tweenYear) /*use tween method to create transition frame by frame*/
	}

  /*define a function to interpolate a year (or a fraction of year) from the list of years, and it is used to create transition frames*/
  function tweenYear() {
  	var year = d3.interpolateNumber(1976,2014);
    return function(t) { updateChart(year(t)); };
  }
    
  /*define state code as the key to match up existing binded data and new data to be bound to circles*/
  function key(data) { return data.stateCode; }

  /*define a function to update bubble charts during the transition*/
  function updateChart(year) {
  	label.text(Math.round(year)); /*update year label, since year could be a fraction of years, round it to the whole year number*/
  	circleGroup
      /*bind new data interpolated from the dataset based on the tween year, and use key to match up with existing bound data*/
  		.data(interpolateData(year),key) 
  		.attr("r", data=>radiusScale(data.population))
  		.attr("cx", data=>xScale(data.violentCrimeRate))
  		.attr("cy", data=>yScale(data.unemploymentRate))
  		.attr("opacity",.8)
  		.style("fill", data=>colorScale(data.category))
  		.sort(order)
  }

  /*define a function to interpolate the dataset for the given (fractional) year*/
  function interpolateData(year) {
    return bubbleData.map(function(d) {
      return {
        stateCode: d.stateCode,
        stateName: d.stateName,
        category: d.category[yearList.indexOf(Math.round(year))],
        populationRanking: d.populationRanking[yearList.indexOf(Math.round(year))],
        unemploymentRate: interpolateValues(d.unemploymentRate, year),
        population: interpolateValues(d.population, year),
        violentCrimeRate: interpolateValues(d.violentCrimeRate, year)
      };   
    });
  }

  /*define a function to interpolate values based on given year*/
  function interpolateValues(values, year) {
    /*use bisect function to determine the position of given year in the year list in ascending order*/
    var i = d3.bisectLeft(yearList,year);
    /*extract the data value at current position i*/
    var b = values[i];
    /*when given year is not the first year in the year list, interpolate the values between a and b*/
    if (i > 0) {
        /*extract the data value before position i*/
        var a = values[i - 1];
        /*if given year is a whole year number, return 1, otherwise return the delta(fraction)*/
        var t = (year == Math.floor(year)? 1 : year - Math.floor(year));
        return a + (b - a) * t;
    }
    /*when given year is the first year in the year list, extract the first year's data*/
    return b;
  }

  /*define a function so that after the transition finishes, users can mouseover to change the year.*/
	function enableInteraction() {
  	var yearScale = d3.scaleLinear()
    	.domain([1976, 2014])
    	.range([box.x + 10, box.x + box.width - 10])
    	.clamp(true); /*use clamp method so that cannot go out of the range boundary*/

  	/*cancel the current transition, if any.*/
  	bubbleChartGroup.transition().duration(0);

  	/*when mouse move over the overlay, change the year based on the mouse position, and update the bubble chart accordingly*/
    overlay.on("mousemove", mousemove)
    
    function mousemove() { updateChart(yearScale.invert(d3.mouse(this)[0])); }
	}	

	/*create a play button to start animation for demo*/
  var playButton = d3.select("#playButton");
  playButton
    .text("Play")
    .style("color", "#4682B4")
    .style("font-weight", "bold")
    .style("font-family", "Helvetica Neue")

  playButton.on("click",animate)

});