'use client';

import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../src/context/ThemeContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/');
  };

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

        {/* LEFT */}
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
            >
              Admin Portal
            </span>
            <span
              className={`hidden sm:block text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}
            >
              Management Dashboard
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`
              relative w-10 h-10 flex items-center justify-center rounded-xl
              ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}
              hover:scale-105 transition-all
            `}
          >
            <SunIcon
  className={`
    absolute w-5 h-5
    transition-all
    ${theme === 'dark' ? 'scale-100 rotate-0 text-yellow-500' : 'scale-0 -rotate-90'}
  `}
/>
<MoonIcon
  className={`
    absolute w-5 h-5
    transition-all
    ${theme === 'light' ? 'scale-100 rotate-0 text-gray-700' : 'scale-0 rotate-90 text-gray-200'}
  `}
/>


          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
              group inline-flex items-center gap-2 rounded-xl
              border border-gray-300 dark:border-gray-600
              px-4 py-2 text-sm font-medium
              text-gray-700 dark:text-gray-400
              hover:bg-red-600 hover:border-red-600 hover:text-white
              transition-all shadow-sm
            "
          >
            <FaSignOutAlt className="group-hover:rotate-12 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
