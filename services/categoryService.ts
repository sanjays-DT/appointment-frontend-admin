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

export const createCategory = async (data: FormData) => {
  return axios.post("/categories", data);
};

export const updateCategory = async (id: string, data: FormData) => {
  return axios.put(`/categories/${id}`, data);
};


// Delete category
export const deleteCategory = async (id: string) => {
  return await axios.delete(`/categories/${id}`);
};
