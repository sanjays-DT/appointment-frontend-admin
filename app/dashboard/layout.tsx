'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { useTheme } from '@/src/context/ThemeContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const pageBg = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';

  return (
    <div className={`min-h-screen flex ${pageBg}`}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar toggleSidebar={toggleSidebar} />
        {/* main area */}
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
