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

