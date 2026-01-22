'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/services/analyticsService';
import CategoryPieChart from './CategoryPieChart';
import BookingsLineChart from './BookingsLineChart';
import ProviderBarChart from './ProviderBarChart';
import { AnalyticsResponse } from '@/types/analytics';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

const AnalyticsCard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    bookingsPerWeek: [],
    categoryUsage: [],
    providerUtilization: [],
  });

  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect dark mode
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        setAnalytics(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
        Loading analytics…
      </div>
    );
  }

  // Dark mode styles
  const sectionBg = isDark ? 'bg-gray-900' : 'bg-gray-200';
  const cardBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-100 text-gray-900';
  const headerText = isDark ? 'text-gray-200' : 'text-gray-900';
  const subText = isDark ? 'text-gray-900' : 'text-gray-500';

  return (
    <section className={`w-full px-4 md:px-6 lg:px-8 py-6 ${sectionBg}`}>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className={`text-xl md:text-2xl font-semibold ${headerText}`}>
          Analytics Overview
        </h1>
        <p className={`text-sm mt-1 ${subText}`}>
          Track platform usage and performance insights
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BOOKINGS */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h2 className={`text-sm font-semibold ${headerText}`}>Bookings Per Week</h2>
          </div>

          <div className="h-[260px]">
            <BookingsLineChart data={analytics.bookingsPerWeek} />
          </div>
        </div>

        {/* CATEGORY */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-emerald-500" />
            <h2 className={`text-sm font-semibold ${headerText}`}>Category Usage</h2>
          </div>

          <div className="h-[260px]">
            <CategoryPieChart data={analytics.categoryUsage} />
          </div>
        </div>

        {/* PROVIDER */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <h2 className={`text-sm font-semibold ${headerText}`}>Provider Utilization</h2>
          </div>

          <div className="h-[260px]">
            <ProviderBarChart data={analytics.providerUtilization} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsCard;
