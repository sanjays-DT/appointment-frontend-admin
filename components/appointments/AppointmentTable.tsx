"use client";

import { useEffect, useState } from "react";
import {
  getAllAppointments,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
} from "@/services/appointmentService";
import { toast } from "react-toastify";

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

  /* ===== Filters (UNCHANGED) ===== */
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");

  /* ===== Reschedule state (NEW – LOGIC ONLY) ===== */
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

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

  /* ===== Approve (UNCHANGED) ===== */
  const handleApprove = async (id: string) => {
    try {
      await approveAppointment(id);
      toast.success("Appointment approved");
      updateStatus(id, "approved");
    } catch {
      toast.error("Approval failed");
    }
  };

  /* ===== Reject (UNCHANGED) ===== */
  const handleReject = async (id: string) => {
    try {
      await rejectAppointment(id);
      toast.success("Appointment rejected");
      updateStatus(id, "rejected");
    } catch {
      toast.error("Rejection failed");
    }
  };

  /* ===== Reschedule (UPDATED LOGIC ONLY) ===== */
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
            ? {
                ...a,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
              }
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

  /* ===== Filters logic (UNCHANGED) ===== */
  const filteredAppointments = appointments.filter(appt => {
    const providerName =
      typeof appt.providerId === "string"
        ? appt.providerId
        : appt.providerId?.name || "";

    const matchesProvider =
      !providerFilter || providerName === providerFilter;

    const matchesStatus =
      !statusFilter || appt.status === statusFilter;

    const matchesStartDate =
      !startDateFilter || appt.start.slice(0, 10) === startDateFilter;

    return matchesProvider && matchesStatus && matchesStartDate;
  });

  const minDateTime = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500 text-lg">
        Loading appointments...
      </p>
    );
  }

  if (appointments.length === 0) {
    return (
      <p className="text-center py-10 text-gray-500 text-lg">
        No appointments found
      </p>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Appointments
        </h2>
      </div>

      {/* Filters (UNCHANGED) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="border rounded-md p-2 text-sm"
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
          className="border rounded-md p-2 text-sm"
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
          className="border rounded-md p-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-3 text-left">User</th>
              <th className="border p-3 text-left">Provider</th>
              <th className="border p-3 text-left">Start</th>
              <th className="border p-3 text-left">End</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments.map(appt => {
              const status = appt.status.toLowerCase();
              const isFinal = ["approved", "rejected", "cancelled"].includes(status);

              let statusClass = "text-gray-500 font-semibold";
              if (status === "approved") statusClass = "text-green-600 font-semibold";
              else if (status === "rejected") statusClass = "text-red-600 font-semibold";
              else if (status === "pending") statusClass = "text-yellow-600 font-semibold";

              return (
                <tr
                  key={appt._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="border p-3">
                    {typeof appt.userId === "string"
                      ? appt.userId
                      : appt.userId?.name || "-"}
                  </td>

                  <td className="border p-3">
                    {typeof appt.providerId === "string"
                      ? appt.providerId
                      : appt.providerId?.name || "-"}
                  </td>

                  <td className="border p-3">
                    {new Date(appt.start).toLocaleString()}
                  </td>

                  <td className="border p-3">
                    {new Date(appt.end).toLocaleString()}
                  </td>

                  <td className="border p-3 capitalize">
                    <span className={statusClass}>{appt.status}</span>
                  </td>

                  <td className="border p-3">
                    {rescheduleId === appt._id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="datetime-local"
                          min={minDateTime}
                          value={newStart}
                          onChange={(e) => setNewStart(e.target.value)}
                          className="border rounded-md p-2 text-sm"
                        />
                        <input
                          type="datetime-local"
                          min={newStart || minDateTime}
                          value={newEnd}
                          onChange={(e) => setNewEnd(e.target.value)}
                          className="border rounded-md p-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRescheduleSave(appt)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-medium text-sm transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setRescheduleId(null)}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded font-medium text-sm transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isFinal ? (
                      <span className="text-gray-500 font-medium capitalize">
                        {appt.status}
                      </span>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={() => handleApprove(appt._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-medium text-sm transition-all"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(appt._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-medium text-sm transition-all"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => setRescheduleId(appt._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-medium text-sm transition-all"
                        >
                          Reschedule
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
  );
}
