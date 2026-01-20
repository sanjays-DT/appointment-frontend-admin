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
import { useEffect, useState } from 'react';

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
        label: 'Appointments',
        data: data.map(item => item.value),

        // Modern visual styling
        backgroundColor: '#4f46e5', // indigo-600
        borderRadius: 8,
        hoverBackgroundColor: '#4338ca',

        categoryPercentage: 0.6,
        barPercentage: 0.6,
        maxBarThickness: 28,
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
        titleColor: isDark ? '#ffffff' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, color: isDark ? '#374151' : '#f1f5f9' },
        ticks: { color: isDark ? '#d1d5db' : '#6b7280', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: isDark ? '#d1d5db' : '#6b7280', font: { size: 11 } },
        grid: { color: isDark ? '#374151' : '#f1f5f9' },
      },
    },
  };

  return (
    <div className="w-full h-[260px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProviderBarChart;
