import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template, send_file
app = Flask(__name__)


#################################################
# Database Setup
#################################################
dbfile = os.path.join('db', 'state_data.db')
engine = create_engine("sqlite:///db/state_data.db")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table

print(Base.classes.keys())

state_data = Base.classes.state_final_data
# Create our session (link) from Python to the DB
session = Session(engine)


@app.route("/")
def index():
    """Return the homepage."""
    return render_template('index.html')

@app.route('/images')
def image():
	return send_file('images/cheers.jpg')

@app.route('/chartdata')
def chart_data():
	"""Return a list of state_data"""
	# Use Pandas to perform the sql query
	stmt =session.query(state_data).statement
	df = pd.read_sql_query(stmt, session.bind)
    # df = pd.read_csv("masterData.csv")
	indexed_df = df.set_index(["state_abbrv","state_name","year"])
	output = []
	for state, sub_df in indexed_df.groupby(level=["state_abbrv","state_name"]):
		data_df = sub_df.reset_index()
		year_df = data_df.pivot(index="state_abbrv",columns='year', values='year')
		population_df = data_df.pivot(index="state_abbrv",columns='year', values='population')
		category_df = data_df.pivot(index="state_abbrv",columns='year', values='category')
		unemploymentRate_df = data_df.pivot(index="state_abbrv",columns='year', values='unemp_rate')
		violentCrimeRate_df = data_df.pivot(index="state_abbrv",columns='year', values='crime_rate')
		murderRate_df = data_df.pivot(index="state_abbrv",columns='year', values='murder_rate')
		rapeRate_df = data_df.pivot(index="state_abbrv",columns='year', values='rape_rate')
		robberyRate_df = data_df.pivot(index="state_abbrv",columns='year', values='robbery_rate')
		assaultRate_df = data_df.pivot(index="state_abbrv",columns='year', values='assault_rate')
		data = {"stateCode":state[0],
		   "stateName":state[1],
		   "year":year_df.values.tolist()[0],
		   "population":population_df.values.tolist()[0],
		   "category":category_df.values.tolist()[0],
		   "unemploymentRate":unemploymentRate_df.values.tolist()[0],
		   "crimeRate":violentCrimeRate_df.values.tolist()[0],
		   "murderRate":murderRate_df.values.tolist()[0],
		   "rapeRate":rapeRate_df.values.tolist()[0],
		   "robberyRate":robberyRate_df.values.tolist()[0],
		   "assaultRate":assaultRate_df.values.tolist()[0],
		  }
		output.append(data)

	# Return a list of the column names (sample names)
	return jsonify(output)


if __name__ == "__main__":
    env_port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=env_port, debug=True)
