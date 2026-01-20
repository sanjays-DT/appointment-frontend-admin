'use client';

import React, { useEffect, useState } from "react";
import { Provider } from "@/types/provider";
import {
  createProvider,
  getProvider,
  updateProvider,
  getProviderAvatarURL,
} from "@/services/providerService";
import { getCategories } from "@/services/categoryService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import baseURL from "@/lib/axios";

interface ProviderFormProps {
  providerId?: string;
}

export default function ProviderForm({ providerId }: ProviderFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Provider>>({
    name: "",
    speciality: "",
    city: "",
    address: "",
    hourlyPrice: 0,
    categoryId: "",
    bio: "",
    weeklyAvailability: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Provider, string>>>(
    {}
  );
  const [title, setTitle] = useState("Add Provider");

  /* ---------------- THEME SYNC ---------------- */
  const [isDark, setIsDark] = useState(false);

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

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  /* ---------------- FETCH PROVIDER ---------------- */
  useEffect(() => {
    if (!providerId) return;

    setTitle("Edit Provider");

    getProvider(providerId)
      .then((data) => {
        setFormData({
          ...data,
          categoryId:
            typeof data.categoryId === "object"
              ? (data.categoryId as any)._id
              : data.categoryId,
        });

        const axiosBaseUrl = (baseURL as any)?.defaults?.baseURL ?? "";
        setPreview(getProviderAvatarURL(providerId, axiosBaseUrl));
      })
      .catch(() => toast.error("Failed to fetch provider"));
  }, [providerId]);

  /* ---------------- INPUT HANDLER ---------------- */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyPrice" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ---------------- AVATAR ---------------- */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.speciality) newErrors.speciality = "Required";
    if (!formData.city) newErrors.city = "Required";
    if (!formData.address) newErrors.address = "Required";
    if (!formData.hourlyPrice || formData.hourlyPrice <= 0)
      newErrors.hourlyPrice = "Invalid price";
    if (!formData.categoryId) newErrors.categoryId = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Fix errors");

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          data.append(key, String(value));
      });
      if (avatarFile) data.append("avatar", avatarFile);

      providerId
        ? await updateProvider(providerId, data)
        : await createProvider(data);

      toast.success("Saved successfully");
      router.push("/dashboard/providers");
    } catch {
      toast.error("Failed to save provider");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI STYLES ---------------- */
  const input = `w-full rounded-xl border px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition
    ${isDark ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-800'}
  `;

  const sectionHeader = `${isDark ? 'text-gray-100' : 'text-gray-800'}`;
  const formBg = `${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'}`;
  const pageBg = `${isDark ? 'bg-gray-900' : 'bg-gray-50'}`;

  return (
    <div className={`w-full px-6 py-8 min-h-screen ${pageBg}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${sectionHeader}`}>{title}</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            Manage provider profile and pricing details
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl shadow-sm border p-8 space-y-8 ${formBg}`}
        >
          {/* BASIC INFO */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="name"
                placeholder="Provider name"
                value={formData.name || ""}
                onChange={handleChange}
                className={input}
              />

              <input
                name="speciality"
                placeholder="Speciality"
                value={formData.speciality || ""}
                onChange={handleChange}
                className={input}
              />

              <input
                name="city"
                placeholder="City"
                value={formData.city || ""}
                onChange={handleChange}
                className={input}
              />

              <input
                name="address"
                placeholder="Address"
                value={formData.address || ""}
                onChange={handleChange}
                className={input}
              />
            </div>
          </section>

          {/* PRICING */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>
              Pricing & Category
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="number"
                name="hourlyPrice"
                placeholder="Hourly Price"
                value={formData.hourlyPrice ?? ""}
                onChange={handleChange}
                className={input}
              />

              <select
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                className={input}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* BIO */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>Bio</h3>
            <textarea
              name="bio"
              rows={4}
              placeholder="Short description about the provider"
              value={formData.bio || ""}
              onChange={handleChange}
              className={input}
            />
          </section>

          {/* AVATAR */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>
              Profile Picture
            </h3>

            <div className="flex items-center gap-6">
              {/* Preview */}
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className={`w-24 h-24 rounded-full object-cover border shadow-sm ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                />
              ) : (
                <div className={`w-24 h-24 rounded-full border border-dashed flex items-center justify-center text-sm ${isDark ? 'text-gray-400 border-gray-600' : 'text-gray-400 border-gray-300'}`}>
                  No Image
                </div>
              )}

              {/* Upload control */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="avatarUpload"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl
                  bg-blue-600 text-white text-sm font-medium cursor-pointer
                  hover:bg-blue-700 transition shadow-sm"
                >
                  Choose Image
                </label>

                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                  {avatarFile ? avatarFile.name : "No file chosen"}
                </span>
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push("/dashboard/providers")}
              className={`px-6 py-3 rounded-xl transition ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl transition ${isDark ? 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50' : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'}`}
            >
              {loading ? "Saving..." : "Save Provider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
