## Visualization of US Crime and Employment Statistics Over 40 Years

#### Link to visualization: [https://us-crime-employment-statistics.herokuapp.com/](https://us-crime-employment-statistics.herokuapp.com/)

#### Team Members:
+ Aditi Sharma
+ Bill Wilson
+ Gayatri Pingale
+ Nelson Wang

#### Objectives:  
Created an interactive web page to visualize US crime and employment statistics over 40 years.
+ Part I - An animated bubble chart that allows users explore 50 state data in 5 dimensions (unemployment rate, crime rate, population, classification of state, year) and trend over years.  
<img src="images/bubble_chart_1.PNG" width="400"> <img src="images/bubble_chart_2.PNG" width="400">  
      
+ Part II - A bar chart and pie chart section that is triggered by a click on any bubble in part I.  Animated transitions from bar chart to pie chart, and vice versa, to show breakdown details of crime data of selected state and year.  
<img src="images/bar_chart.PNG" width="400" height="218"> <img src="images/pie_chart.PNG" width="400">  

+ Part III - A US map that is triggered by a click on any bubble in part I.  Allow uses to zoom in/zoom out, navigate and and select different states on the map which interactive with charts in Part I and Part II.  
![image1](images/map.PNG)

#### Dataset:

+ [Bureau of Labor Statistics](https://www.bls.gov/lau/rdscnp16.htm)
+ [Uniform Crime Reporting Statistics](https://www.bjs.gov/ucrdata/Search/Crime/State/StatebyState.cfm?NoVariables=Y&CFID=247193930&CFTOKEN=b6105fea0ed761eb-FDFE448E-D159-1EA8-A5EFE168BA588D99)

#### Tools used:
Python, Pandas, HTML, CSS, JavaScript, D3.js, Leaflet, MySQL, SQLite, SQLAlchemy, Flask, Heroku
  
#### Major Steps:
+ Download data from source in csv format.  Read into MySQL to clean, merge and save as database.
+ Use Flask to serve the web application, and use SQLite and SQLAlchemy to read the database and pass to Pandas where data are processed, formatted.  Jasonify the output from Pandas and make it ready for consumptions by JavaScript codes.
+ Set up the website with HTML, CSS and JavaScript, and use D3.js to create interactive bubble charts, bar charts and pie charts.  Use Leaflet to create the interactive map on the website.
+ Push the codes and files to Heroku for web hosting.  
#### Code Snippets:
+ One of the interesting features is the moving bubbles.  Here is the extract of codes that makes it happen.
```javascript
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

	    /*
	    define a function to interpolate a year (or a fraction of year, t) from the list of years, and it is used to create transition frames.
	    credit to http://bl.ocks.org/jgujgu/d4821620fd3b313d83d758aee263afd0, codes have been modified.
	    */
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
```
+ The other interesting feature is transitions between bar chart and pie chart.  Here is the extract of codes that makes it happen.
