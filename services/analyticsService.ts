import axios from "@/lib/axios";
import { AnalyticsResponse } from "@/types/analytics";

export const getAnalytics = () => {
  return axios.get<AnalyticsResponse>("/analytics");
};
