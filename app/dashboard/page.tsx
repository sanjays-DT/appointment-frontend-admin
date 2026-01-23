import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';

export default async function DashboardPage() {
  const admin = await isAdmin(); 

  if (!admin) {
    redirect('/'); 
  }

  return (
    <div className="p-6">
      <AnalyticsCard />
    </div>
  );
}
