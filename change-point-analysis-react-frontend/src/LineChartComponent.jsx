// LineChartComponent.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function LineChartComponent({ data, label, xField, yField, title }) {
  
  const chartData = {
    labels: data.map(item => item[xField]),
    datasets: data.reduce((acc, item) => {
      let dataset = acc.find(ds => ds.label === item.country);
      if (!dataset) {
        dataset = {
          label: item.country,
          data: [],
          borderColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
          fill: false,
        };
        acc.push(dataset);
      }
      dataset.data.push(item[yField]);
      return acc;
    }, []),
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
      y: {
        title: {
          display: true,
          text: label,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

export default LineChartComponent;
