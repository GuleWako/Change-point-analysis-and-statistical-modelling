import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from statsmodels.tsa.seasonal import seasonal_decompose  # type: ignore
import pymc as pm
from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from statsmodels.tsa.arima.model import ARIMA
import numpy as np
from prophet import Prophet
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential # type: ignore
from tensorflow.keras.layers import LSTM, Dense # type: ignore
from statsmodels.tsa.api import VAR

def loadData():
    return pd.read_csv('docs/BrentOilPrices.csv')
def oilPricOverTime(price_data):
    plt.figure(figsize=(12, 6))
    plt.plot(price_data['Price'])
    plt.title("Brent Oil Prices Over Time")
    plt.xlabel("Date")
    plt.ylabel("Price (USD/barrel)")
    plt.show()
def seasonalDecompose(price_data):
    decomposition = seasonal_decompose(price_data['Price'], model='multiplicative', period=365)
    decomposition.plot()
    plt.show()
def loadEventData():
    return pd.read_csv('docs/oil_price_events_1987_2022.csv')
def mergePriceWithEvent(price_data,event_affect_oil ):
    return price_data.merge(event_affect_oil, on='Date')
def mergeAllPriceWithEvent(price_data,event_affect_oil ):
    return price_data.merge(event_affect_oil, on='Date', how='left').fillna(0)

def saveMergedData(merged_price_event):
    merged_price_event.to_csv('docs/merged_price_event.csv', index=False)
def priceWithSignificantEvent(merged_price_event):
    merged_price_event['Date'] = pd.to_datetime(merged_price_event['Date'])

    merged_price_event.set_index('Date', inplace=True)

    plt.figure(figsize=(14, 7))
    sns.lineplot(data=merged_price_event, x='Date', y='Price', label='Oil Price')

    event_dates = merged_price_event[merged_price_event['Event'] != 0]
    plt.scatter(event_dates.index, event_dates['Price'], color='red', label='Significant Events', s=50, zorder=5)

    # Customize plot
    plt.title("Oil Price Over Time with Significant Events")
    plt.xlabel("Date")
    plt.ylabel("Oil Price")
    plt.legend()
    plt.grid(True)
    plt.show()
def priceWithSignificantEventName(merged_price_event):
    merged_price_event.reset_index(inplace=True)
    merged_price_event['Date'] = pd.to_datetime(merged_price_event['Date'])
    merged_price_event.set_index('Date', inplace=True)
    
    plt.figure(figsize=(20, 10))
    sns.lineplot(data=merged_price_event, x=merged_price_event.index, y='Price', label='Oil Price')

    event_dates = merged_price_event[merged_price_event['Event'] != 0]
    for i in range(len(event_dates)):
        plt.annotate(event_dates['Event'].iloc[i], 
                    (event_dates.index[i], event_dates['Price'].iloc[i]), 
                    textcoords="offset points", 
                    xytext=(0, 5), 
                    ha='center', 
                    fontsize=12, 
                    color='red')

    # Customize plot
    plt.title("Oil Price Over Time with Significant Events")
    plt.xlabel("Date")
    plt.ylabel("Oil Price")
    plt.legend()
    plt.grid(True)
    plt.show()

