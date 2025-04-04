import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TrafficSourcesChartProps {
  data: {
    source: string;
    visits: number;
  }[];
  title?: string;
  height?: number;
}

const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({ 
  data,
  title = 'Top Traffic Sources',
  height = 300
}) => {
  const chartData = {
    labels: data.map(item => item.source),
    datasets: [
      {
        label: 'Visits',
        data: data.map(item => item.visits),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Horizontal bar chart
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Visits'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Source'
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TrafficSourcesChart; 