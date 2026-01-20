'use client';

import { useEffect, useState } from "react";
import {
  getAllAppointments,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
} from "@/services/appointmentService";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock, X, Save } from "lucide-react";

interface Appointment {
  _id: string;
  userId: { name: string } | string;
  providerId: { name: string } | string;
  start: string;
  end: string;
  status: string;
}

export default function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAllAppointments();
      setAppointments(Array.isArray(res.data.appointments) ? res.data.appointments : []);
    } catch {
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string, status: string) => {
    setAppointments(prev =>
      prev.map(appt =>
        appt._id === id ? { ...appt, status } : appt
      )
    );
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAppointment(id);
      toast.success("Appointment approved");
      updateStatus(id, "approved");
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectAppointment(id);
      toast.success("Appointment rejected");
      updateStatus(id, "rejected");
    } catch {
      toast.error("Rejection failed");
    }
  };

  const handleRescheduleSave = async (appt: Appointment) => {
    if (!newStart || !newEnd) {
      toast.error("Please select start and end time");
      return;
    }

    const startDate = new Date(newStart);
    const endDate = new Date(newEnd);
    const minAllowed = new Date(Date.now() + 30 * 60 * 1000);

    if (startDate < minAllowed) {
      toast.error("Start time must be at least 30 minutes from now");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End time must be after start time");
      return;
    }

    if (!window.confirm("Do you want to reschedule this appointment?")) return;

    try {
      await rescheduleAppointment(appt._id, {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });

      setAppointments(prev =>
        prev.map(a =>
          a._id === appt._id
            ? { ...a, start: startDate.toISOString(), end: endDate.toISOString() }
            : a
        )
      );

      toast.success("Appointment rescheduled successfully");
      setRescheduleId(null);
      setNewStart("");
      setNewEnd("");
    } catch {
      toast.error("Failed to reschedule appointment");
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const providerName =
      typeof appt.providerId === "string"
        ? appt.providerId
        : appt.providerId?.name || "";

    const matchesProvider = !providerFilter || providerName === providerFilter;
    const matchesStatus = !statusFilter || appt.status === statusFilter;
    const matchesStartDate = !startDateFilter || appt.start.slice(0, 10) === startDateFilter;

    return matchesProvider && matchesStatus && matchesStartDate;
  });

  const minDateTime = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  if (loading) return <p className={`text-center py-10 text-lg ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Loading appointments...</p>;
  if (appointments.length === 0) return <p className={`text-center py-10 text-lg ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>No appointments found</p>;

  const canApprove = (start: string) => {
    const startTime = new Date(start);
    const approveDeadline = new Date(startTime.getTime() + 15 * 60 * 1000); 
    return new Date() <= approveDeadline;
  };

  const pageBg = isDark ? 'bg-gray-900' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900';
  const headerText = isDark ? 'text-gray-200' : 'text-gray-900';
  const subText = isDark ? 'text-gray-300' : 'text-gray-500';
  const tableHeader = isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900';
  const tableRowHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const inputBg = isDark ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-900 border-gray-300';

  return (
    <div className={`${pageBg} p-4 sm:p-6 md:p-8 min-h-[400px]`}>
      <div className={`max-w-full mx-auto ${cardBg} rounded-2xl border shadow-sm p-4 sm:p-6`}>
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h2 className={`text-2xl font-bold ${headerText}`}>Appointments</h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className={`border rounded-md p-2 text-sm ${inputBg}`}
          >
            <option value="">All Providers</option>
            {[...new Set(
              appointments.map(appt =>
                typeof appt.providerId === "string"
                  ? appt.providerId
                  : appt.providerId?.name
              )
            )].map(
              provider =>
                provider && (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-md p-2 text-sm ${inputBg}`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className={`border rounded-md p-2 text-sm ${inputBg}`}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y divide-gray-200">
            <thead className={tableHeader}>
              <tr>
                {["User", "Provider", "Start", "End", "Status", "Actions"].map((title) => (
                  <th key={title} className="px-4 py-3 text-left text-sm font-semibold">{title}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map(appt => {
                const status = appt.status.toLowerCase();
                const isFinal = ["approved", "rejected", "cancelled"].includes(status);

                let statusClass = "text-gray-700 font-semibold";
                if (status === "approved") statusClass = "text-green-500 font-semibold";
                else if (status === "rejected") statusClass = "text-red-500 font-semibold";
                else if (status === "pending") statusClass = "text-yellow-500 font-semibold";

                return (
                  <tr key={appt._id} className={`${tableRowHover} transition-colors duration-150`}>
                    <td className="px-4 py-3 text-sm">{typeof appt.userId === "string" ? appt.userId : appt.userId?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm">{typeof appt.providerId === "string" ? appt.providerId : appt.providerId?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm">{new Date(appt.start).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{new Date(appt.end).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm capitalize"><span className={statusClass}>{appt.status}</span></td>
                    <td className="px-4 py-3 text-sm">
                      {rescheduleId === appt._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="datetime-local"
                            min={minDateTime}
                            value={newStart}
                            onChange={(e) => setNewStart(e.target.value)}
                            className={`border rounded-md p-2 text-sm ${inputBg}`}
                          />
                          <input
                            type="datetime-local"
                            min={newStart || minDateTime}
                            value={newEnd}
                            onChange={(e) => setNewEnd(e.target.value)}
                            className={`border rounded-md p-2 text-sm ${inputBg}`}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRescheduleSave(appt)}
                              className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white transition-all"
                              title="Save"
                            >
                              <Save className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => setRescheduleId(null)}
                              className="bg-gray-400 hover:bg-gray-500 p-2 rounded-md text-white transition-all"
                              title="Cancel"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ) : isFinal ? (
                        <span className="text-gray-500 font-medium capitalize">{appt.status}</span>
                      ) : (
                        <div className="flex flex-row gap-2">
                          {canApprove(appt.start) && (
                            <button
                              onClick={() => handleApprove(appt._id)}
                              className="p-2 bg-green-500 hover:bg-green-600 rounded-md text-white transition-all"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5 text-white" />
                            </button>
                          )}
                          <button
                            onClick={() => setRescheduleId(appt._id)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-all"
                            title="Reschedule"
                          >
                            <Clock className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={() => handleReject(appt._id)}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-md text-white transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
