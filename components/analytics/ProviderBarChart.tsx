'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AnalyticsItem } from '@/types/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface Props {
  data: AnalyticsItem[];
}

const ProviderBarChart: React.FC<Props> = ({ data }) => {
 const chartData = {
  labels: data.map(item => item.label),
  datasets: [
    {
      label: 'Appointments',
      data: data.map(item => item.value),
      backgroundColor: '#2563eb',
      borderRadius: 6,

      categoryPercentage: 0.6, 
      barPercentage: 0.6,      
      maxBarThickness: 26,     
    },
  ],
};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.label}: ${context.raw}`,
        },
      },
    },
    scales: {
  x: {
    grid: {
      display: false, 
    },
  },
  y: {
    beginAtZero: true,
    ticks: { precision: 0 },
  },
},

  };

  return (
    <div style={{ height: 280 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProviderBarChart;
