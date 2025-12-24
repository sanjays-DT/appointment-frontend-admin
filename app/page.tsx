'use client';

import { useState } from 'react';
import axios from '../lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post('/auth/login', { email, password });

    const user = res.data.user;

    if (user.role !== 'admin') {
      toast.error('You are not allowed to access admin panel');
      return; 
    }

    document.cookie = `token=${res.data.token}; path=/;`;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('admin-name', user.name || 'Admin');
      localStorage.setItem('admin-avatar', user.avatar || '/avatar.png');
      localStorage.setItem('admin-email', user.email || '');
    }

    toast.success('Login successful');
    router.push('/dashboard');

  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Admin Login
        </h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 ${
            loading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
