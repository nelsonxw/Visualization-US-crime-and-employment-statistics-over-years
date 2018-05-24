#############################
# Create MySQL Database
#############################
#CREATE DATABASE state_data_db;

USE state_data_db;

# Drop and create MySQL tables to store state data

DROP table state_unemp_rate;
CREATE table state_unemp_rate(state_name varchar(30), year int, unemp_rate float);

DROP table state_abbrv;
CREATE table state_abbrv(state_abbrv varchar(2), state_name varchar(30));
# Add District of Columbia to state_abbrv table
INSERT into state_abbrv set state_name = 'District of Columbia', state_abbrv = 'DC';

DROP table state_crime_rate;
CREATE table state_crime_rate(state_name varchar(30), year int, population int, crime_rate float, murder_rate float, rape_rate float, robbery_rate float, assault_rate float);

DROP table final_output;
CREATE table final_output(state_name varchar(30), state_abbrv varchar(2), year int, population int, category varchar(30),  unemp_rate float, crime_rate float, murder_rate float, rape_rate float, robbery_rate float, assault_rate float);

#####################################################################################################################################
# Perform load of data exported from web pages into state_unemp_rate, state_abbrv, and state_crime_rate using MySQL import wizard....
#####################################################################################################################################

# Insert from joined tables into final_output table
insert into final_output
	SELECT u.state_name, 
		   a.state_abbrv, 
		   u.year, 
		   c.population, 
		   CASE 
		   WHEN c.population < 1000000 THEN '1M- populations'
		   WHEN c.population >= 1000000 AND c.population <= 5000000 THEN '1M-5M populations'
		   WHEN c.population > 5000000 AND c.population <= 10000000 THEN '5M+ populations'
		   WHEN c.population > 10000000 THEN '10M + populations'
		   END AS category,
		   u.unemp_rate, 
		   c.crime_rate, 
		   c.murder_rate, 
		   c.rape_rate, 
		   c.robbery_rate, 
		   c.assault_rate 
	FROM 	state_unemp_rate u, state_abbrv a,  state_crime_rate c 
	WHERE c.state_name = u.state_name 
			and c.year = u.year 
			and a.state_name = u.state_name
	ORDER BY u.year, u.state_name;
    
#########################################################################
# Export final_output to comma delimitted file using MySQL export wizard.
#########################################################################

