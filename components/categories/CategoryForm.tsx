'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  createCategory,
  getCategory,
  updateCategory,
} from '../../services/categoryService';

interface CategoryFormProps {
  categoryId?: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('Add Category');

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    image?: string;
  }>({});

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    if (categoryId) {
      setTitle('Edit Category');
    } else {
      setTitle('Add Category');
      setName('');
      setDescription('');
      setImage('');
      setErrors({});
    }
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      try {
        const res = await getCategory(categoryId);
        setName(res.data.data.name);
        setDescription(res.data.data.description || '');
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch category');
      }
    };

    fetchCategory();
  }, [categoryId]);

  /* -------------------- VALIDATION -------------------- */

  const validateForm = () => {
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (image && !/^https?:\/\/.+/i.test(image)) {
      newErrors.image = 'Enter a valid image URL';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the highlighted errors');
      return;
    }

    setLoading(true);

    try {
      const payload: any = { name, description };
      if (image) payload.image = image;

      if (categoryId) {
        await updateCategory(categoryId, payload);
        toast.success('Category updated successfully');
      } else {
        await createCategory(payload);
        toast.success('Category created successfully');
      }

      router.push('/dashboard/categories');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          <span className="text-red-500">*</span> indicates required fields
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NAME */}
            <label className="flex flex-col">
              <span className="flex items-center gap-1 font-medium">
                Name <span className="text-red-500">*</span>
              </span>

              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`border p-3 rounded mt-1 w-full transition focus:outline-none focus:ring-2
                  ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-400'
                      : 'focus:ring-blue-400'
                  }`}
                placeholder="Category Name"
              />

              {errors.name && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.name}
                </span>
              )}
            </label>

            {/* IMAGE */}
            <label className="flex flex-col">
              <span className="font-medium">Image URL</span>

              <input
                type="text"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setErrors((prev) => ({ ...prev, image: undefined }));
                }}
                className={`border p-3 rounded mt-1 w-full transition focus:outline-none focus:ring-2
                  ${
                    errors.image
                      ? 'border-red-500 focus:ring-red-400'
                      : 'focus:ring-blue-400'
                  }`}
                placeholder="Enter image URL"
              />

              {errors.image && (
                <span className="text-sm text-red-500 mt-1">
                  {errors.image}
                </span>
              )}
            </label>
          </div>

          {/* DESCRIPTION */}
          <label className="flex flex-col">
            <span className="flex items-center gap-1 font-medium">
              Description <span className="text-red-500">*</span>
            </span>

            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className={`border p-3 rounded mt-1 w-full transition focus:outline-none focus:ring-2
                ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-400'
                    : 'focus:ring-blue-400'
                }`}
              placeholder="Category description"
              rows={4}
            />

            {errors.description && (
              <span className="text-sm text-red-500 mt-1">
                {errors.description}
              </span>
            )}
          </label>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : categoryId
                ? 'Update Category'
                : 'Create Category'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/categories')}
              className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
