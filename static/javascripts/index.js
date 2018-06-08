/*Provide a reminder message to users so that they know how to start the animimations.  Delay the message by one second*/
setTimeout(reminder,1000);

function reminder() { alert("Just a reminder: you can click the title to start the animation, and click each bubble to see additional charts.") }

/*get the width of the window based on users device*/
var windowWidth = window.innerWidth;

/*
since the dashboard is designed to show multiple charts in a single page, the desired screen size is large.
used the breakpoint of 992px as defined in the boot strap 4 grid system for large device.
if the screen size is greater than 992px, the page will be devided into two columns.  Left column is used
for the bubble chart, and the right column is used for the bar chart, pie chart and map section.
if the screen size is less than 992px, the bubble charts will use all the width of the screen.
*/

/*
define svg container dimensions for bubble chart and extra chart areas
since bootstrap columns are used in html, padding left = padding right = 15px, need to reduce window width by 30px.
*/
if (windowWidth > 992) {
	var svgwidth_bubbleChart = (windowWidth - 30) / 12 * 6.5;
	var svgWidth_extraChart = (windowWidth -30) / 12 * 4;
} else {
	var svgwidth_bubbleChart = windowWidth - 30;
	var svgWidth_extraChart = windowWidth -30;
};


/*keep the width and height of the bubble chart as 16:9 and extra chart 2:1 or 5:2 if smaller device*/
var svgheight_bubbleChart = svgwidth_bubbleChart /16 * 9;

var svgHeight_extraChart = svgWidth_extraChart / (windowWidth > 992? 2 : 2.5)


/*
the dashboard was designed based on my computer screen which has width of 1536px.  When it is displayed on other devices,
the fonts and chart dimensions need to be adjusted according to the users screen size.  if large screen,
the baseline screen size is 1536px, if smaller, then use 992px as the baseline screen size.  use ternary operator
to calculate the adjustment ratio.
*/
var screenRatio = windowWidth / (windowWidth > 992? 1536 : 992);

/*adjust the text font size in the title and footer sections.  32px and 20px are the original font size that fit on my computer screen.*/
document.querySelector("#title").style.fontSize = 32 * screenRatio + "px";
document.querySelector("#teamSection").style.fontSize = 20 * screenRatio + "px";

/*
====================================================================================================
codes for bubble chart
*/

/*create the initial bubble chart with all states data in year 1976*/
createBubbleChart(1976,"all_states");

