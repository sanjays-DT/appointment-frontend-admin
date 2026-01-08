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
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
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
      setImage(null);
      setPreview('');
      setErrors({});
    }
  }, [categoryId]);

  /* FETCH CATEGORY (EDIT MODE) */
  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      try {
        const res = await getCategory(categoryId);
        setName(res.data.data.name);
        setDescription(res.data.data.description || '');

        // Existing image preview from backend
        setPreview(`http://localhost:5000/api/categories/${categoryId}/image`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch category');
      }
    };

    fetchCategory();
  }, [categoryId]);

  /* -------------------- VALIDATION -------------------- */

  const validateForm = () => {
    const newErrors: any = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    if (image) {
      if (!image.type.startsWith('image/')) {
        newErrors.image = 'Only image files are allowed';
      } else if (image.size > 2 * 1024 * 1024) {
        newErrors.image = 'Image size must be less than 2MB';
      }
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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (image) formData.append('image', image);

      if (categoryId) {
        await updateCategory(categoryId, formData);
        toast.success('Category updated successfully');
      } else {
        await createCategory(formData);
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
    <div className="w-full px-4 py-6 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* NAME */}
          <label className="flex flex-col">
            Name *
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={`border p-3 rounded mt-1 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}
          </label>

          {/* IMAGE */}
          <label className="flex flex-col">
            Image

            <div
              className={`flex items-center gap-4 border rounded-lg px-4 py-3 mt-1 transition
                ${
                  errors.image
                    ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-400'
                    : 'border-gray-300 focus-within:ring-2 focus-within:ring-blue-400'
                }`}
            >
              <input
                type="file"
                accept="image/*"
                id="categoryImage"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setImage(file);
                    setPreview(URL.createObjectURL(file)); // local preview
                    setErrors((p) => ({ ...p, image: undefined }));
                  }
                }}
              />

              <label
                htmlFor="categoryImage"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer transition"
              >
                Choose File
              </label>

              <span className="text-sm text-gray-600 truncate">
                {image ? image.name : 'No file chosen'}
              </span>
            </div>

            {errors.image && (
              <span className="text-red-500 text-sm mt-1">{errors.image}</span>
            )}

            {preview && (
              <img
                src={preview}
                alt="Category Preview"
                className="mt-3 w-32 h-32 object-cover rounded-lg border"
              />
            )}
          </label>

          {/* DESCRIPTION */}
          <label className="flex flex-col">
            Description *
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: undefined }));
              }}
              rows={4}
              className={`border p-3 rounded mt-1 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <span className="text-red-500 text-sm">
                {errors.description}
              </span>
            )}
          </label>

          {/* ACTIONS */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-50"
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
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
