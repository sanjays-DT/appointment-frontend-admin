'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { AnalyticsItem } from '@/types/analytics';
import { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: AnalyticsItem[];
}

const COLORS = [
  '#4f46e5', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#22c55e', // green
  '#0ea5e9', // sky
  '#f97316', // orange
  '#e11d48', // rose
  '#64748b', // slate
];

const CategoryPieChart: React.FC<Props> = ({ data }) => {
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
        data: data.map(item => item.value),
        backgroundColor: COLORS,
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 14,
          color: isDark ? '#d1d5db' : '#374151',
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#111827' : '#f9fafb',
        titleColor: isDark ? '#fff' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        padding: 10,
        cornerRadius: 8,
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
    <div className="w-full h-[260px] flex items-center justify-center">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CategoryPieChart;
