'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTachometerAlt,
  FaList,
  FaUser,
  FaCalendarAlt,
  FaBell,
} from 'react-icons/fa';
import { useNotifications } from '@/src/context/NotificationContext';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: <FaTachometerAlt /> },
  { name: 'Categories', href: '/dashboard/categories', icon: <FaList /> },
  { name: 'Providers', href: '/dashboard/providers', icon: <FaUser /> },
  { name: 'Appointments', href: '/dashboard/appointments', icon: <FaCalendarAlt /> },
  { name: 'Notifications', href: '/dashboard/notifications', icon: <FaBell /> },
];

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const pathname = usePathname();

  // 🔴 ADDED (safe – no crash)
  const { notifications } = useNotifications();
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: any) => !n.read).length
    : 0;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow z-40 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}
      >
        <div className="p-4 text-blue-600 font-bold text-lg border-b">
          Admin Panel
        </div>

        <nav className="flex flex-col mt-2">
          {links.map(link => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeSidebar}
                className={`relative flex items-center gap-3 px-4 py-2 text-sm font-medium transition rounded-md
                  ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {/* icon wrapper */}
                <span className="relative">
                  {link.icon}

                  {/* 🔴 RED DOT ONLY */}
                  {link.name === 'Notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </span>

                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
