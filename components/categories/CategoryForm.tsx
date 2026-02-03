'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  createCategory,
  getSingleCategory,
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
  const [errors, setErrors] = useState<{ name?: string; description?: string; image?: string }>({});

  const [isDark, setIsDark] = useState(false);

  /* -------------------- THEME SYNC -------------------- */
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
        const res = await getSingleCategory(categoryId);
        setName(res.data.data.name);
        setDescription(res.data.data.description || '');
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
      if (!image.type.startsWith('image/')) newErrors.image = 'Only image files are allowed';
      else if (image.size > 2 * 1024 * 1024) newErrors.image = 'Image size must be less than 2MB';
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

  /* -------------------- UI STYLES -------------------- */
  const inputBase =
    'w-full rounded-xl border px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 transition';
  const input =
    `${inputBase} ${isDark ? 'bg-gray-800 border-gray-600 text-gray-200 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'}`;

  const pageBg = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const formBg = isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900';
  const labelText = isDark ? 'text-gray-200' : 'text-gray-700';

  return (
    <div className={`${pageBg} w-full px-6 py-8 min-h-screen`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            Create and manage service categories
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`${formBg} rounded-2xl border shadow-sm p-8 space-y-8`}
        >
          {/* BASIC INFO */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Category Information
            </h3>

            <div className="space-y-6">
              {/* NAME */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  className={`${input} ${errors.name ? 'border-red-500 focus:ring-red-400' : ''}`}
                  placeholder="e.g. Plumbing, Electrical"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((p) => ({ ...p, description: undefined }));
                  }}
                  className={`${input} ${errors.description ? 'border-red-500 focus:ring-red-400' : ''}`}
                  placeholder="Brief description about this category"
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </section>

          {/* IMAGE UPLOAD */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Category Image
            </h3>

            <div className="flex items-center gap-6">
              {/* Preview */}
              {preview ? (
                <img
                  src={preview}
                  alt="Category Preview"
                  className="w-24 h-24 rounded-xl object-cover border shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}

              {/* Upload */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="categoryImage"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl
                    bg-blue-600 text-white text-sm font-medium cursor-pointer
                    hover:bg-blue-700 transition shadow-sm"
                >
                  Choose Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  id="categoryImage"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setImage(file);
                      setPreview(URL.createObjectURL(file));
                      setErrors((p) => ({ ...p, image: undefined }));
                    }
                  }}
                />

                <span className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-sm`}>
                  {image ? image.name : 'No file chosen'}
                </span>
                {errors.image && <span className="text-sm text-red-500">{errors.image}</span>}
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/dashboard/categories')}
              className={`px-6 py-3 rounded-xl ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : categoryId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
