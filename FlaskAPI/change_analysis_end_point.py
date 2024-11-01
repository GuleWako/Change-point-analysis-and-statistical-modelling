from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app,origins=['*'])
oil_price_data = pd.read_csv('../docs/BrentOilPrices.csv')

@app.route('/', methods=['GET'])
def dataOverTime():
    data = oil_price_data.head(oil_price_data.size).to_dict(orient='records')
    return jsonify(data)

@app.route('/seasonal', methods=['GET'])
def seasonal_decompose():
    return None

@app.route('/change_point', methods=['GET'])
def change_point():
    return None

if __name__ == '__main__':
    app.run(debug=True)