import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: {
    name: string;
    collegeId: string;
    email: string;
    password: string;
    college?: string;
    phone?: string;
    avatarUrl?: string;
  }) => api.post("/auth/register", data),

  login: (data: { loginIdentifier?: string; email?: string; collegeId?: string; password: string; college?: string }) =>
    api.post("/auth/login", data),

  getMe: () => api.get("/auth/me"),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post("/auth/reset-password", data),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email/${token}`),
};

// User API
export const userApi = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (data: { name?: string; college?: string; phone?: string; avatarUrl?: string }) =>
    api.put("/users/profile", data),

  uploadAvatar: (formData: FormData) =>
    api.post("/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getWallet: () => api.get("/users/wallet"),

  getPublicProfile: (id: string) => api.get(`/users/${id}/public`),
};

// Listing API
export const listingApi = {
  getAll: (params?: Record<string, any>) =>
    api.get("/listings", { params }),

  getById: (id: string) => api.get(`/listings/${id}`),

  create: (data: any) =>
    api.post("/listings", data),

  update: (id: string, data: any) =>
    api.put(`/listings/${id}`, data),

  delete: (id: string) => api.delete(`/listings/${id}`),

  getMine: () => api.get("/listings/my"),
};

// Booking API
export const bookingApi = {
  create: (data: {
    listingId: string;
    startDate: string;
    endDate: string;
    rentalType?: "DAY" | "NIGHT";
  }) => api.post("/bookings", data),

  getMy: (params?: { role?: string; status?: string }) =>
    api.get("/bookings/my", { params }),

  getById: (id: string) => api.get(`/bookings/${id}`),

  verifyPickup: (data: { qrToken?: string; bookingCode?: string }) =>
    api.post("/bookings/verify-pickup", data),

  verifyReturn: (id: string) =>
    api.post(`/bookings/${id}/verify-return`),

  cancel: (id: string) =>
    api.post(`/bookings/${id}/cancel`),
};

// Favorite API
export const favoriteApi = {
  toggle: (listingId: string) => api.post("/favorites/toggle", { listingId }),
  getMy: () => api.get("/favorites/my"),
};

// Message API
export const messageApi = {
  send: (data: {
    receiverId: string;
    content: string;
    listingId?: string;
    bookingId?: string;
  }) => api.post("/messages", data),

  getConversations: () => api.get("/messages/conversations"),

  getWithUser: (peerId: string) => api.get(`/messages/${peerId}`),
};

// Notification API
export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

// Review API
export const reviewApi = {
  create: (data: {
    bookingId: string;
    rating: number;
    clothingRating?: number;
    comment?: string;
  }) => api.post("/reviews", data),

  getByListing: (listingId: string) =>
    api.get(`/reviews/listing/${listingId}`),

  getByUser: (userId: string) => api.get(`/reviews/user/${userId}`),
};

// Admin API
export const adminApi = {
  getUsers: (params?: Record<string, string>) =>
    api.get("/admin/users", { params }),

  getBookings: (params?: Record<string, string>) =>
    api.get("/admin/bookings", { params }),

  getTransactions: (params?: Record<string, string>) =>
    api.get("/admin/transactions", { params }),

  getDisputes: (params?: Record<string, string>) =>
    api.get("/admin/disputes", { params }),

  resolveDispute: (id: string, data: { resolution: string; status: string }) =>
    api.put(`/admin/disputes/${id}/resolve`, data),

  getAnalytics: () => api.get("/admin/analytics"),

  flagListing: (id: string, action: "flag" | "approve") =>
    api.put(`/admin/listings/${id}/flag`, { action }),
};

export default api;

