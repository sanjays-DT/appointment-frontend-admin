'use client';

import React, { useEffect, useState } from "react";
import { Provider } from "@/types/provider";
import { createProvider, getProvider, updateProvider } from "@/services/providerService";
import { getCategories } from "@/services/categoryService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getProviderAvatarURL } from "@/services/providerService";
import baseURL from "@/lib/axios";

interface ProviderFormProps {
  providerId?: string;
}

export default function ProviderForm({ providerId }: ProviderFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
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

  const [errors, setErrors] = useState<Partial<Record<keyof Provider, string>>>({});
  const [title, setTitle] = useState("Add Provider");

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  /* ---------------- FETCH PROVIDER FOR EDIT ---------------- */
  useEffect(() => {
    if (!providerId) return;

    setTitle("Edit Provider");

    const fetchProvider = async () => {
      try {
        const data = await getProvider(providerId);
        setFormData({
          ...data,
          categoryId: typeof data.categoryId === "object" ? (data.categoryId as any)._id : data.categoryId,
        });

        const axiosBaseUrl = (baseURL as any)?.defaults?.baseURL ?? "";
        setPreview(getProviderAvatarURL(providerId, axiosBaseUrl));
      } catch {
        toast.error("Failed to fetch provider");
      }
    };

    fetchProvider();
  }, [providerId]);

  /* ---------------- HANDLE INPUT CHANGE ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "hourlyPrice" ? Number(value) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /* ---------------- HANDLE AVATAR CHANGE ---------------- */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
      setErrors(prev => ({ ...prev, avatar: undefined }));
    }
  };

  /* ---------------- VALIDATE FORM ---------------- */
  const validateForm = () => {
    const newErrors: Partial<Record<keyof Provider, string>> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.speciality?.trim()) newErrors.speciality = "Speciality is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.hourlyPrice || formData.hourlyPrice <= 0) newErrors.hourlyPrice = "Hourly price must be greater than 0";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLE SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name!);
      data.append("speciality", formData.speciality!);
      data.append("city", formData.city!);
      data.append("address", formData.address!);
      data.append("hourlyPrice", String(formData.hourlyPrice));
      data.append("bio", formData.bio || "");
      data.append("categoryId", formData.categoryId!);

      if (avatarFile) data.append("avatar", avatarFile);

      if (providerId) {
        await updateProvider(providerId, data);
        toast.success("Provider updated successfully");
      } else {
        await createProvider(data);
        toast.success("Provider created successfully");
      }

      router.push("/dashboard/providers");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save provider");
    } finally {
      setLoading(false);
    }
  };
  /* ---------------- STYLES ---------------- */
  const inputBase = "w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 transition";
  const inputClass = (error?: string) =>
    `${inputBase} ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`;

  
  return (
    <div className="w-full px-4 py-6 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">
          <span className="text-red-500">*</span> indicates required fields
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* NAME */}
          <label className="flex flex-col">
            Name <span className="text-red-500">*</span>
            <input name="name" value={formData.name || ""} onChange={handleChange} className={inputClass(errors.name)} />
            {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
          </label>

          {/* SPECIALITY */}
          <label className="flex flex-col">
            Speciality <span className="text-red-500">*</span>
            <input name="speciality" value={formData.speciality || ""} onChange={handleChange} className={inputClass(errors.speciality)} />
            {errors.speciality && <span className="text-sm text-red-500">{errors.speciality}</span>}
          </label>

          {/* CITY */}
          <label className="flex flex-col">
            City <span className="text-red-500">*</span>
            <input name="city" value={formData.city || ""} onChange={handleChange} className={inputClass(errors.city)} />
            {errors.city && <span className="text-sm text-red-500">{errors.city}</span>}
          </label>

          {/* ADDRESS */}
          <label className="flex flex-col">
            Address <span className="text-red-500">*</span>
            <input name="address" value={formData.address || ""} onChange={handleChange} className={inputClass(errors.address)} />
            {errors.address && <span className="text-sm text-red-500">{errors.address}</span>}
          </label>

          {/* HOURLY PRICE */}
          <label className="flex flex-col">
            Hourly Price <span className="text-red-500">*</span>
            <input type="number" name="hourlyPrice" value={formData.hourlyPrice ?? 0} onChange={handleChange} className={inputClass(errors.hourlyPrice)} />
            {errors.hourlyPrice && <span className="text-sm text-red-500">{errors.hourlyPrice}</span>}
          </label>

          {/* CATEGORY */}
          <label className="flex flex-col">
            Category <span className="text-red-500">*</span>
            <select name="categoryId" value={formData.categoryId || ""} onChange={handleChange} className={inputClass(errors.categoryId)}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="text-sm text-red-500">{errors.categoryId}</span>}
          </label>

          {/* BIO */}
          <label className="flex flex-col">
            Bio
            <textarea name="bio" value={formData.bio || ""} onChange={handleChange} className={inputClass()} rows={4} />
          </label>

          {/* AVATAR */}
          <label className="flex flex-col">
            Avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-2 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-600
                hover:file:bg-blue-100"
            />
            {preview && (
              <img
                src={preview}
                alt="Avatar Preview"
                className="mt-2 w-32 h-32 object-cover rounded-full border"
              />
            )}
          </label>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-4">
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50">
              {loading ? "Saving..." : providerId ? "Update Provider" : "Add Provider"}
            </button>

            <button type="button" onClick={() => router.push("/dashboard/providers")} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
