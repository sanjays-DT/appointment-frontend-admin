'use client';

import { useEffect, useState } from "react";
import { Provider } from "@/types/provider";
import { getProviders, deleteProvider, approveProvider } from "@/services/providerService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Check, Trash } from "lucide-react";

export default function ProviderTable() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  /* ---------------- THEME SYNC ---------------- */
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await getProviders();
      setProviders(data.reverse());
    } catch (err: any) {
      toast.error("Failed to load providers");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Delete this provider?");
    if (!confirmed) return;

    try {
      await deleteProvider(id);
      toast.success("Provider deleted successfully");
      loadProviders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete provider");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      await approveProvider(id);
      toast.success("Provider approved successfully");
      await loadProviders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve provider");
    } finally {
      setApprovingId(null);
    }
  };

  if (loading)
    return <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-10 text-lg`}>Loading...</p>;

  if (!providers.length)
    return <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-10 text-lg`}>No providers found.</p>;

  /* ---------------- STYLES ---------------- */
  const pageBg = isDark ? 'bg-gray-900' : 'bg-slate-50';
  const tableBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900';
  const headerBg = isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900';
  const hoverRow = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  return (
    <div className={`${pageBg} p-4 sm:p-6 md:p-8 min-h-[400px]`}>
      <div className={`max-w-full mx-auto rounded-2xl border shadow-sm p-4 sm:p-6 ${tableBg}`}>
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Providers</h2>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y transition-all duration-200"
            style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}
          >
            <thead className={`${headerBg}`}>
              <tr>
                {["Name", "Speciality", "City", "Hourly Price", "Actions"].map(title => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-150 ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {providers.map((p) => (
                <tr key={p._id} className={`${hoverRow} transition-colors duration-150`}>
                  <td className="px-4 py-3 text-sm">{p.name || "-"}</td>
                  <td className="px-4 py-3 text-sm">{p.speciality || "-"}</td>
                  <td className="px-4 py-3 text-sm">{p.city || "-"}</td>
                  <td className="px-4 py-3 text-sm">Rs {p.hourlyPrice ?? 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-row gap-2">
                      {!(p.isApproved || p.approvalStatus?.toLowerCase() === "approved") ? (
                        <button
                          onClick={() => handleApprove(p._id!)}
                          disabled={approvingId === p._id}
                          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed p-2 rounded-md text-white transition-all"
                          title="Approve Provider"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved
                        </span>
                      )}

                      {/* Delete Icon */}
                      <button
                        onClick={() => handleDelete(p._id!)}
                        className="bg-red-500 hover:bg-red-600 p-2 rounded-md text-white transition-all"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4 text-white" />
                      </button>
                    </div>
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
