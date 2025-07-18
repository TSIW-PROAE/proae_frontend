import axios, { AxiosInstance } from "axios";
import { toast } from "react-hot-toast";

export default interface IHttpClient {
  get<T>(url: string, token?: string): Promise<T>;

  post<T>(url: string, data: unknown, token: string): Promise<T>;

  put<T>(url: string, data: unknown, token: string): Promise<T>;

  patch<T>(url: string, data: unknown, token: string): Promise<T>; // <-- Add this

  delete<T>(url: string, token?: string): Promise<T>;

  setHeader(name: string, value: string): void;
}

export class FetchAdapter implements IHttpClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  setHeader(name: string, value: string): void {
    this.axiosInstance.defaults.headers.common[name] = value;
  }

  async get<T>(url: string, token?: string): Promise<T> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await this.axiosInstance.get<T>(url, {
        headers,
      });

      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }

  async post<T>(url: string, data: unknown, token: string): Promise<T> {
    try {
      const headers: any = {};
      if (token && token.trim() !== "") {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await this.axiosInstance.post<T>(url, data, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }

  async put<T>(url: string, data: unknown, token: string): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }

  async delete<T>(url: string, token?: string): Promise<T> {
    try {
      const headers: any = {};
      if (token && token.trim() !== "") {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await this.axiosInstance.delete<T>(url, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }

  async patch<T>(url: string, data: unknown, token: string): Promise<T> {
    try {
      const headers: any = {};
      if (token && token.trim() !== "") {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await this.axiosInstance.patch<T>(url, data, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
      throw error.response.data;
    }
  }
}
