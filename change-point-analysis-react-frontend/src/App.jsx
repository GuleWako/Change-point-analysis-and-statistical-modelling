  import { useEffect, useState } from "react";
  import axios from "axios";
  import { Line } from 'react-chartjs-2';
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
  import annotationPlugin from "chartjs-plugin-annotation";
  import ChartComponent from "./ChartComponent";
  import LineChartComponent from "./LineChartComponent";
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
  function App() {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentChart, setCurrentChart] = useState(1); 
    const [filteredData, setFilteredData] = useState([]); 

    const getData = async () => {
      const response = await axios.get("http://127.0.0.1:5000/event");
      setData(response.data);
      const response2 = await axios.get("http://127.0.0.1:5000/factor");
      setFilteredData(response2.data)
    };

    useEffect(() => {
      getData();
    }, []);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    // Define multiple chart datasets and configurations
    const chartData1 = {
      labels: data.map(item => item.Date),
      datasets: [
        {
          label: "Brent Oil Prices Over Time",
          data: data.map(item => item.Price),
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          fill: true,
        },
      ],
    };

    const chartData2 = {
      labels: data.map(item => item.Date),
      datasets: [
        {
          label: "Oil Price Growth Rate",
          data: data.map((item, i, arr) => (i === 0 ? 0 : item.Price - arr[i - 1].Price)), // Example growth calculation
          borderColor: 'rgba(255,99,132,1)',
          backgroundColor: 'rgba(255,99,132,0.2)',
          fill: true,
        },
      ],
    };

    const chartData3 = {
      labels: data.map(item => item.Date),
      datasets: [
        {
          label: "Rolling Average Price (7 Days)",
          data: data.map((item, i, arr) => {
            const window = arr.slice(Math.max(0, i - 6), i + 1); // 7-day rolling average
            return window.reduce((sum, item) => sum + item.Price, 0) / window.length;
          }),
          borderColor: 'rgba(153,102,255,1)',
          backgroundColor: 'rgba(153,102,255,0.2)',
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: currentChart === 1 ? 'Brent Oil Prices Over Time' : currentChart === 2 ? 'Oil Price Growth Rate' : 'Rolling Average Price (7 Days)',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Price (USD/barrel)',
          },
        },
      },
    };

    // Determine the data to display based on the selected chart
    const chartData = currentChart === 1 ? chartData1 : currentChart === 2 ? chartData2 : chartData3;

    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4 mt-4 flex items-center justify-center text-blue-700 uppercase">Change Point Analysis and Statistical Modeling</h1>
        <h1 className="text-xl font-semibold mb-2 mt-2 flex items-center justify-center text-blue-700 uppercase">Brent Oil Price and Date Datasets</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="py-2 px-4">{item.Date}</td>
                  <td className="py-2 px-4">${item.Price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end mt-4 mr-4">
          <button
            className="px-4 py-2 mx-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="px-4 py-2 mx-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {/* Chart Selection Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            onClick={() => setCurrentChart(1)}
          >
            Brent Oil Prices
          </button>
          <button
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            onClick={() => setCurrentChart(2)}
          >
            Growth Rate
          </button>
          <button
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            onClick={() => setCurrentChart(3)}
          >
            Rolling Average
          </button>
        </div>

        {/* Chart Display */}
        <div style={{ width: '100%', height: '800px', marginTop: '20px' }}>
          <Line data={chartData} options={options} />
        </div>
        <div>
          <ChartComponent data={data} options={options}/>
        </div>

        <div>
      <h1 className="text-2xl font-semibold mb-4 mt-4 text-blue-700 uppercase flex items-center justify-center">Country Metrics Over Time</h1>
      <div className="chart-container">
        <LineChartComponent data={filteredData} label="GDP (Current US$)" xField="date" yField="GDP" title="GDP over Time" />
      </div>
      <div className="chart-container">
        <LineChartComponent data={filteredData} label="Inflation Rate (%)" xField="date" yField="Inflation" title="Inflation Rate over Time" />
      </div>
      <div className="chart-container">
        <LineChartComponent data={filteredData} label="Unemployment Rate (%)" xField="date" yField="Unemployment" title="Unemployment Rate over Time" />
      </div>
    </div>
      </div>
    );
  }

  export default App;
