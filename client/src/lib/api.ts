import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "user" | "driver";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "driver";
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  _id: string;
  userId: string;
  driverId?: string;
  fromLocationId: number;
  toLocationId: number;
  fromLocationName: string;
  toLocationName: string;
  rideType: "bike" | "car" | "ricksha";
  fare: number;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  bookingTime: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  // Driver information when populated
  driver?: {
    _id: string;
    name: string;
    email: string;
  };
  // Passenger information when populated (for driver view)
  passenger?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface BookTripData {
  fromLocationId: number;
  toLocationId: number;
  rideType: "bike" | "car" | "ricksha";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

// API functions
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// Trip API
export const tripApi = {
  bookTrip: async (data: BookTripData) => {
    const response = await api.post("/trips/book", data);
    return response.data;
  },

  getUserTrips: async (limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await api.get("/trips/user", { params });
    return response.data;
  },

  getDriverTrips: async (limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await api.get("/trips/driver", { params });
    return response.data;
  },

  getActiveTrips: async () => {
    const response = await api.get("/trips/active");
    return response.data;
  },

  getTripDetails: async (tripId: string) => {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  },

  updateTripStatus: async (tripId: string, status: string) => {
    const response = await api.patch(`/trips/${tripId}/status`, { status });
    return response.data;
  },

  acceptTrip: async (tripId: string) => {
    const response = await api.patch(`/trips/${tripId}/accept`);
    return response.data;
  },

  getPendingTrips: async () => {
    const response = await api.get("/trips/pending");
    return response.data;
  },
};

// Location API
export const locationApi = {
  getLocations: async () => {
    const response = await api.get("/locations");
    return response.data;
  },

  calculatePrice: async (
    fromLocationId: number,
    toLocationId: number,
    rideType: string
  ) => {
    const response = await api.get("/locations/calculate-price", {
      params: { fromLocationId, toLocationId, rideType },
    });
    return response.data;
  },
};

export default api;
