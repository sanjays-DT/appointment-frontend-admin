import { Provider } from "./provider";

export interface Appointment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  provider: Provider;
  date: string; // ISO date string
  time: string; // e.g., "14:00"
  status: "pending" | "approved" | "rejected" | "rescheduled";
  createdAt: string;
  updatedAt: string;
}
