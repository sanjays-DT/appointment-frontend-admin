'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { NotificationProvider, useNotifications } from '@/src/context/NotificationContext';
import { getNotifications } from '@/services/notificationService';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setNotifications } = useNotifications();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // 🔴 Fetch notifications once on layout mount
  useEffect(() => {
    async function fetch() {
      try {
        const res = await getNotifications();
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.notifications)
          ? res.data.notifications
          : [];
        setNotifications(data);
      } catch (err) {
        setNotifications([]);
      }
    }
    fetch();
  }, [setNotifications]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-6 pt-16">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <DashboardContent>{children}</DashboardContent>
    </NotificationProvider>
  );
}
