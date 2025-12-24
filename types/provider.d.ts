// matches your backend schema exactly
export interface Provider {
  _id?: string;
  categoryId?: string;
  name: string;
  speciality: string;
  bio?: string;
  avatar?: string;
  hourlyPrice: number;
  address: string;
  city: string;
  weeklyAvailability: { day: string; startTime: string; endTime: string }[];
  unavailableDates: string[];
}
