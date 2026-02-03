'use client';

import { useEffect, useState } from "react";
import {
  rescheduleAppointment,
} from "@/services/appointmentService";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock, X, Save } from "lucide-react";
import api from "@/lib/axios";
import { getAllAppointments,approveAppointment,rejectAppointment } from "@/services/appointmentService";

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
      const res = await api.get(`/appointment/${providerId}/slots?date=${date}`);
      setRescheduleSlots(res.data.slots || []);
    } catch {
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
      };

      if (appt.providerId && typeof appt.providerId !== "string" && appt.providerId._id) {
        payload.providerId = appt.providerId._id;
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
      console.error("Reschedule error:", err?.response || err);
      const message = err?.response?.data?.message || err?.message || "Failed to reschedule";
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

  if (loading) return <p className={`${subText} text-center py-10`}>Loading...</p>;
  if (!appointments.length) return <p className={`${subText} text-center py-10`}>No appointments</p>;

  return (
    <div className={`${pageBg} p-4 sm:p-6 md:p-8`}>
      <div className={`rounded-2xl border shadow-sm p-4 sm:p-6 ${cardBg}`}>
        <h2 className="text-2xl font-bold mb-6">Appointments</h2>

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
              {appointments.map(appt => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
