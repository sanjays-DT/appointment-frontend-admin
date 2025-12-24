'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/services/analyticsService';
import CategoryPieChart from './CategoryPieChart';
import BookingsLineChart from './BookingsLineChart';
import ProviderBarChart from './ProviderBarChart';
import { AnalyticsResponse } from '@/types/analytics';

const AnalyticsCard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    bookingsPerWeek: [],
    categoryUsage: [],
    providerUtilization: [],
  });

  const [loading, setLoading] = useState(true);

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
    return <p className="p-4 text-sm text-gray-500">Loading analytics...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* BOOKINGS LINE */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Bookings Per Week</h2>
        <BookingsLineChart data={analytics.bookingsPerWeek} />
      </div>

      {/* CATEGORY PIE */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Category Usage</h2>
        <CategoryPieChart data={analytics.categoryUsage} />
      </div>

      {/* PROVIDER BAR */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Provider Utilization</h2>
        <ProviderBarChart data={analytics.providerUtilization} />
      </div>
    </div>
  );
};

export default AnalyticsCard;
