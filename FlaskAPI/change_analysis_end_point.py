from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import matplotlib.pyplot as plt
from flask import Flask, send_file
import seaborn as sns
import io


app = Flask(__name__)
CORS(app,origins=['*'])
oil_price_data = pd.read_csv('../docs/BrentOilPrices.csv')
merged_price_event = pd.read_csv('../docs/merged_price_event.csv')

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

@app.route('/plot')
def plot():
    plt.figure(figsize=(14, 7))
    sns.lineplot(data=merged_price_event, x='Date', y='Price', label='Oil Price')

    event_dates = merged_price_event[merged_price_event['Event'] != 0]
    plt.scatter(event_dates.index, event_dates['Price'], color='red', label='Significant Events', s=50, zorder=5)

    plt.title("Oil Price Over Time with Significant Events")
    plt.xlabel("Date")
    plt.ylabel("Oil Price")
    plt.legend()
    plt.grid(True)

    # Save plot to a bytes buffer and send as image response
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    plt.close()
    return send_file(buffer, mimetype='image/png')


if __name__ == '__main__':
    app.run(debug=True)