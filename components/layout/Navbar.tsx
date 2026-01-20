'use client';

import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/');
  };

  // Dynamic navbar background based on theme
  const navbarBg =
    theme === 'light'
      ? 'bg-white/90 border-gray-200'
      : 'bg-gray-900/90 border-gray-700';

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 h-16
        ${navbarBg} backdrop-blur-lg
        border-b
      `}
    >
      <div className="flex h-full items-center justify-between px-6 font-sans">
        {/* LEFT: Sidebar Toggle + Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="
              md:hidden inline-flex items-center justify-center rounded-xl p-2
              text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              active:scale-95 transition
            "
          >
            <FaBars size={20} />
          </button>

          <div className="flex flex-col leading-tight">
            <span
              className={`text-lg font-bold tracking-wide ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Admin Portal
            </span>
            <span
              className={`hidden sm:block text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Management Dashboard
            </span>
          </div>
        </div>

        {/* RIGHT: Theme Toggle + Logout */}
        <div className="flex items-center gap-4 font-sans">
          {/* 🌞🌙 Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`
              relative w-10 h-10
              flex items-center justify-center
              rounded-xl
              ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}
              hover:scale-105 transition-all duration-300
            `}
          >
            <SunIcon
              className={`
                absolute w-5 h-5 text-yellow-500
                transition-all duration-300
                ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}
              `}
            />
            <MoonIcon
              className={`
                absolute w-5 h-5 text-
                transition-all duration-300
                ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}
              `}
            />
          </button>

          {/* 🚪 Logout */}
          <button
            onClick={handleLogout}
            className={` group inline-flex items-center gap-2 rounded-xl
  border border-gray-300 dark:border-gray-600
  px-4 py-2 text-sm font-medium
   ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}  
   hover:bg-red-600 hover:border-red-600 hover:text-white
  transition-all duration-200 shadow-sm`}

            style={{ fontFamily: "'Inter', sans-serif" }}>


            <FaSignOutAlt className="text-sm group-hover:rotate-12 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
