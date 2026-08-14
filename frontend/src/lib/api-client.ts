const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) ||
  "http://localhost:5000";

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API Request failed with status ${response.status}`);
  }

  return data;
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
      return request<{ valid: boolean }>("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
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
