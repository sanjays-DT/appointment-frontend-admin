'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { NotificationProvider, useNotifications } from '@/src/context/NotificationContext';
import { getNotifications } from '@/services/notificationService';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Track theme
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

  // 🔵 Detect initial theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // 🔵 Poll localStorage for changes in the same tab
  useEffect(() => {
    const interval = setInterval(() => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme && savedTheme !== theme) {
        setTheme(savedTheme);
      }
    }, 100); // check every 100ms

    return () => clearInterval(interval);
  }, [theme]);

  // Function to toggle theme manually (optional)
  const changeTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  // Determine background and text color classes based on theme
  const rootClasses = `min-h-screen flex ${
    theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
  }`;

  return (
    <div className={rootClasses}>
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
