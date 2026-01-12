import { api } from "./client";

export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
  register: (data: { email: string; password: string; name: string }) => api.post("/auth/register", data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data: { token: string; password: string }) => api.post("/auth/reset-password", data),
};

export const usersApi = {
  list: (params?: Record<string, string>) => api.get("/users", { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: unknown) => api.post("/users", data),
  update: (id: string, data: unknown) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const employeesApi = {
  list: (params?: Record<string, string>) => api.get("/employees", { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: unknown) => api.post("/employees", data),
  update: (id: string, data: unknown) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

export const reportsApi = {
  list: (params?: Record<string, string>) => api.get("/reports", { params }),
  get: (id: string) => api.get(`/reports/${id}`),
  generate: (data: unknown) => api.post("/reports/generate", data),
  export: (id: string, format: string) => api.get(`/reports/${id}/export`, { params: { format } }),
};
