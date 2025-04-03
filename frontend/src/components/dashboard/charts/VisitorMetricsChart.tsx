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

interface VisitorMetricsChartProps {
  data: {
    date: string;
    newVisitors: number;
    returningVisitors: number;
  }[];
  title?: string;
  height?: number;
}

const VisitorMetricsChart: React.FC<VisitorMetricsChartProps> = ({ 
  data,
  title = 'New vs Returning Visitors',
  height = 300
}) => {
  const chartData = {
    labels: data.map(item => {
      // Format date from YYYY-MM-DD to MM/DD
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'New Visitors',
        data: data.map(item => item.newVisitors),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Returning Visitors',
        data: data.map(item => item.returningVisitors),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: true,
        stacked: false,
        title: {
          display: true,
          text: 'Number of Visitors'
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

export default VisitorMetricsChart; 