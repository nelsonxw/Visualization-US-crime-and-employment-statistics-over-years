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
+ Download data from source in csv format.  Read into MySQL to clean, merge and save as database.  Use SQLite and SQLAlchemy to import data into Flask
+ Use Flask to serve the web site, and use SQLite and SQLAlchemy to read the database and pass to Pandas where data are processed, formatted.  Jasonify the output from Pandas and make it ready for consumptions by JavaScript codes.
+ Set up website with HTML and CSS, and use D3.js to create interactive bubble charts, bar charts and pie charts.  Use Leaflet to create the interactive map on the website.  
#### Code Snippets:
