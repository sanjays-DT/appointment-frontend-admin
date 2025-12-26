'use client';

import { useEffect, useState } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '@/services/notificationService';
import { toast } from 'react-toastify';
import { FaCheck, FaTrashAlt } from 'react-icons/fa';
import { useNotifications } from '@/src/context/NotificationContext';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsTable() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setNotifications: setGlobalNotifications } = useNotifications();

  const syncState = (list: Notification[]) => {
    setNotifications(list);
    setGlobalNotifications(list);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();

      const list =
        res.data?.notifications ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      syncState(list);
    } catch (err: any) {
      toast.error('Failed to load notifications');
      syncState([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast.success('Notification marked as read');

      const updated = notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      );
      syncState(updated);
    } catch {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');

      const updated = notifications.map(n => ({ ...n, read: true }));
      syncState(updated);
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;

    try {
      await deleteNotification(id);
      toast.success('Notification deleted');

      const updated = notifications.filter(n => n._id !== id);
      syncState(updated);
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all notifications?')) return;

    try {
      await deleteAllNotifications();
      toast.success('All notifications cleared');
      syncState([]);
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  if (loading)
    return (
      <p className="text-center py-10 text-gray-500 text-lg">
        Loading notifications...
      </p>
    );

  if (!notifications.length)
    return (
      <p className="text-center py-10 text-gray-500 text-lg">
        No notifications found
      </p>
    );

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md overflow-x-auto text-gray-800">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleMarkAllRead}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            <FaCheck className="inline mr-1" />
            Mark All Read
          </button>

          <button
            onClick={handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            <FaTrashAlt className="inline mr-1" />
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-[700px] w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {['Message', 'Status', 'Date', 'Actions'].map(h => (
              <th key={h} className="border p-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n._id} className="hover:bg-gray-50">
              <td className="border p-3">{n.message}</td>

              <td className="border p-3">
                <span className={n.read ? 'text-gray-500' : 'text-yellow-600 font-semibold'}>
                  {n.read ? 'Read' : 'Unread'}
                </span>
              </td>

              <td className="border p-3">
                {new Date(n.createdAt).toLocaleString()}
              </td>

              <td className="border p-3">
                <div className="flex gap-2">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded"
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
