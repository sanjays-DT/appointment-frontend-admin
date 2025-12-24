'use client';

import React, { useEffect, useState } from "react";
import { Provider } from "@/types/provider";
import {
  createProvider,
  getProvider,
  updateProvider,
} from "@/services/providerService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface ProviderFormProps {
  providerId?: string;
}

export default function ProviderForm({ providerId }: ProviderFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Provider>>({
    name: "",
    speciality: "",
    city: "",
    address: "",
    hourlyPrice: 0,
    categoryId: "",
    bio: "",
    avatar: "",
    weeklyAvailability: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Provider, string>>>(
    {}
  );

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Add Provider");

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (!providerId) return;

    setTitle("Edit Provider");
    const fetchProvider = async () => {
      try {
        const data = await getProvider(providerId);
        setFormData(data);
      } catch {
        toast.error("Failed to fetch provider");
      }
    };
    fetchProvider();
  }, [providerId]);

  /* ---------------- CHANGE ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyPrice" ? Number(value) : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Provider, string>> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.speciality?.trim())
      newErrors.speciality = "Speciality is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.address?.trim())
      newErrors.address = "Address is required";

    if (
      formData.hourlyPrice === undefined ||
      formData.hourlyPrice <= 0
    ) {
      newErrors.hourlyPrice = "Hourly price must be greater than 0";
    }

    if (!formData.categoryId?.trim())
      newErrors.categoryId = "Category is required";

    if (
      formData.avatar?.trim() &&
      !/^https?:\/\/.+/i.test(formData.avatar.trim())
    ) {
      newErrors.avatar = "Enter a valid image URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setLoading(true);

    try {
      if (providerId) {
        await updateProvider(providerId, formData as Provider);
        toast.success("Provider updated successfully");
      } else {
        await createProvider(formData as Provider);
        toast.success("Provider created successfully");
      }

      router.push("/dashboard/providers");
    } catch {
      toast.error("Failed to save provider");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 transition";

  const inputClass = (error?: string) =>
    `${inputBase} ${
      error
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-blue-400"
    }`;

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">
          <span className="text-red-500">*</span> indicates required fields
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NAME */}
            <label className="flex flex-col">
              Name <span className="text-red-500">*</span>
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className={inputClass(errors.name)}
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name}</span>
              )}
            </label>

            {/* SPECIALITY */}
            <label className="flex flex-col">
              Speciality <span className="text-red-500">*</span>
              <input
                name="speciality"
                value={formData.speciality || ""}
                onChange={handleChange}
                className={inputClass(errors.speciality)}
              />
              {errors.speciality && (
                <span className="text-sm text-red-500">
                  {errors.speciality}
                </span>
              )}
            </label>

            {/* CITY */}
            <label className="flex flex-col">
              City <span className="text-red-500">*</span>
              <input
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                className={inputClass(errors.city)}
              />
              {errors.city && (
                <span className="text-sm text-red-500">{errors.city}</span>
              )}
            </label>

            {/* ADDRESS */}
            <label className="flex flex-col">
              Address <span className="text-red-500">*</span>
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className={inputClass(errors.address)}
              />
              {errors.address && (
                <span className="text-sm text-red-500">
                  {errors.address}
                </span>
              )}
            </label>

            {/* PRICE */}
            <label className="flex flex-col">
              Hourly Price <span className="text-red-500">*</span>
              <input
                type="number"
                name="hourlyPrice"
                value={formData.hourlyPrice ?? 0}
                onChange={handleChange}
                className={inputClass(errors.hourlyPrice)}
              />
              {errors.hourlyPrice && (
                <span className="text-sm text-red-500">
                  {errors.hourlyPrice}
                </span>
              )}
            </label>

            {/* CATEGORY */}
            <label className="flex flex-col">
              Category ID <span className="text-red-500">*</span>
              <input
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                className={inputClass(errors.categoryId)}
              />
              {errors.categoryId && (
                <span className="text-sm text-red-500">
                  {errors.categoryId}
                </span>
              )}
            </label>

            {/* BIO */}
            <label className="flex flex-col lg:col-span-2">
              Bio
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                className={inputClass()}
                rows={4}
              />
            </label>

            {/* AVATAR */}
            <label className="flex flex-col lg:col-span-2">
              Avatar URL
              <input
                name="avatar"
                value={formData.avatar || ""}
                onChange={handleChange}
                className={inputClass(errors.avatar)}
              />
              {errors.avatar && (
                <span className="text-sm text-red-500">
                  {errors.avatar}
                </span>
              )}
            </label>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : providerId ? "Update Provider" : "Add Provider"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/providers")}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
