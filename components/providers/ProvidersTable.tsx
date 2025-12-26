'use client';

import { useEffect, useState } from "react";
import { Provider } from "@/types/provider";
import { getProviders, deleteProvider } from "@/services/providerService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

export default function ProviderTable() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* -------------------- FETCH -------------------- */
  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await getProviders();
      setProviders(data);
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

  /* -------------------- DELETE -------------------- */
  const handleDelete = async (id: string) => {
    const confirmed = confirm("Delete this provider?");
    if (!confirmed) return;

    try {
      await deleteProvider(id);
      toast.success("Provider deleted successfully");
      loadProviders();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete provider"
      );
    }
  };

  /* -------------------- STATES -------------------- */
  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500 text-lg">
        Loading...
      </p>
    );
  }

  if (!providers.length) {
    return (
      <p className="text-center py-10 text-gray-500 text-lg">
        No providers found.
      </p>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-gray-800">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Providers
        </h2>

        <Link
          href="/dashboard/providers/add"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-all duration-200"
        >
          Add Provider
        </Link>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border border-gray-200 border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              {["Name", "Speciality", "City", "Hourly Price", "Actions"].map(
                (title) => (
                  <th
                    key={title}
                    className="border border-gray-300 p-3 text-left"
                  >
                    {title}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {providers.map((p) => (
              <tr
                key={p._id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="border border-gray-300 p-3">
                  {p.name || "-"}
                </td>

                <td className="border border-gray-300 p-3">
                  {p.speciality || "-"}
                </td>

                <td className="border border-gray-300 p-3">
                  {p.city || "-"}
                </td>

                <td className="border border-gray-300 p-3">
                  ₹{p.hourlyPrice ?? 0}
                </td>

                <td className="border border-gray-300 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/providers/${p._id}/edit`)
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-medium text-sm transition-all duration-200"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(p._id!)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-medium text-sm transition-all duration-200"
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
    </div>
  );
}