/*define a function to generate bubble chart based on the input of year and state name*/
function createBubbleChart(year,scope) {	
	/*check if bubble chart already exist.  if so, remove it and create a new chart*/
	if (d3.select("#bubbleChart")) {
		$("#bubbleChart").remove(); /*tested with jQuery code... originally used d3.js code: d3.select("#bubbleChart").remove();*/
	};
	
	/*define margins around bubble chart area*/
	var margin_bubbleChart = {
	  top: 40 * screenRatio,
	  right: 40 * screenRatio,
	  bottom: 40 * screenRatio,
	  left: 40 * screenRatio
	};

	/*calculate bubble chart area dimensions*/
	var width_bubbleChart = svgwidth_bubbleChart - margin_bubbleChart.left - margin_bubbleChart.right;
	var height_bubbleChart = svgheight_bubbleChart - margin_bubbleChart.top - margin_bubbleChart.bottom;

	/*create the SVG container and set the origin point of bubble chart*/
	var svg_bubbleChart = d3.select("#bubbleChartSection").append("svg")
	  .attr("id","bubbleChart")
	  .attr("width", svgwidth_bubbleChart)
	  .attr("height", svgheight_bubbleChart);
	    
	var bubbleChartGroup = svg_bubbleChart.append("g")
	  .attr("transform", `translate(${margin_bubbleChart.left}, ${margin_bubbleChart.top})`);


	/*define various scales used for x axis, y axis, radius of bubbles and color of bubbles*/

	/*
	since the crime rate on x axis are close in a small range, use the log scale so the bubbles will not be displayed too closely.
	adjust the range of the x scale based on user screen size so that x axis will have 20px margin to the right when displaying on smaller devices.
	*/
	var xScale_bubbleChart = d3.scaleLog().domain([40, 3000]).range([0, width_bubbleChart - (windowWidth > 992? 0 : 20)]); 
	
	var yScale_bubbleChart = d3.scaleLinear().domain([0, 18]).range([height_bubbleChart, 0]);
	
	/*
	use square root scale to scale on large population numbers.
	adjust the bubble size based on user screen size.
	*/
	var radiusScale_bubbleChart = d3.scaleSqrt().domain([0, 4e7]).range([0, 40 * screenRatio]);
	
	/*if all states data are selected, use d3 ordinal color scale (schemeCategory10) for each state*/
	if(scope == "all_states") {
		var colorScale_bubbleChart = d3.scaleOrdinal(d3.schemeCategory10);
	/*
	when a particular state is selected and passed as the input, use two color scale to single out the state selected.
	if selected, show in red, otherwise, make it transparent.  the first color in the range will always be assigned to
	the first state in the dataset.  since Alaska is the first state in the dataset, need to reverse the color list so
	that when Alaska is selected, it will be displayed in red.
	*/
	} else if (scope == "Alaska") {
		var colorScale_bubbleChart = d3.scaleOrdinal()
							.range(["red","transparent"]);
	} else {
		var colorScale_bubbleChart = d3.scaleOrdinal()
							.range(["transparent","red"]);
	};


	/*define x and y axis for bubble chart*/
	var bottomAxis_bubbleChart = d3.axisBottom(xScale_bubbleChart);
	bottomAxis_bubbleChart.ticks(10, d3.format(",d")); /*make x axis tick show in integers on a log scale*/

	var leftAxis_bubbleChart = d3.axisLeft(yScale_bubbleChart).ticks(10);

	/*add x and y axis*/
	bubbleChartGroup.append("g")
	  .attr("class", "x axis")
	  .attr("transform", `translate(0,${height_bubbleChart})`)
	  .call(bottomAxis_bubbleChart);

	bubbleChartGroup.append("g")
	  .attr("class", "y axis")
	  .call(leftAxis_bubbleChart);

	/*add x and y axis labels*/
	bubbleChartGroup.append("text")
	  .attr("class", "x label")
	  .attr("text-anchor", "end")
	  .style("font-size", 16 * screenRatio + "px")
	  .attr("x", width_bubbleChart - (windowWidth > 992? 0 : 20)) /*when displaying on smaller device, leave 20 px margin to the right*/
	  .attr("y", height_bubbleChart - 6)
	  .text("Violent crime rate per 100,000 population");

	bubbleChartGroup.append("text")
	  .attr("class", "y label")
	  .attr("text-anchor", "end")
	  .style("font-size", 16 * screenRatio + "px")
	  .attr("y", 6)
	  .attr("dy", ".75em")
	  .attr("transform", "rotate(-90)")
	  .text("Unemployment rate (%)");

	/*add year label*/
	var label_bubbleChart = bubbleChartGroup.append("text")
	  .attr("class", "yearLabel")
	  .attr("text-anchor", "end")
	  .style("font-size", 160 * screenRatio + "px")
	  .attr("x", parseInt(margin_bubbleChart.left) + width_bubbleChart / 2)
	  .attr("y", parseInt(margin_bubbleChart.top) + height_bubbleChart / 8)
	  .text(year);

	/*use d3-tip library to create tooltips*/ 
	var toolTip_bubbleChart = d3.tip()
	  .attr('class', 'd3-tip')
	  .direction('s')
	  .html(function(data) {
	    return `<strong>${data.stateName}</strong> <hr> <strong>Population:&nbsp&nbsp&nbsp </strong>` 
	      + parseInt(`${data.population}`).toLocaleString() /*format population data with thousand seperators*/
	      + "<br><strong>Unemployment rate:&nbsp&nbsp&nbsp</strong>"
	      + parseFloat(`${data.unemploymentRate}`).toFixed(2) + "% <br> <strong>Violent Crime Rate:&nbsp&nbsp&nbsp </strong>" /*show 2 digits*/
	      + parseFloat(`${data.crimeRate}`/100000*100).toFixed(2) + "%" /*show 2 digits*/
	  });

	/*add tooltips*/
	bubbleChartGroup.call(toolTip_bubbleChart);

	/*load data from chartdata route defined in flask codes*/
	var routeURL = "/chartdata"
	d3.json(routeURL, function(data) {
	  /*convert data elements to integers*/
	  	data.map(function (d) { return d.year = d.year.map(d=>parseInt(d)) })
	  	data.map(function (d) { return d.unemploymentRate = d.unemploymentRate.map(d=>parseInt(d)) })
	  	data.map(function (d) { return d.robberyRate = d.robberyRate.map(d=>parseInt(d)) })
	  	data.map(function (d) { return d.rapeRate = d.rapeRate.map(d=>parseInt(d)) })
	  	data.map(function (d) { return d.population = d.population.map(d=>parseInt(d)) })
	  	data.map(function (d) { return d.murderRate = d.murderRate.map(d=>parseInt(d)) })
	  	data.map(function (d) { return d.crimeRate = d.crimeRate.map(d=>parseInt(d)) })
	  	data.map(function (d) { return d.assaultRate = d.assaultRate.map(d=>parseInt(d)) })

	  
	  	/*when a specific state is passed as input, update the category to be either "selectedState" or "notSelectedState"*/
	  	if(scope != "all_states") {
		  	data.map(function (d) {
		  		if (d.stateName == scope) {
				  	var newCategory = d.category.map(function(data) {
				  		return "selectedState"
				  		})
				  	d.category = newCategory;
				} else {
				  	var newCategory = d.category.map(function(data) {
				  		return "notSelectedState"
				  	})
				  	d.category = newCategory;
				};
		  	})
		};

	    /*extract a list of years from the dataset*/
	  	var yearList = data[0].year;  

	    /*create bubbles*/
		var circleGroup = bubbleChartGroup.selectAll(".circle")
			.data(interpolateData(year))
			.enter()
			.append("circle")
			  .attr("class", "circle")
			  .attr("r", data=>radiusScale_bubbleChart(data.population))
			  .attr("cx", data=>xScale_bubbleChart(data.crimeRate))
			  .attr("cy", data=>yScale_bubbleChart(data.unemploymentRate))
			  .attr("opacity",.8)
			  .style("fill", data=>colorScale_bubbleChart(data.category))
			  .sort(order); /*sort the bubbles based on radius so that smaller bubbles are always on top of larger bubbles*/

		/*add events for bubbles*/
	    circleGroup.on("mouseover",function (data){
			toolTip_bubbleChart.show(data);
		});

		circleGroup.on("mouseout",function (data){
			toolTip_bubbleChart.hide(data);
		});	

	    circleGroup.on("click", function (d) {
			var selectedYear = label_bubbleChart.text();			
			var selectedState = d.stateName;
			/*create crime breakdown data to pass to extra chart functions*/
			var crimeBreakdown = [
				{type:"Murder", value:Math.round(d.murderRate), percent:Math.round(d.murderRate) / Math.round(d.crimeRate)},
				{type:"Rape", value:Math.round(d.rapeRate), percent:Math.round(d.rapeRate) / Math.round(d.crimeRate)},
				{type:"Robbery", value:Math.round(d.robberyRate), percent:Math.round(d.robberyRate) / Math.round(d.crimeRate)},
				{type:"Assault", value:Math.round(d.assaultRate), percent:Math.round(d.assaultRate) / Math.round(d.crimeRate)}
				];
			var sortedBreakdown = crimeBreakdown.sort(function(a,b){
				return b.value - a.value;
			});
			
			/*when one of the bubbles or state selected, hide the tooltips and re-create the bubble chart with the selected year and state*/
			toolTip_bubbleChart.hide(data);
			createBubbleChart(selectedYear,selectedState);
			
			/*since it takes a few seconds to re-create the bubble chart, delay the creation of extra charts and displaying maps*/
			setTimeout(function(){
				extraChart(selectedYear,selectedState,sortedBreakdown);
				showMap(selectedYear,selectedState,sortedBreakdown);
			},1500)
		});

		/*define functions to sort the bubbles based on radius so that alway draw smaller bubbles on top of bigger bubbles*/
	    function radius(d) { return d.population; }
	    function order(a, b) { return radius(b) - radius(a); } /*sort in descending order*/
	  
	 	/*define x and y positions of legends for the bubble chart*/
	 	var legendX = width_bubbleChart - (windowWidth > 992? 105 * screenRatio : 140 * screenRatio);
	 	var legendY = height_bubbleChart - (windowWidth > 992? 110 : 90);
		
		/*create 4 legends with different size of bubble and different colors that match to the bubble chart*/
		var legendData = [
		 	{radius:8,x:legendX,y:legendY,category:"population >10m"},
		 	{radius:6,x:legendX,y:legendY + 25,category:"population 5-10m"},
		 	{radius:4,x:legendX,y:legendY + 47,category:"population 1-5m"},
		 	{radius:3,x:legendX,y:legendY + 65,category:"population <1m"}
		 	]
		var legendColor = d3.scaleOrdinal()
	    			.range(["green", "red", "orange", "RoyalBlue"]);
	
	 	/*only add legend to the bubble chart when all states data are used initially to create the bubble chart*/
	 	if(scope == "all_states") {
		 	var legendGroup = bubbleChartGroup.selectAll(".legend")
				.data(legendData)
				.enter()
				.append("circle")
				  .attr("class", "legend")
				  .attr("r", data=>data.radius)
				  .attr("cx", data=>data.x)
				  .attr("cy", data=>data.y)
				  .attr("opacity",.8)
				  .style("fill", data=>legendColor(data.category))

			var legendLable = bubbleChartGroup.selectAll(".legendLable")
				.data(legendData)
				.enter()
				.append("text")
				  .attr("class", "legendLable")
				  .attr("x", data=>data.x + 15) /*adjust the label's position to align with legends*/
			      .attr("y", data=>data.y + 2) /*adjust the label's position to align with legends*/
			      .text(data=>data.category)
			      .style("font-size", 12 * screenRatio + "px")
		}

		/*add an overlay on top of year label so that mouse can move over it and trigger interaction events*/
	    var box_bubbleChart = label_bubbleChart.node().getBBox();
	    var overlay_bubbleChart = bubbleChartGroup.append("rect")
		  .attr("class", "overlayBox")
		  .attr("x", box_bubbleChart.x)
		  .attr("y", box_bubbleChart.y)
		  .attr("width", box_bubbleChart.width)
		  .attr("height", box_bubbleChart.height-30)
		  .on("mouseover", enableInteraction);
			

	    /*define a function to animate the movements of bubbles*/
	    function animate() {

			bubbleChartGroup.transition()
				.duration(30000)
				.ease(d3.easeLinear) /*use linear transition*/
				.tween("year",tweenYear); /*use customized tween method to create transitions frame by frame*/

			/*show observations text only after the animation is completed*/
			setTimeout(showObservation, 30500);

			function showObservation() {
				/*change the color of text so that they become visible*/
				d3.selectAll("#observationSection")
					.style("color","black");
				d3.selectAll("#observations")
					.style("color","red");
			}
	    }

	    /*define a function to interpolate a year (or a fraction of year, t) from the list of years, and it is used to create transition frames*/
	    function tweenYear() {
		  	var year = d3.interpolateNumber(1976,2014);
		    return function(t) { updateChart(year(t)); };
	    }
	    
	    /*define state code as the key to match up existing data already bound to circles and new data to be bound to circles*/
	    function key(data) { return data.stateCode; }

	    /*define a function to update bubble charts during the transition*/
	    function updateChart(year) {
		  	label_bubbleChart.text(Math.round(year)); /*update year label, since year could be a fraction of years, round it to the whole year number*/
		  	circleGroup
		      /*bind new data interpolated from the dataset based on the tweenYear, and use key to match up with existing bound data*/
		  		.data(interpolateData(year),key) 
		  		  .attr("r", data=>radiusScale_bubbleChart(data.population))
		  		  .attr("cx", data=>xScale_bubbleChart(data.crimeRate))
		  		  .attr("cy", data=>yScale_bubbleChart(data.unemploymentRate))
		  		  .attr("opacity",.8)
		  		  .style("fill", data=>colorScale_bubbleChart(data.category))
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
			.range([box_bubbleChart.x + 10, box_bubbleChart.x + box_bubbleChart.width - 10])
			.clamp(true); /*use clamp method so that cannot go out of the range boundary*/

		  	/*cancel the current transition, if any.*/
		  	bubbleChartGroup.transition().duration(0);

		  	/*when mouse move over the overlay box, change the year based on the mouse position, and update the bubble chart accordingly*/
		    overlay_bubbleChart.on("mousemove", mousemove)
		    
		    function mousemove() {
		    	updateChart(Math.round(yearScale.invert(d3.mouse(this)[0]))); }
	    }	

	    /*add click event for the title to start animation of the bubble movements*/
		d3.select("#title").on("click",animate);

	});
}

