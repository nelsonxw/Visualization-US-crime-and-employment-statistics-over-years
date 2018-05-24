/*define svg container dimensions for bubble chart*/
var svgWidth_b = 900;
var svgHeight_b = 560;

/*define margins around bubble chart area*/
var margin_b = {
  top: 80,
  right: 20,
  bottom: 20,
  left: 80
};

/*calculate bubble chart area dimensions*/
var width_b = svgWidth_b - margin_b.left - margin_b.right;
var height_b = svgHeight_b - margin_b.top - margin_b.bottom;

/*create the SVG container and set the origin point of bubble chart*/
var svg_b = d3.select("#bubble_Chart").append("svg")
  .attr("id","bubbleChart")
  .attr("width", svgWidth_b)
  .attr("height", svgHeight_b);
    
var bubbleChartGroup = svg_b.append("g")
  .attr("transform", `translate(${margin_b.left}, ${margin_b.top})`);


/*define various scales used for x axis, y axis, radius of bubbles and color of bubbles*/
var xScale_b = d3.scaleLog().domain([40, 3000]).range([0, width_b]); /*use log scale so bubbles will not be displayed too closely*/
var yScale_b = d3.scaleLinear().domain([0, 18]).range([height_b, 0]);
var radiusScale_b = d3.scaleSqrt().domain([0, 4e7]).range([0, 40]); /*use square root scale to scale on large population numbers */
var colorScale_b = d3.scaleOrdinal(d3.schemeCategory10); /*use d3 ordinal color scale for different category of states*/

/*define x and y axis for bubble chart*/
var bottomAxis_b = d3.axisBottom(xScale_b);
bottomAxis_b.ticks(10, d3.format(",d")); /*make x axis tick show in integers on a log scale*/

var leftAxis_b = d3.axisLeft(yScale_b).ticks(10);

