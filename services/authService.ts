import axiosInstance from "@/lib/axios";

export async function loginUser(email: string, password: string) {
  try {
    const { data } = await axiosInstance.post("/auth/login", { email, password });

    // Store token in localStorage for client-side API calls
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
    }

    // Optional: store token in cookie if using SSR
    document.cookie = `token=${data.token}; path=/;`;

    return data; // you can also return user info if backend sends it
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
}
