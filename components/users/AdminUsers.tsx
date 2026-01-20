'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { Check } from "lucide-react";


interface ForgotPassword {
  status: "PENDING" | "APPROVED";
  requestedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  forgotPassword: ForgotPassword;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);


  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/reset-requests");
      setUsers(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (userId: string) => {
    try {
      await api.post("/auth/admin/approve-request", { userId });
      toast.success("Request approved. User can now reset password.");
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error approving request");
    }
  };

  const getWaitingMinutes = (requestedAt: string) => {
    return Math.floor((Date.now() - new Date(requestedAt).getTime()) / 60000);
  };

  if (loading)
    return (
      <p className={`text-center py-10 text-lg ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
        Loading...
      </p>
    );

  if (!users.length)
    return (
      <>
        <h1 className={`text-center text-2xl font-bold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Users Management</h1>
        <p className={`text-center py-10 text-lg ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
          No pending password reset requests
        </p>
      </>
    );

  const pageBg = isDark ? 'bg-gray-900' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900';
  const headerText = isDark ? 'text-gray-200' : 'text-gray-900';
  const tableHeaderBg = isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900';
  const tableRowHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  return (
    <div className={`${pageBg} p-4 sm:p-6 md:p-8 min-h-[400px]`}>
      <h1 className={`text-center text-2xl font-bold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Users Management</h1>
      <div className={`max-w-full mx-auto ${cardBg} rounded-2xl border shadow-sm p-4 sm:p-6`}>
        {/* Header */}
        <h2 className={`text-2xl font-bold mb-6 ${headerText}`}>Forgot Password Requests</h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y divide-gray-200">
            <thead className={tableHeaderBg}>
              <tr>
                {["Name", "Email", "Action"].map(title => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id} className={`${tableRowHover} transition-colors duration-150`}>
                  <td className="px-4 py-3 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {getWaitingMinutes(user.forgotPassword.requestedAt) >= 30 ? (
                      <p className="text-green-500 font-semibold">Approved</p>
                    ) : (
                      <button
                        onClick={() => handleApproveRequest(user._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        title="Approve Request"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