/*
====================================================================================================
codes for extra charts, including bar chart and donut(pie) chart
*/

function extraChart(clickedYear, clickedState, clickedData) {
	/*define svg container dimensions for extra bar chart and pie chart*/
	
	/*check if existing bar chart or pie exist.  if so, remove them and create new bar chart*/
	if (document.querySelector("#barChart")) { 
		d3.select("#barChart").remove()
		createBar();
	} else if (document.querySelector("#pieChart")) { 
		d3.select("#pieChart").remove()
		createBar();
	} else {
		createBar();
	};	

	/*define function to create bar chart*/
	function createBar(){
		
		/*get the # of values in the clicked dataset*/
		valueCount = clickedData.map(d=>d.value).length;

		/*define margins around extra chart area*/
		var margin_extraChart = {
		  top: 60 * screenRatio,
		  right: 90 * screenRatio,
		  bottom: 100 * screenRatio,
		  left: 100 * screenRatio
		};

		/*calculate extra chart area dimensions*/
		var width_extraChart = svgWidth_extraChart - margin_extraChart.left - margin_extraChart.right;
		var height_extraChart = svgHeight_extraChart - margin_extraChart.top - margin_extraChart.bottom;

		/*create the SVG container and set the origin point of extra chart*/
		var svg_extraChart = d3.select("#extraChartSection").append("svg")
		  .attr("id","barChart")
		  .attr("width", svgWidth_extraChart)
		  .attr("height", svgHeight_extraChart);

		var extraChartGroup = svg_extraChart.append("g")
		  .attr("transform", `translate(${margin_extraChart.left}, ${margin_extraChart.top})`)
		  .attr("class","extraChart");  

		/*add titles to the extra chart area*/
		var extraTitle = svg_extraChart.append("g").append("text")
		  .attr("class", "extra title")
		  .attr("text-anchor", "middle")
		  .attr("x", (width_extraChart + margin_extraChart.left) / 2 + 50 * screenRatio)
		  .attr("y", 20 * screenRatio)
		  .style("font-weight", "bold")
		  .style("font-size", 20 * screenRatio + "px")
		  .text("Breakdown of Violent Crimes");

		var extraTitle = svg_extraChart.append("g").append("text")
		  .attr("class", "extra title")
		  .attr("text-anchor", "middle")
		  .attr("x", (width_extraChart + margin_extraChart.left) / 2 + 50 * screenRatio)
		  .attr("y", 40 * screenRatio)
		  .style("font-weight", "bold")
		  .style("font-size", 16 * screenRatio + "px")
		  .text(`${clickedState}, Year ${clickedYear}`);
			  
		


		/*configure a band scale for the y axis with a padding of 0.1 (10%)*/
		var yBandScale_extraChart = d3.scaleBand()
			.domain(clickedData.map(d => d.type).reverse())
			.range([height_extraChart,0])
			.paddingInner(0.01);


		/*create a linear scale for the x axis*/
		var xLinearScale_extraChart = d3.scaleLinear()
			.domain([0, d3.max(clickedData.map(d => d.value))])
			.range([0,width_extraChart]);

		/*add y axis*/
		var leftAxis_extraChart = d3.axisLeft(yBandScale_extraChart);

		/*assign data to donut(pie) chart*/
		var pie = d3.pie()
	        .value(d => d.value)

	    /*define arc to create the donut chart*/
	    var arc = d3.arc()
	    	.cornerRadius(3)

		/*create color scale for extra charts */
		var colorScale_extraChart = d3.scaleOrdinal()
			.range(["#98abc5", "#7b6888", "#a05d56", "#ff8c00"]);

		/*bind data to bars*/
		var bars = extraChartGroup.selectAll(".barGroup")
		    .data(function() {
	            return pie(clickedData);
	        	})
		    .enter()
		    .append("g")
		      .attr("class", "barGroup");

		/*create bars*/
		bars.append("rect")
		  .attr("width", 0)
		  .attr("height", yBandScale_extraChart.bandwidth())
		  .attr("x", 0)
		  .attr("y", function(data,index) {		  
		    	return index * (yBandScale_extraChart.bandwidth() + 1);
		  	})
		  .attr("rx",5)
		  .attr("yx",5)
		  .style("fill",function(d) {
		            return colorScale_extraChart(d.data.type);
		    })
		  .attr("class","bar")
		  .on("mouseover", function() {highlight(d3.select(this))} )
		  .on("mouseout", function() {unhighlight(d3.select(this))} )
		  .transition()
		  	.duration(500)
		  	.attr("width", d => xLinearScale_extraChart(d.data.value))

		/*add the path of the bars and use it to draw donut chart*/
		extraChartGroup.selectAll(".barGroup")
			.append("path")
	        .style("fill",function(d) {
		            return colorScale_extraChart(d.data.type);
		        })

		addBarAxis();

		/*define a function to add y axis to the bar chart*/
		function addBarAxis () {
			extraChartGroup.append("g")
			  .attr("class", "barYAxis")
			  .style("font-size", 13 * screenRatio + "px")
			  .call(leftAxis_extraChart);
		}
			
		/*show bar values half second later after the bars are created*/
		setTimeout(addBarValues, 500);

		/*define a function to add values to the bar chart*/
		function addBarValues () {
			extraChartGroup.append("g").selectAll("text")
			    .data(clickedData)
			    .enter()
			    .append("text")
		  		  .attr("class","barValues")
			  	  .style("font-size", 11 * screenRatio + "px")
			  	  .attr("x",d => xLinearScale_extraChart(d.value) + 5)
			  	  .attr("y",function(data,index) {
					    return index * height_extraChart / valueCount + 5 + yBandScale_extraChart.bandwidth() / 2;
					  })
			  	  .text(d=>d.value + " per 100K")
		}
			
		/*define a function to switch to donut(pie) chart when the Pie button is clicked*/
		function toPie() {
			/*remove bar chart if it exists*/
			if (document.querySelector("#barChart")) {
				d3.selectAll(".bar").remove();
				d3.selectAll(".barYAxis").remove();
				d3.selectAll(".barValues").remove();
				
				/*use the bar chart's path to start the transition to donut(pie) chart*/
				extraChartGroup.selectAll("path")
			        .transition()
			        .duration(500)
			        .tween("arc", arcTween);

			    /*
			    define the function used to do tween on arc.
			    
			    credits to https://bl.ocks.org/LiangGou/30e9af0d54e1d5287199, codes have been modified.

			    the idea here is to first draw an arc like a bar,
			    then tween the bar-like arc to the donut arc. 
				Thus, the key is to find the initial bar size and position:
				The initial bar width is approximated by the length of 
				outside arc: barWidth = OuterRadius * startAngle. 
				So we can get the startAngle shown in arcArguments below;
				(Note that: the measure of angle in d3 starts from vertical y:
				 y    angle
				 |    /   
				 |   /        
				 |  /             
				 |o/
				 |/      
				 )   

				*/
			    function arcTween(d) {			      
			        /*define the path of each tween*/
			        var path = d3.select(this);
			        /*get the starting y position of each bar*/
			        var y0 = d.index * yBandScale_extraChart.bandwidth();
			     
			        return function(t) {
			            /*t starts from 0 and ends with 1.  Use cosine to calculate a, a stepping factor that changes from 1 to 0*/
			            var a = Math.cos(t * Math.PI / 2);
			            /*define radius r as a function of chart height.  at the beginning, t is 0 so r is very big, which can render 
			            the arc like a bar.  when t changes to 1, r is reduced to chart height or 1/2 of height based on device screen size*/
			            var r = (1 + a) * height_extraChart / (windowWidth > 992? 1 : 2) / Math.min(1, t + .005);
			            /*define xx and yy as the central position of arc, and xx and yy change with stepping factor a, until it becomes
			            (1/2 of width, height)*/
			            var yy = r + a * y0;
			            var xx = ((1 - a) * width_extraChart / 2);
			            
			            /*define arguments used to create arc*/
			            var arcArguments = {
			                    /*inially the delta between inner and outer radius is the bandwidth or height of bar */
			                    innerRadius: (1-a) * r * .5 + a * (r - yBandScale_extraChart.bandwidth()),
			                    outerRadius: r,
			                    /*start and end angle come from d3.pie() created earlier when data was bound to bars, and keeps changing 
			                    with stepping factor a*/
			                    startAngle: (1 - a) * d.startAngle,
			                    endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
			                };

			            /*shift the central locations of the arc and generate the arc*/
			            path.attr("transform", `translate(${xx},${yy})`);
			            path.attr("d", arc(arcArguments));
			            
			            /*create events on the path*/
			            path.on("mouseover",showSliceInfo);
			            path.on("mouseout",hideSliceInfo);

					    /*define a function to highlight and display info of each bar or slice of donut chart when moused over*/
					    function showSliceInfo() {
							/*for donut/pie chart, highlight the selection and show relevant info*/
							if(document.querySelector("#pieChart")) {
								var slice = d3.select(this)
									.attr("stroke","#fff")
		              				.attr("stroke-width","2px");
								/*get the index of which slice has been selected*/
								var sliceIndex = (slice._groups[0][0].__data__.index);
								var sliceType = clickedData[sliceIndex].type;
								var slicePercent = clickedData[sliceIndex].percent;
								
								/*display info of highlighted slice*/
								svg_extraChart.append("g").append("text")
								  .attr("class", "crimeType")
								  .attr("text-anchor", "middle")
								  .style("font-size", 18 * screenRatio + "px")
								  .attr("x", 256 * windowWidth / (windowWidth > 992? 1536 : 992 / 1.85))
								  .attr("y", 148 * windowWidth / (windowWidth > 992? 1536 : 992 / 1.1))
								  .text(`${sliceType}`);

								svg_extraChart.append("g").append("text")
								  .attr("class", "crimePercent")
								  .attr("text-anchor", "middle")
								  .style("font-size", 14 * screenRatio + "px")
								  .attr("x", 256 * windowWidth / (windowWidth > 992? 1536 : 992 / 1.85))
								  .attr("y", 168 * windowWidth / (windowWidth > 992? 1536 : 992 / 1.1))
								  .text(function () {
								  	return d3.format(".1%")(`${slicePercent}`);
								  	});

							/*for bar charts, just highlight the selected bar*/
							} else {
								var selection = d3.select(this);
								highlight(selection);
							}
						}

						/*define a function to remove highlight and info when mouse out*/
						function hideSliceInfo() {
							if(document.querySelector("#pieChart")) {
								var slice = d3.select(this)
									.attr("stroke","none");

		              			d3.select(".crimeType").remove();	
		              			d3.select(".crimePercent").remove();	
								
							} else {
								var selection = d3.select(this);
								unhighlight(selection);
							}
						}
			        };
			    }
			}

			/*after pie chart is created, change the chart ID to pieChart*/
			d3.select("#extraChartSection").select("svg")
					.attr("id","pieChart");
			}

			/*define a function to switch to bar chart when the Bar button is clicked*/
			function toBar() {				
				if (document.querySelector("#pieChart")) {
					extraChartGroup.selectAll("path")
				        .transition()
				        .duration(500)
				        .tween("arc", arcTween);				    

				    function arcTween(d) {
				  
				        var path = d3.select(this);
				        
				        /*define the original y position and width of bars so that when arc is created, the finishing position
				        and length of arc will be the same as the bars*/
				        var y0 = d.index * yBandScale_extraChart.bandwidth();
				        var x0 = xLinearScale_extraChart(d.data.value);
				        
				        return function(t) {				           
				            /*reverse the t so that it changes from 1 to 0, and a changes from 0 to 1.
				            the donut chart is generated backwards until it appears like a bar chart*/
				            t = 1 - t;
				            var a = Math.cos(t * Math.PI / 2);
				            var r = (1 + a) * height_extraChart / Math.min(1, t + .005);
				            var yy = r + a * y0;
				            var xx = (1 - a) * width_extraChart / 2;
				            var arcArguments = {
				                    innerRadius: r - yBandScale_extraChart.bandwidth() + 1,
				                    outerRadius: r,
				                    startAngle: (1 - a) * d.startAngle,
				                    endAngle: a * (x0 / r) + (1 - a) * d.endAngle
				                };

				            path.attr("transform", `translate(${xx},${yy})`);
				            path.attr("d", arc(arcArguments));
				        };				        
				    }

				    /*create the y axis and values for the bar chart with some time delays*/
				    setTimeout(addBarAxis, 600);
				    setTimeout(addBarValues, 600);

				    /*change the chart ID to barChart*/
				    d3.select("#extraChartSection").select("svg")
					.attr("id","barChart");
				}
			}			
			/*create click event for bar button and pie button*/
			d3.select("#barButton").on("click",toBar);
			d3.select("#pieButton").on("click",toPie);
		}

	/*only show bar button and pie button when mouse over the extra chart area*/	
	var selectedChart = d3.select("#extraChartSection");
	selectedChart
		.on("mouseover", showButton)
		.on("mouseout", hideButton);	
}

