from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import matplotlib.pyplot as plt
from flask import Flask, send_file
import seaborn as sns
import io
import matplotlib
matplotlib.use('Agg')


app = Flask(__name__)
CORS(app,origins=['*'])
oil_price_data = pd.read_csv('../docs/BrentOilPrices.csv')
merged_price_event = pd.read_csv('../docs/merged_price_event.csv')
filtered_data= pd.read_csv('../docs/filtered_data_factors.csv')

@app.route('/', methods=['GET'])
def dataOverTime():
    data = oil_price_data.head(oil_price_data.size).to_dict(orient='records')
    return jsonify(data)
@app.route('/event', methods=['GET'])
def dataWithEvent():
    data = merged_price_event.head(merged_price_event.size).to_dict(orient='records')
    return jsonify(data)
@app.route('/factor', methods=['GET'])
def dataWithFactors():
    data = filtered_data.head(filtered_data.size).to_dict(orient='records')
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)