'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { getCategories } from "@/services/categoryService";
import { Edit, Trash } from "lucide-react";
import { deleteCategory } from "@/services/analyticsService";

export default function CategoriesTable() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data);
    } catch (err: any) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Delete this category?");
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully");
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const pageBg = isDark ? 'bg-gray-900' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900';
  const headerText = isDark ? 'text-gray-200' : 'text-gray-900';
  const subText = isDark ? 'text-gray-300' : 'text-gray-500';
  const tableHeader = isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900';
  const tableRowHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  if (loading) {
    return <p className={`${subText} text-center py-10 text-lg`}>Loading...</p>;
  }

  return (
    <div className={`${pageBg} p-4 sm:p-6 md:p-8 min-h-[400px]`}>
      <div className={`max-w-full mx-auto ${cardBg} rounded-2xl border shadow-sm p-4 sm:p-6`}>
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h2 className={`text-2xl font-bold ${headerText}`}>Categories</h2>

          <Link
            href="/dashboard/categories/add"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-all duration-200"
          >
            Add Category
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full divide-y divide-gray-200">
            <thead className={`${tableHeader}`}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className={`px-4 py-6 text-center ${subText}`}>
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className={`${tableRowHover} transition-colors duration-150`}>
                    <td className="px-4 py-3 text-sm">{cat.name}</td>
                    <td className="px-4 py-3 text-sm">{cat.description || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-row gap-2">
                        {/* Edit icon */}
                        <Link
                          href={`/dashboard/categories/${cat._id}/edit`}
                          className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </Link>

                        {/* Delete icon */}
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="bg-red-500 hover:bg-red-600 p-2 rounded-md text-white transition-all"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