/*
====================================================================================================
codes for other functions
*/

/*define functions to show/hide buttons by changing the class to active/inactive (styles defined in css)*/
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

/*define functions to highlight and unhighlight the selected bar*/
function highlight(selection) {
	selection
		.attr("stroke","#fff")
		.attr("stroke-width","2px");
	/*get the index of selected bar*/
	var selectionIndex = (selection._groups[0][0].__data__.index);
	
	/*pick the corresponding text in the y axis tick*/
	d3.selectAll(".barYAxis>.tick>text").each(function(d, i){
	    /*the sequence of text in the y axis is opposite to the sequence of bars, so use 3-i to align on the sequence*/
	    if (3 - i == selectionIndex) {
	    	d3.select(this).style("font-size", 15 * screenRatio + "px");
	    	d3.select(this).style("fill","red");
	    }
  	});
	
	/*pick the corresponding value from the bar value list*/
	d3.selectAll(".barValues").each(function(d, i){
	    if (i == selectionIndex) {
	    	d3.select(this).style("font-size", 13 * screenRatio + "px");
	    	d3.select(this).style("fill","red");
	    }
  	});
	
}

function unhighlight(selection) {					
	selection.attr("stroke","none");
	
	var selectionIndex = (selection._groups[0][0].__data__.index);
		d3.selectAll(".barYAxis>.tick>text").each(function(d, i){
		    if (3 - i == selectionIndex) {
		    	d3.select(this).style("font-size",13 * screenRatio + "px");
		    	d3.select(this).style("fill","black");
		    }
	  	});
		d3.selectAll(".barValues").each(function(d, i){
		    if (i == selectionIndex) {
		    	d3.select(this).style("font-size",11 * screenRatio + "px");
		    	d3.select(this).style("fill","black");
		    }
	  	});
}