def changePointDetection(price_data):
    prices = price_data['Price'].values
    n = len(prices)

    with pm.Model() as model:
        change_point = pm.DiscreteUniform("change_point", lower=0, upper=n)

        mean1 = pm.Normal("mean1", mu=np.mean(prices[:n//2]), sigma=np.std(prices[:n//2]))
        mean2 = pm.Normal("mean2", mu=np.mean(prices[n//2:]), sigma=np.std(prices[n//2:]))
        sigma = pm.HalfNormal("sigma", sigma=10)

        idx = np.arange(n)
        mean = pm.math.switch(idx < change_point, mean1, mean2)
        obs = pm.Normal("obs", mu=mean, sigma=sigma, observed=prices)

        trace = pm.sample(1000, tune=1000, target_accept=0.9)
    pm.plot_trace(trace,figsize=(20,20))
    plt.show()
    

def adf_test(series):
    result = adfuller(series)
    print('ADF Statistic: %f' % result[0])
    print('p-value: %f' % result[1])
    if result[1] <= 0.05:
        print("Reject the null hypothesis (the series is stationary)")
    else:
        print("Fail to reject the null hypothesis (the series is non-stationary)")
def autoCorrAndPartialAutoCorr(price_data):
    plt.figure(figsize=(12, 6))
    plot_acf(price_data['Price'], lags=40)
    plt.show()

    plt.figure(figsize=(12, 6))
    plot_pacf(price_data['Price'], lags=40)
    plt.show()
def arimaModel(price_data,test):
    # order(p,d,q)
    arima_model = ARIMA(price_data['Price'], order=(1, 1, 1)) 
    arima_result = arima_model.fit()
    print(arima_result.summary())

    # Forecasting
    arima_forecast = arima_result.forecast(steps=len(test))
    return arima_forecast
def prophetModel(price_data):
    
    print("Building Prophet model...")
    train_size = int(len(price_data) * 0.8)
    prophet_data = price_data.reset_index().rename(columns={'Date': 'ds', 'Price': 'y'})
    train_prophet, test_prophet = prophet_data[:train_size], prophet_data[train_size:]

    prophet_model = Prophet()
    prophet_model.fit(train_prophet)
    future = prophet_model.make_future_dataframe(periods=len(test_prophet))
    prophet_forecast = prophet_model.predict(future)['yhat'].iloc[-len(test_prophet):].values

    return prophet_forecast, test_prophet
def lstmModel(price_data):
    # Data scaling
    scaler = MinMaxScaler(feature_range=(0, 1))
    data_scaled = scaler.fit_transform(price_data.values)

    # Creating LSTM dataset
    def create_lstm_dataset(data, time_step=1):
        X, Y = [], []
        for i in range(len(data) - time_step - 1):
            X.append(data[i:(i + time_step), 0])
            Y.append(data[i + time_step, 0])
        return np.array(X), np.array(Y)

    time_step = 60  # Choose a suitable time step for LSTM
    X, Y = create_lstm_dataset(data_scaled, time_step)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    # Split data into training and testing sets
    train_size = int(len(data_scaled) * 0.8)
    train_data, test_data = data_scaled[0:train_size], data_scaled[train_size - time_step:]

    # Prepare test dataset for predictions
    X_test, Y_test = create_lstm_dataset(test_data, time_step)
    X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

    # Building LSTM lstm_model
    lstm_model = Sequential()
    lstm_model.add(LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)))
    lstm_model.add(LSTM(50))
    lstm_model.add(Dense(1))
    lstm_model.compile(optimizer='adam', loss='mean_squared_error')

    # Train the lstm_model
    lstm_model.fit(X, Y, epochs=20, batch_size=64, verbose=1)
    # Make LSTM predictions and inverse scale
    lstm_forecast = lstm_model.predict(X_test)
    lstm_forecast = scaler.inverse_transform(lstm_forecast)
    y_test = scaler.inverse_transform(Y_test.reshape(-1, 1))

    # Calculate LSTM metrics
    lstm_rmse = np.sqrt(mean_squared_error(y_test, lstm_forecast))
    lstm_mae = mean_absolute_error(y_test, lstm_forecast)
    lstm_r2 = r2_score(y_test, lstm_forecast)
    return lstm_rmse, lstm_mae, lstm_r2,lstm_forecast


def modelComparison(prophet_forecast,arima_forecast,lstm_forecast,test_last_period):
    plt.figure(figsize=(14, 8))
    plt.plot(test_last_period.index, test_last_period, label="Actual", color="blue")
    plt.plot(test_last_period.index, arima_forecast, label="ARIMA Forecast", color="orange")
    plt.plot(test_last_period.index, prophet_forecast, label="Prophet Forecast", color="green")
    plt.plot(test_last_period.index, lstm_forecast, label="LSTM Forecast", color="red")
    plt.xlabel("Date")
    plt.ylabel("Price")
    plt.title("Model Comparison: Actual vs. Forecast")
    plt.legend()
    plt.show()
def gdp_Inflation_Unemployee_Country_OverTime(filtered_data):
    sns.set(style="whitegrid")

    # Plot GDP over time
    plt.figure(figsize=(12, 6))
    sns.lineplot(data=filtered_data, x='date', y='GDP', hue='country')
    plt.title('GDP over Time')
    plt.xlabel('Year')
    plt.ylabel('GDP (Current US$)')
    plt.xticks(rotation=45)
    plt.show()

    # Plot Inflation over time
    plt.figure(figsize=(12, 6))
    sns.lineplot(data=filtered_data, x='date', y='Inflation', hue='country')
    plt.title('Inflation Rate over Time')
    plt.xlabel('Year')
    plt.ylabel('Inflation Rate (%)')
    plt.xticks(rotation=45)
    plt.show()

    # Plot Unemployment over time
    plt.figure(figsize=(12, 6))
    sns.lineplot(data=filtered_data, x='date', y='Unemployment', hue='country')
    plt.title('Unemployment Rate over Time')
    plt.xlabel('Year')
    plt.ylabel('Unemployment Rate (%)')
    plt.xticks(rotation=45)
    plt.show()
def varModel(merged_price_factors):
    # Multivariate dataset with additional factors
    data_multivar = merged_price_factors[['Price', 'GDP', 'Inflation','Unemployment']]
    var_model = VAR(data_multivar)
    var_result = var_model.fit()
    print(var_result.summary())
    return var_result,var_model