import axios from "../lib/axios";
import { Provider } from "../types/provider";


export const getProviders = async (): Promise<Provider[]> => {
  const res = await axios.get('/providers');
  return res.data;
};

export const getProvider = async (id: string): Promise<Provider> => {
  const res = await axios.get(`/providers/${id}`);
  return res.data;
};

export const createProvider = async (data: Provider): Promise<Provider> => {
  const res = await axios.post('/providers', data);
  return res.data;
};

export const updateProvider = async (id: string, data: Provider): Promise<Provider> => {
  const res = await axios.put(`/providers/${id}`, data);
  return res.data;
};

export const deleteProvider = async (id: string): Promise<void> => {
  await axios.delete(`/providers/${id}`);
};
