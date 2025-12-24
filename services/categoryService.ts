// services/categoryService.ts
import axios from '../lib/axios';

interface CategoryData {
  name: string;
  description?: string;
  image?: string;
}

// Get all categories
export const getCategories = async () => {
  return await axios.get('/categories');
};

// Get single category by ID
export const getCategory = async (id: string) => {
  return await axios.get(`/categories/${id}`);
};

// Create a new category
export const createCategory = async (data: CategoryData) => {
  return await axios.post('/categories', data);
};

// Update existing category
export const updateCategory = async (id: string, data: CategoryData) => {
  return await axios.put(`/categories/${id}`, data);
};

// Delete category
export const deleteCategory = async (id: string) => {
  return await axios.delete(`/categories/${id}`);
};