/*add x and y axis*/
bubbleChartGroup.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height_b})`)
  .call(bottomAxis_b);

bubbleChartGroup.append("g")
  .attr("class", "y axis")
  .call(leftAxis_b);

/*add x and y axis labels*/
bubbleChartGroup.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width_b)
  .attr("y", height_b - 6)
  .text("Violent crime rate per 100,000 population");

bubbleChartGroup.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 6)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Unemployment rate");

/*add year label and set it to be the first year in the data*/
var label_b = bubbleChartGroup.append("text")
  .attr("class", "year label")
  .attr("text-anchor", "end")
  .attr("x", parseInt(`${margin_b.left}`)+width_b/2.5)
  .attr("y", parseInt(`${margin_b.top}`)+height_b/8)
  .text(1976);

/*use d3-tip library to create tooltips*/ 
var toolTip_b = d3.tip()
  .attr('class', 'd3-tip')
  .direction('s')
  .html(function(data) {
    return `<strong>${data.stateName}</strong> <hr> <strong>Population:&nbsp&nbsp&nbsp </strong>` 
      + parseInt(`${data.population}`).toLocaleString() 
      + "<br><strong>Unemployment rate:&nbsp&nbsp&nbsp</strong>"
      + parseFloat(`${data.unemploymentRate}`).toFixed(2) + "% <br> <strong>Violent Crime Rate:&nbsp&nbsp&nbsp </strong>" 
      + parseFloat(`${data.crimeRate}`/100000*100).toFixed(2) + "%"
  });

/*add tooltips*/
bubbleChartGroup.call(toolTip_b);

/*load data*/
var routeURL = "/chartdata"
d3.json(routeURL, function(data) {
	
/*	var bubbleData = data.chartData;*/
  /*create a list of years from the data*/
  data.map(function (d) {
  	return d.year = d.year.map(d=>parseInt(d))
  })
  
  data.map(function (d) {
  	return d.unemploymentRate = d.unemploymentRate.map(d=>parseInt(d))
  })
  
  data.map(function (d) {
  	return d.robberyRate = d.robberyRate.map(d=>parseInt(d))
  })
      
  data.map(function (d) {
  	return d.rapeRate = d.rapeRate.map(d=>parseInt(d))
  })
  
  data.map(function (d) {
  	return d.population = d.population.map(d=>parseInt(d))
  })
    
  data.map(function (d) {
  	return d.murderRate = d.murderRate.map(d=>parseInt(d))
  })

	data.map(function (d) {
  	return d.crimeRate = d.crimeRate.map(d=>parseInt(d))
  })

	data.map(function (d) {
  	return d.assaultRate = d.assaultRate.map(d=>parseInt(d))
  })


  var yearList = data[0].year;  

  /*create the inital bubble chart*/
	var circleGroup = bubbleChartGroup.selectAll(".circle")
		.data(interpolateData(1976)) /*bind first year's data*/
		.enter()
		.append("circle")
		.attr("class", "circle")
		.attr("r", data=>radiusScale_b(data.population))
		.attr("cx", data=>xScale_b(data.crimeRate))
		.attr("cy", data=>yScale_b(data.unemploymentRate))
		.attr("opacity",.8)
		.style("fill", data=>colorScale_b(data.category))
		.sort(order); /*sort the bubbles based on radius so that smaller bubbles are always on top of larger bubbles*/

	/*add events for bubbles*/
  circleGroup.on("mouseover",function (data){
		toolTip_b.show(data);
	});

	circleGroup.on("mouseout",function (data){
		toolTip_b.hide(data);
	});	
/*==============================================*/
/*	circleGroup.on("click", datum => {
		console.log(datum);
	});*/

/*	circleGroup.on("click", function (d) {
		console.log(label.text());
	});*/
  circleGroup.on("click", function (d) {
		/*dataFilter(d.stateCode);*/
		var selectedYear = label_b.text();
		var selectedState = d.stateName;
		var totalCrime = Math.round(d.crimeRate);

		var crimeBreakdown = [
			{type:"Murder",value:Math.round(d.murderRate)},
			{type:"Rape",value:Math.round(d.rapeRate)},
			{type:"Robbery",value:Math.round(d.robberyRate)},
			{type:"Assault",value:Math.round(d.assaultRate)}
		];
		var sortedBreakdown = crimeBreakdown.sort(function(a,b){
			return b.value - a.value;
		});
		console.log("captured: ",d);
		/*console.log("captured: ",d.murderRate);*/
		
		extraChart(selectedYear,selectedState,sortedBreakdown);
	});

  
/*==============================================*/
	/*define function to sort the bubbles based on radius*/
  function radius(d) { return d.population; }
  function order(a, b) { return radius(b) - radius(a); } /*sort in descending order*/
  	
	/*add an overlay on top of year label*/
  var box_b = label_b.node().getBBox();
  var overlay_b = bubbleChartGroup.append("rect")
		.attr("class", "overlay_b")
		.attr("x", box_b.x)
		.attr("y", box_b.y)
		.attr("width", box_b.width)
		.attr("height", box_b.height-30)
		.on("mouseover", enableInteraction);
  
  /*define a function to start transition of bubbles*/
  function animate() {
	if (d3.select("#barChart")) {
		d3.select("#barChart").remove();
	}

	if (d3.select("#pieChart")) {
		d3.select("#barChart").remove();
	}

	hideButton();

	bubbleChartGroup.transition()
	.duration(30000)
	.ease(d3.easeLinear)
	.tween("year",tweenYear); /*use tween method to create transition frame by frame*/
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
  	label_b.text(Math.round(year)); /*update year label, since year could be a fraction of years, round it to the whole year number*/
  	circleGroup
      /*bind new data interpolated from the dataset based on the tween year, and use key to match up with existing bound data*/
  		.data(interpolateData(year),key) 
  		.attr("r", data=>radiusScale_b(data.population))
  		.attr("cx", data=>xScale_b(data.crimeRate))
  		.attr("cy", data=>yScale_b(data.unemploymentRate))
  		.attr("opacity",.8)
  		.style("fill", data=>colorScale_b(data.category))
  		.sort(order)
  }

  /*define a function to interpolate the dataset for the given (fractional) year*/
  function interpolateData(year) {
    return data.map(function(d) {
      return {
        stateCode: d.stateCode,
        stateName: d.stateName,
        category: d.category[yearList.indexOf(Math.round(year))],
        unemploymentRate: interpolateValues(d.unemploymentRate, year),
        population: interpolateValues(d.population, year),
        crimeRate: interpolateValues(d.crimeRate, year),
        murderRate: interpolateValues(d.murderRate, year),
        rapeRate: interpolateValues(d.rapeRate, year),
        robberyRate: interpolateValues(d.robberyRate, year),
        assaultRate: interpolateValues(d.assaultRate, year),
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
	.range([box_b.x + 10, box_b.x + box_b.width - 10])
	.clamp(true); /*use clamp method so that cannot go out of the range boundary*/

  	/*cancel the current transition, if any.*/
  	bubbleChartGroup.transition().duration(0);

  	/*when mouse move over the overlay, change the year based on the mouse position, and update the bubble chart accordingly*/
    overlay_b.on("mousemove", mousemove)
    
    function mousemove() { updateChart(yearScale.invert(d3.mouse(this)[0])); }
  }	

  /*create a play button to start animation for demo*/
  var playButton = d3.select("#playButton");
  playButton
    .text("Play")
    .style("color", "#4682B4")
    .style("font-weight", "bold")
    .style("font-family", "Helvetica Neue");

  playButton.on("click",animate);







});


  /*=======================================*/
  /*function dataFilter(stateCode) {
  	console.log(bubbleData.filter(d=>d.stateCode == stateCode));
  }

});*/
	function extraChart(clickedYear, clickedState, clickedData) {
		/*define svg container dimensions for extra bar chart and pie chart*/
		console.log("display: ",clickedData)
		if (document.querySelector("#barChart")) { 
			d3.select("#barChart").remove()
			createBar();
		} else if (document.querySelector("#pieChart")) { 
			d3.select("#pieChart").remove()
			createPie();
		} else {
			createBar();
		};	

		function createBar(){
			valueCount = clickedData.map(d=>d.value).length;

			var svgWidth_e = 400;
			var svgHeight_e = 400;

			/*define margins around extra chart area*/
			var margin_e = {
			  top: 60,
			  right: 50,
			  bottom: 240,
			  left: 70
			};

			/*calculate extra chart area dimensions*/
			var width_e = svgWidth_e - margin_e.left - margin_e.right;
			var height_e = svgHeight_e - margin_e.top - margin_e.bottom;

			/*create the SVG container and set the origin point of extra chart*/
			var svg_e = d3.select("#extra_Chart").append("svg")
			  .attr("id","barChart")
			  .attr("width", svgWidth_e)
			  .attr("height", svgHeight_e)


			var extraTitle = svg_e.append("g").append("text")
			  .attr("class", "extra title")
			  .attr("text-anchor", "middle")
			  .attr("x", width_e *2 / 3)
			  .attr("y", 20)
			  .style("font-weight", "bold")
			  .style("font-size", "15px")
			  .text("Breakdown of Violent Crimes")

			var extraTitle = svg_e.append("g").append("text")
			  .attr("class", "extra title")
			  .attr("text-anchor", "middle")
			  .attr("x", width_e *2 / 3)
			  .attr("y", 40)
			  .style("font-weight", "bold")
			  .style("font-size", "13px")
			  .text(`${clickedState}, Year ${clickedYear}`)
			  
			



			var extraChartGroup = svg_e.append("g")
			  .attr("transform", `translate(${margin_e.left}, ${margin_e.top})`)
			  .attr("class","extra chart")


			/*configure a band scale for the y axis with a padding of 0.1 (10%)*/
			var yBandScale_e = d3.scaleBand()
				.domain(clickedData.map(d => d.type))
				.range([height_e,0])
				.paddingInner(0.05)


			/*create a linear scale for the x axis*/
			var xLinearScale_e = d3.scaleLinear()
				.domain([0, d3.max(clickedData.map(d => d.value))])
				.range([0,width_e])

			var leftAxis_e = d3.axisLeft(yBandScale_e);

			extraChartGroup.selectAll("rect")
			  .data(clickedData)
			  .enter()
			  .append("rect")
			  .attr("width", d => xLinearScale_e(d.value))
			  .attr("height", yBandScale_e.bandwidth())
			  .attr("x", 0)
			  .attr("y", function(data,index) {
			    return index * (yBandScale_e.bandwidth() + 1);
			  })
			  .attr("class", "bar")
			  .attr("fill","#4682B4");

			
			extraChartGroup.append("g")
			  .attr("class", "axisHidden")
			  .style("font-size", "10px")
			  .style("font-weight", "bold")
			  .call(leftAxis_e);

			extraChartGroup.append("g").selectAll("text")
			  .data(clickedData)
			  .enter()
			  .append("text")
			  .attr("class","values")
			  .attr("x",d => xLinearScale_e(d.value) + 5)
			  .attr("y",function(data,index) {
			    return index * height_e / valueCount + 5 + yBandScale_e.bandwidth() / 2;
			  })
			  .text(d=>d.value)
			  .style("font-size", "10px");


		}

		function createPie(){

			var svgWidth_e = 400;
			var svgHeight_e = 400;

			/*define margins around extra chart area*/
			var margin_e = {
			  top: 30,
			  right: 50,
			  bottom: 40,
			  left: 70
			};

			/*calculate extra chart area dimensions*/
			var width_e = svgWidth_e - margin_e.left - margin_e.right;
			var height_e = svgHeight_e - margin_e.top - margin_e.bottom;

			radius = Math.min(width_e, height_e) / 2;

			var color = d3.scaleOrdinal()
    			.range(["#98abc5", "#7b6888", "#a05d56", "#ff8c00"]);

			var arc = d3.arc()
				.outerRadius(radius - 40)
				.innerRadius(radius - 100)
				.cornerRadius(3)
                .padAngle(.01);

            var labelArc = d3.arc()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.9);

			var pie = d3.pie()
			    .value(function(d) { return d.value; });

			/*create the SVG container and set the origin point of extra chart*/
			var svg_e = d3.select("#extra_Chart").append("svg")
			  .attr("id","pieChart")
			  .attr("width", svgWidth_e)
			  .attr("height", svgHeight_e)


			var extraTitle = svg_e.append("g").append("text")
			  .attr("class", "extra title")
			  .attr("text-anchor", "middle")
			  .attr("x", width_e *2 / 3)
			  .attr("y", 20)
			  .style("font-weight", "bold")
			  .style("font-size", "15px")
			  .text("Breakdown of Violent Crimes")

			var extraTitle = svg_e.append("g").append("text")
			  .attr("class", "extra title")
			  .attr("text-anchor", "middle")
			  .attr("x", width_e *2 / 3)
			  .attr("y", 40)
			  .style("font-weight", "bold")
			  .style("font-size", "13px")
			  .text(`${clickedState}, Year ${clickedYear}`)
			  
			



			var extraChartGroup = svg_e.append("g")
			  .attr("transform", `translate(${width_e / 2 + 50}, ${height_e / 2 + 20})`)
			  .attr("class","extra chart")


			extraChartGroup.selectAll(".arc")
			  .data(pie(clickedData))
			  .enter()
			  .append("g")
			  .attr("class", "arc")
			  .append("path")
			      .attr("d", arc)
			      .style("fill", function(d) { return color(d.data.type); });


			extraChartGroup.append("g").selectAll("text")
			  .data(pie(clickedData))
			  .enter()
			  .append("text")
			  .attr("class","values")
			  .attr('dy', '.8em')
			  .attr('transform', function(d) {

                    // effectively computes the centre of the slice.
                    // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                    var labelPosition = labelArc.centroid(d);

                    // changes the point to be on left or right depending on where label is.
                    /*labelPosition[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);*/
                    return `translate(${labelPosition})`;
                })
			  .text(d=>d.data.type)
			  .style('text-anchor', function(d) {
                    // if slice centre is on the left, anchor text to start, otherwise anchor to end
                    return (midAngle(d)) < Math.PI ? 'start' : 'end';
                });

			  // calculates the angle for the middle of a slice
            function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

		}

	var selectedChart = d3.select("#extra_Chart");
	selectedChart
		.on("mouseover", showButton)
		.on("mouseout", hideButton);
	
	d3.select("#barButton").on("click",changeBarChart);
	d3.select("#pieButton").on("click",changePieChart);


	function changeBarChart() {
		if (document.querySelector("#pieChart")) {
			d3.select("#pieChart").remove()
			createBar();
		}
	};

	function changePieChart() {
		if (document.querySelector("#barChart")) {
			d3.select("#barChart").remove()
			createPie();
		}
	};


	}

	function showButton() {
	d3.select("#barButton")
		.classed("inactive",false)
		.classed("active", true);
	d3.select("#pieButton")
		.classed("inactive",false)
		.classed("active", true);
	} 

	function hideButton() {
	d3.select("#barButton")
		.classed("active",false)
		.classed("inactive", true);
	d3.select("#pieButton")
		.classed("active",false)
		.classed("inactive", true);
	} 