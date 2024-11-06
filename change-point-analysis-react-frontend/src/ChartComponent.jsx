// ChartComponent.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

function ChartComponent({ data }) {
  // Prepare data for the Line chart
  const chartData = {
    labels: data.map(item => item.Date),
    datasets: [
      {
        label: "Price",
        data: data.map(item => item.Price),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  };

  // Define annotations based on events
  const annotations = data
    .filter(item => item.Event)
    .map((item, index) => ({
      type: "line",
      mode: "vertical",
      scaleID: "x",
      value: item.Date,
      borderColor: "red",
      borderWidth: 2,
      label: {
        content: item.Event,
        enabled: true,
        position: "top",
      },
    }));

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Price Over Time with Events",
      },
      annotation: {
        annotations: annotations,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (USD)",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

export default ChartComponent;
