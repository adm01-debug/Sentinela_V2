import { appConfig } from "@/config";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = appConfig.api.url) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      url += "?" + new URLSearchParams(params).toString();
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...init.headers,
    };

    const response = await fetch(url, { ...init, headers });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(data) });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
export { ApiClient };
