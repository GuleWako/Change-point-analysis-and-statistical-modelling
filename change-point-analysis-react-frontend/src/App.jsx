import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


function App() {
  const [data, setData] = useState([]);
  const [plotUrl, setPlotUrl]=useState('')
  const getData = async () => {
    await axios.get("http://127.0.0.1:5000/").then((response) => {
      setData(response.data);
    });
    await axios.get("http://127.0.0.1:5000/plot",{ responseType: 'blob' }).then((response) => {
      const url = URL.createObjectURL(response.data);
        setPlotUrl(url);
        
     
    });
  };
  useEffect(() => {
    getData();
  }, []);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Get the items for the current page
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle pagination navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const data1 = {
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
        text: 'Brent Oil Prices Over Time',
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
      <div style={{ width: '100%', height: '800px' }}>
      <Line data={data1} options={options} />
    </div>
  
        <div>
      <img src={plotUrl} alt="ploturl" />


    </div>
    
   
    </div>
  );
}

export default App;
