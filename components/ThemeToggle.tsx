'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../src/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="
        relative w-10 h-10
        flex items-center justify-center
        rounded-full
        bg-gray-200 dark:bg-gray-700
        hover:scale-110
        transition-all duration-300
      "
    >
      {/* Sun */}
      <SunIcon
        className={`
          absolute w-6 h-6 text-yellow-500
          transition-all duration-300
          ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}
        `}
      />

      {/* Moon */}
      <MoonIcon
        className={`
          absolute w-6 h-6 text-white
          transition-all duration-300
          ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}
        `}
      />
    </button>
  );
}
