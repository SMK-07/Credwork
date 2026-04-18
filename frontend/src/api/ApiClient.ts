import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Phase 9 — ApiClient class wrapping axios
// Attaches Authorization header from localStorage on every request
// All frontend API calls go through this class — no direct axios usage

export class ApiClient {
  private static instance: ApiClient;
  private readonly client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? '/api',
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor — attach JWT token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('credwork_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor — handle 401 globally
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('credwork_token');
          localStorage.removeItem('credwork_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete<T>(url, config);
    return response.data;
  }

  // For multipart form data (file uploads)
  public async postForm<T>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const apiClient = ApiClient.getInstance();
