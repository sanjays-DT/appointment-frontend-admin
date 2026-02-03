import axios from "@/lib/axios";
import { AnalyticsResponse } from "@/types/analytics";

// Analytics Services
export const getAnalytics = () => {
  return axios.get<AnalyticsResponse>("/admin");
};

