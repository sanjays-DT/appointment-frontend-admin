'use client';

import { useEffect, useMemo, useState } from "react";
import {
  rescheduleAppointment,
} from "@/services/appointmentService";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock, X, Save } from "lucide-react";
import api from "@/lib/axios";
import { getAllAppointments,approveAppointment,rejectAppointment } from "@/services/appointmentService";
import { getProviders } from "@/services/providerService";
import { Provider } from "@/types/provider";

interface Appointment {
  _id: string;
  userId: { name: string } | string;
  providerId: { name: string; _id?: string } | string;
  start: string;
  end: string;
  status: string;
}

export default function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState("");

  const [isDark, setIsDark] = useState(false);

  /* Detect dark / light mode */
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchProviders();
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

  const fetchProviders = async () => {
    try {
      const res = await getProviders();
      setProviders(Array.isArray(res) ? res : []);
    } catch {
      setProviders([]);
    }
  };

  const updateStatus = (id: string, status: string) => {
    setAppointments(prev =>
      prev.map(a => (a._id === id ? { ...a, status } : a))
    );
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAppointment(id);
      updateStatus(id, "approved");
      toast.success("Approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (appt: Appointment) => {
    try {
      await rejectAppointment(appt._id);

      if (appt.providerId && typeof appt.providerId !== "string") {
        await api.put(`/admin/${appt.providerId._id}/unlock-slot`, {
          date: appt.start.slice(0, 10),
          slotTime: `${new Date(appt.start).toTimeString().slice(0,5)} - ${new Date(appt.end).toTimeString().slice(0,5)}`
        });
      }

      updateStatus(appt._id, "rejected");
      toast.success("Rejected & slot unlocked");
    } catch {
      toast.error("Failed to reject");
    }
  };

const fetchRescheduleSlots = async (providerId: string, date: string) => {
  try {
    const formattedDate = new Date(date).toISOString().split("T")[0];

    const res = await api.get(
      `/providers/${providerId}/availability`,
      { params: { date: formattedDate } }
    );

    if (!res.data || !Array.isArray(res.data.slots)) {
      setRescheduleSlots([]);
      return;
    }

    const normalizedSlots = res.data.slots
      .map((slot: any) => {
        if (typeof slot === "string") {
          return { time: slot, isBooked: false };
        }

        const start =
          slot?.start 
        const end =
          slot?.end 

        const time = slot?.time ?? (start && end ? `${start} - ${end}` : "");
        if (!time) return null;

        const isBooked =
          slot?.isBooked ??
          (slot?.available === false);

        return { time, isBooked: Boolean(isBooked) };
      })
      .filter(Boolean);

    setRescheduleSlots(normalizedSlots);

  } catch (err: any) {
    console.error("Reschedule fetch error:", err?.response?.data || err);
    setRescheduleSlots([]);
  }
};


  const handleRescheduleSave = async (appt: Appointment) => {
    if (!rescheduleDate || !selectedRescheduleSlot) {
      toast.error("Pick a date and slot");
      return;
    }

    const [startStr, endStr] = selectedRescheduleSlot.split(" - ");
    const start = new Date(`${rescheduleDate}T${startStr}:00`);
    const end = new Date(`${rescheduleDate}T${endStr}:00`);

    if (start < new Date()) {
      toast.error("Cannot reschedule to past slot");
      return;
    }

    if (!window.confirm("Reschedule to selected slot?")) return;

    try {
      const payload: any = {
        start: start.toISOString(),
        end: end.toISOString(),
        date: rescheduleDate,
        slotTime: selectedRescheduleSlot,
        time: selectedRescheduleSlot,
        slot: selectedRescheduleSlot,
      };

      const providerIdValue =
        typeof appt.providerId === "string"
          ? appt.providerId
          : appt.providerId?._id;
      if (providerIdValue && /^[a-f\d]{24}$/i.test(providerIdValue)) {
        payload.providerId = providerIdValue;
      }

      await rescheduleAppointment(appt._id, payload);

      setAppointments(prev =>
        prev.map(a =>
          a._id === appt._id
            ? { ...a, start: start.toISOString(), end: end.toISOString() }
            : a
        )
      );

      toast.success("Rescheduled successfully");
      setRescheduleId(null);
      setRescheduleDate("");
      setSelectedRescheduleSlot("");
      setRescheduleSlots([]);
    } catch (err: any) {
      const responseData = err?.response?.data;
      console.error("Reschedule error:", {
        status: err?.response?.status,
        data: responseData,
        message: err?.message,
      });
      const message =
        responseData?.message ||
        responseData?.error ||
        err?.message ||
        "Failed to reschedule";
      toast.error(message);
    }
  };

  /* Theme tokens */
  const pageBg = isDark ? "bg-gray-900" : "bg-slate-50";
  const cardBg = isDark
    ? "bg-gray-800 border-gray-700 text-gray-200"
    : "bg-white border-gray-200 text-gray-900";
  const tableHeader = isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900";
  const rowHover = isDark ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const subText = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300";

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const providerName = typeof appt.providerId === "string" ? appt.providerId : appt.providerId?.name;
      const providerId = typeof appt.providerId === "string" ? "" : appt.providerId?._id || "";
      const apptDate = new Date(appt.start).toISOString().slice(0, 10);

      if (providerFilter) {
        if (providerFilter !== providerId && providerFilter !== providerName) return false;
      }
      if (statusFilter && appt.status !== statusFilter) return false;
      if (dateFilter && apptDate !== dateFilter) return false;
      return true;
    });
  }, [appointments, providerFilter, statusFilter, dateFilter]);

  if (loading) return <p className={`${subText} text-center py-10`}>Loading...</p>;
  if (!appointments.length) return <p className={`${subText} text-center py-10`}>No appointments</p>;

  return (
    <div className={`${pageBg} p-4 sm:p-6 md:p-8`}>
      <div className={`rounded-2xl border shadow-sm p-4 sm:p-6 ${cardBg}`}>
        <h2 className="text-2xl font-bold mb-6">Appointments</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className={`rounded-md p-2 text-sm ${inputBg}`}
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p._id || p.name} value={p._id || p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`rounded-md p-2 text-sm ${inputBg}`}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-md p-2 text-sm ${inputBg}`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="missed">Missed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead className={tableHeader}>
              <tr>
                {["User", "Provider", "Start", "End", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-sm font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.length ? filteredAppointments.map(appt => (
                <tr key={appt._id} className={`${rowHover} transition-colors`}>
                  <td className="px-4 py-3 text-sm">
                    {typeof appt.userId === "string" ? appt.userId : appt.userId?.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {typeof appt.providerId === "string" ? appt.providerId : appt.providerId?.name}
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(appt.start).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{new Date(appt.end).toLocaleString()}</td>

                  <td className="px-4 py-3 text-sm font-semibold capitalize">
                    <span className={
                      appt.status === "approved" ? "text-green-500" :
                      appt.status === "rejected" ? "text-red-500" :
                      appt.status === "pending" ? "text-yellow-500" :
                      appt.status === "missed" ? "text-gray-500" :
                      subText
                    }>
                      {appt.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {rescheduleId === appt._id ? (
                      <div className={`rounded-lg border p-3 flex flex-col gap-3 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50"}`}>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={rescheduleDate}
                          onChange={(e) => {
                            setRescheduleDate(e.target.value);
                            if (typeof appt.providerId !== "string")
                              fetchRescheduleSlots(appt.providerId._id as string, e.target.value);
                          }}
                          className={`rounded-md p-2 text-sm ${inputBg}`}
                        />

                        <div className="flex flex-wrap gap-2">
                          {rescheduleSlots.length ? rescheduleSlots.map(slot => {
                            const [startStr] = slot.time.split(" - ");
                            const slotTime = new Date(`${rescheduleDate}T${startStr}:00`);
                            const isPast = slotTime < new Date();

                            return (
                              <button
                                key={slot.time}
                                disabled={slot.isBooked || isPast}
                                onClick={() => setSelectedRescheduleSlot(slot.time)}
                                className={`px-3 py-1 rounded text-sm transition
                                  ${slot.isBooked || isPast
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                    : "bg-green-500 text-white hover:bg-green-600"}
                                  ${selectedRescheduleSlot === slot.time ? "ring-2 ring-blue-500" : ""}
                                `}
                              >
                                {slot.time}
                              </button>
                            );
                          }) : <p className={subText}>No slots available</p>}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => handleRescheduleSave(appt)} className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setRescheduleId(null)} className="bg-gray-500 hover:bg-gray-600 p-2 rounded-md text-white">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : appt.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(appt._id)} className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setRescheduleId(appt._id)} className="bg-blue-500 hover:bg-blue-600 p-2 rounded-md text-white">
                          <Clock size={18} />
                        </button>
                        <button onClick={() => handleReject(appt)} className="bg-red-500 hover:bg-red-600 p-2 rounded-md text-white">
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : appt.status === "missed" ? (
                      <div className="flex gap-2">
                        <button onClick={() => setRescheduleId(appt._id)} className="bg-blue-500 hover:bg-blue-600 p-2 rounded-md text-white">
                          <Clock size={18} />
                        </button>
                        <button onClick={() => handleReject(appt)} className="bg-red-500 hover:bg-red-600 p-2 rounded-md text-white">
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : "-"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className={`${subText} px-4 py-6 text-center`}>
                    No appointments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