/*
====================================================================================================
codes for map section
*/

/*define a function to display map when selected year, state and clicked data are passed*/
function showMap(selectedYear,selectedState,clickedData) {
  	/*if map section already exist, remove it first.*/
  	if (d3.select("#mapSection")) {
  		d3.select("#mapSection").remove();
  	};
  	
  	/*create a new map section*/
  	var parent = document.querySelector(".col-lg-5");
  	var child = document.createElement("Div");
  	child.id = "mapSection";
  	parent.appendChild(child);
  
	/*define the dimension of map section based on the screen size of device*/
	if (windowWidth > 992) {
			document.querySelector("#mapSection").style.width = windowWidth / 12 * 4 - 50 + "px";
	  		document.querySelector("#mapSection").style.height = (windowWidth / 12 * 4 - 50) / 5 * 3 + "px";
	} else {
			document.querySelector("#mapSection").style.width = windowWidth - 100 + "px";
	  		document.querySelector("#mapSection").style.height = (windowWidth - 100) / 5 * 3 + "px";
	};

	var clickedState = selectedState;
  
	/*set different center lat and log for Alaska and Hawaii, rest of states use the same center location*/
	if (selectedState == "Alaska") {
	    var lat = 51;
	    var log = -123;
	    var zoomLevel = 2;
	  } else if (selectedState == "Hawaii") {
	    var lat = 30;
	    var log = -142;
	    var zoomLevel = 3;
	  } else {
	    var lat = 38.3;
	    var log = -97;
	    var zoomLevel = 3;
  	}
	
	/*create leaflet map object*/
	var map = L.map("mapSection", {
	    center: [lat, log],
	    zoom: zoomLevel,
	    zoomControl: false
	});

  	/*add tile layer*/
    L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibmVsc29ud2FuZyIsImEiOiJjamd6dmw4YnEwamMyMnFwNGp6ODZ1ZXpjIn0.9l00nhSK9-fdWTfQPkBpEQ").addTo(map);

    /*define US state boundary geojson data source*/
    var link = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

  	d3.json(link, function(data) {
    	/*creating a geoJSON layer with the retrieved data*/
	    L.geoJson(data, {
	      /*style each feature (state) and color the selected state red*/	      
	      	style: function(feature) {
		        if (feature.properties.name == selectedState) {
		          return {
		            color: "white",
		            fillColor: "red",
		            fillOpacity: 0.5,
		            weight: 1.5
		          };
		        } else {
		          return {
		            color: "white",
		            fillColor: "gray",
		            fillOpacity: 0.5,
		            weight: 1.5
		          };
		        };
		    },
	      
	        /*call on each feature*/
	        onEachFeature: function(feature, layer) {
	        	/*define mouse events to change map styling*/
	        	layer.on({
		          	mouseover: function(event) {
			            layer = event.target;
			            layer.setStyle({
			              fillOpacity: 0.8			  
			              });
	          		},	          
		            mouseout: function(event) {
			            layer = event.target;
			            layer.setStyle({
			              fillOpacity: 0.5		              
		            	  });		        
	          		},	          
	          		click: function(event) {	            
			            layer.setStyle({
			              fillOpacity: 0.8,
			              fillColor: "red"			              
			        	  });
	           
				        /*when selected a new state that is different from the existing state, refresh bubble chart and extra charts*/
				        if (feature.properties.name != clickedState) {
					        createBubbleChart(selectedYear,feature.properties.name);
						    setTimeout(function() {
									extraChart(selectedYear,feature.properties.name,clickedData);
								}, 1000)
						    /*reset the clicked state as the current selected state*/
						    clickedState = feature.properties.name;
						}

				    }
			    });
	        
	        /*define the dimension of popup image and the size of text*/
	        var hheight_image = 176 * screenRatio;
	        var width_image = 248 * screenRatio;
	        var popupText = 20 * screenRatio;

	        /*popup message when a state is selected.  when Texas is selected, popup with image and different text.*/
	        if (feature.properties.name == "Texas") {
	        	layer.bindPopup(`<h5 style='font-size: ${popupText}px'> EVERYTHING IS BIGGER IN  ` + feature.properties.name.toUpperCase() 
	        		+ "...  CHEERS!!!</h5>" + `<img src='/images' height='${hheight_image}px' width='${width_image}px'/>`);
	        } else {
	        	layer.bindPopup("<h5> You have checked out " + feature.properties.name + ".  Is it the right place for you?</h5>");
	        };	        
	      }
	    }).addTo(map);	   

    /*get the feature of selected state*/
    var selectedData = data.features.filter(d=> d.properties.name == selectedState);
    /*get the bounds of selected state*/
    var stateBounds = L.geoJson(selectedData).getBounds();
    /*set the zoom to the bounds of selection*/
    var zoom = map.getBoundsZoom(stateBounds);
	/*set the southwest and northeast points*/
	var swPoint = map.project(stateBounds.getSouthWest(), zoom);
	var nePoint = map.project(stateBounds.getNorthEast(), zoom);
	/*set the center of zoom*/
	var center = map.unproject(swPoint.add(nePoint).divideBy(2), zoom);

    /*play zoom in with 3 second delay*/
    setTimeout(zoomin, 3000);
    
    /*define the function to zoom in with the pre-defined center*/
    function zoomin(){
        map.flyTo(center, zoom,{
              animate: true,
              duration: 2 /*in seconds*/
            });  
    }
  });
}
