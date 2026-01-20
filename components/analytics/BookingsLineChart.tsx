'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnalyticsItem } from '@/types/analytics';
import { useEffect, useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  data: AnalyticsItem[];
}

const BookingsLineChart: React.FC<Props> = ({ data }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Bookings',
        data: data.map(item => item.value),

        borderColor: '#4f46e5', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.12)',
        fill: true,

        tension: 0.45,
        borderWidth: 2,

        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4f46e5',
        pointBorderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#111827' : '#f9fafb',
        titleColor: isDark ? '#fff' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#d1d5db' : '#6b7280',
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: isDark ? '#d1d5db' : '#6b7280',
          font: { size: 11 },
        },
        grid: {
          color: isDark ? '#37415133' : '#f1f5f9', // slightly transparent in dark
        },
      },
    },
  };

  return (
    <div className="w-full h-[260px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default BookingsLineChart;
