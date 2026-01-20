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
import { useEffect, useState } from 'react';
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
  { name: 'Users', href: '/dashboard/users', icon: <FaUser /> },
];

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { notifications } = useNotifications();

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: any) => !n.read).length
    : 0;

  /* ---------------- THEME SYNC ---------------- */
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initial check
    setIsDark(document.documentElement.classList.contains('dark'));

    // Watch for theme changes from Navbar
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  /* ---------------- STYLES ---------------- */
  const sidebarBg = isDark
    ? 'bg-gray-900/95 border-gray-700'
    : 'bg-white/90 border-gray-200';

  const brandText = isDark ? 'text-blue-400' : 'text-blue-600';

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64
          ${sidebarBg}
          backdrop-blur-xl border-r
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static`}
      >
        {/* Brand */}
        <div
          className={`h-16 flex items-center px-6 border-b
            ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <span
            className={`text-xl font-extrabold tracking-wide ${brandText}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Admin Panel
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeSidebar}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3
                  text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-blue-400" />
                )}

                {/* Icon */}
                <span
                  className={`relative text-base transition
                    ${
                      active
                        ? 'text-white'
                        : isDark
                        ? 'text-gray-400 group-hover:text-blue-400'
                        : 'text-gray-500 group-hover:text-blue-600'
                    }`}
                >
                  {link.icon}

                  {/* Notification dot */}
                  {link.name === 'Notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </span>

                {/* Label */}
                <span
                  className="truncate"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
