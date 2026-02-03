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
export const getSingleCategory = async (id: string) => {
  return await axios.get(`/admin/categories/${id}`);
};

export const createCategory = async (data: FormData) => {
  return axios.post("/admin/categories", data);
};

export const updateCategory = async (id: string, data: FormData) => {
  return axios.put(`/admin/categories/${id}`, data);
};


// Delete category
export const deleteCategory = async (id: string) => {
  return await axios.delete(`/admin/categories/${id}`);
};


