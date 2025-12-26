"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  getCategories,
  deleteCategory,
} from "@/services/categoryService";

export default function CategoriesTable() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.error(
        err.response?.data?.message || "Failed to delete category"
      );
    }
  };

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500 text-lg">
        Loading...
      </p>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-gray-800">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Categories
        </h2>

        <Link
          href="/dashboard/categories/add"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-all duration-200"
        >
          Add Category
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-3 text-left">Name</th>
              <th className="border p-3 text-left">
                Description
              </th>
              <th className="border p-3 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="border p-6 text-center text-gray-500"
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="border p-3">
                    {cat.name}
                  </td>

                  <td className="border p-3">
                    {cat.description || "-"}
                  </td>

                  <td className="border p-3">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Link
                        href={`/dashboard/categories/${cat._id}/edit`}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-medium text-sm transition-all duration-200 text-center"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-medium text-sm transition-all duration-200"
                      >
                        Delete
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
  );
}
