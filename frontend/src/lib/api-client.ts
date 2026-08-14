const getApiBaseUrl = () => {
  const envUrl =
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL);
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://stockerz-ro.onrender.com";
  }
  return "http://localhost:5000";
};

const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = "stockerz_auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `API Request failed with status ${response.status}`);
    }

    return data;
  } catch (err: any) {
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      throw new Error(`Unable to connect to backend at ${API_BASE_URL}. If backend is hosted on Render, it may take 15-30s to wake up from idle. Please try again in a moment.`);
    }
    throw err;
  }
}

export const apiClient = {
  auth: {
    async register(payload: { email: string; password: string; shop?: any }) {
      const res = await request<{ user: any; shop: any; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },
    async signup(payload: { email: string; password: string; shop?: any }) {
      const res = await request<{ user: any; shop: any; token: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },
    async login(payload: { email: string; password: string }) {
      const res = await request<{ user: any; shop: any; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },
    async logout() {
      await request("/api/auth/logout", { method: "POST" }).catch(() => {});
      clearStoredToken();
    },
    async sendOtp(email: string) {
      return request("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    async verifyOtp(email: string, code: string) {
      const res = await request<{ valid: boolean; user?: any; shop?: any; token?: string }>("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },
    async resetPassword(payload: { email: string; code?: string; newPassword: string }) {
      return request("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async getMe() {
      return request<{ user: any; shop: any }>("/api/auth/me");
    },
    getSession() {
      const token = getStoredToken();
      if (!token) return Promise.resolve({ data: { session: null } });
      return this.getMe()
        .then((res) => ({ data: { session: { user: res.user, shop: res.shop } } }))
        .catch(() => {
          clearStoredToken();
          return { data: { session: null } };
        });
    },
  },

  shops: {
    async getCurrent() {
      return request("/api/shops/current");
    },
    async updateCurrent(payload: any) {
      return request("/api/shops/current", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
  },

  products: {
    async list() {
      return request<any[]>("/api/products");
    },
    async create(payload: any) {
      return request("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: any) {
      return request(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return request(`/api/products/${id}`, {
        method: "DELETE",
      });
    },
  },

  technicians: {
    async list() {
      return request<any[]>("/api/technicians");
    },
    async create(payload: any) {
      return request("/api/technicians", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: any) {
      return request(`/api/technicians/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return request(`/api/technicians/${id}`, {
        method: "DELETE",
      });
    },
  },

  sales: {
    async list() {
      return request<any[]>("/api/sales");
    },
    async create(payload: any) {
      return request("/api/sales", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return request(`/api/sales/${id}`, {
        method: "DELETE",
      });
    },
  },

  services: {
    async list() {
      return request<any[]>("/api/services");
    },
    async create(payload: any) {
      return request("/api/services", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: any) {
      return request(`/api/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return request(`/api/services/${id}`, {
        method: "DELETE",
      });
    },
  },

  emi: {
    async list() {
      return request<any[]>("/api/emi");
    },
    async create(payload: any) {
      return request("/api/emi", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return request(`/api/emi/${id}`, {
        method: "DELETE",
      });
    },
  },

  admin: {
    async getUsers() {
      return request<any[]>("/api/admin/users");
    },
    async getShops() {
      return request<any[]>("/api/admin/shops");
    },
  },
};
