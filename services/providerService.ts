import axios from "../lib/axios";
import { Provider } from "../types/provider";


export const getProviders = async (): Promise<Provider[]> => {
  const res = await axios.get('/admin/providers');
  return res.data;
};

export const getProvider = async (id: string): Promise<Provider> => {
  const res = await axios.get(`/admin/providers/${id}`);
  return res.data;
};

export const createProvider = async (data: FormData) => {
  return await axios.post("/admin/providers", data);
};

export const updateProvider = async (id: string, data: FormData) => {
  return await axios.put(`/admin/providers/${id}`,data);
};

export const getProviderAvatarURL = (id: string, baseURL: string) => {
  return `${baseURL}/admin/providers/${id}/avatar`;
};

export const deleteProvider = async (id: string): Promise<void> => {
  await axios.delete(`/admin/providers/${id}`);
};
