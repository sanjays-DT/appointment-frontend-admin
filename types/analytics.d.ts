export interface AnalyticsItem {
  label: string;
  value: number;
}

export interface AnalyticsResponse {
  bookingsPerWeek: AnalyticsItem[];
  categoryUsage: AnalyticsItem[];
  providerUtilization: AnalyticsItem[];
}
