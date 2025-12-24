'use client';

import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
    });

    localStorage.clear();

    sessionStorage.clear();

    router.push('/'); 
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-4">
        {/* Hamburger for mobile */}
        <button
          className="text-gray-700 md:hidden p-2 rounded hover:bg-gray-100 transition"
          onClick={toggleSidebar}
        >
          <FaBars size={20} />
        </button>

        <h1 className="text-blue-600 font-bold text-lg">Admin Portal</h1>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </nav>
  );
}
