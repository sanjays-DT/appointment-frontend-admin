'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { AnalyticsItem } from '@/types/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: AnalyticsItem[];
}

const COLORS = [
  '#2563eb', 
  '#16a34a', 
  '#f97316', 
  '#dc2626', 
  '#9333ea', 
  '#facc15',
  '#0ea5e9', 
  '#22c55e',
  '#e11d48', 
  '#64748b',
];

const CategoryPieChart: React.FC<Props> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const value = context.raw;
            const percent = ((value / total) * 100).toFixed(0);
            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: 280 }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CategoryPieChart;
