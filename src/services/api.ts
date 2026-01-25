import axios, { AxiosInstance } from "axios";

export interface HttpResponse<T> {
  data: T;
  headers: Record<string, string>;
  status: number;
}

export default interface IHttpClient {
  get<T>(url: string): Promise<T>;

  post<T>(url: string, data: unknown): Promise<HttpResponse<T>>;

  put<T>(url: string, data: unknown): Promise<T>;

  patch<T>(url: string, data: unknown): Promise<T>;

  delete<T>(url: string): Promise<T>;

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

  async get<T>(url: string): Promise<T> {
    try {

      const response = await this.axiosInstance.get<T>(url, {
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  }

  async post<T>(url: string, data: unknown): Promise<HttpResponse<T>> {
    try {

      const response = await this.axiosInstance.post<T>(url, data, {
        withCredentials: true,
      });
      return {
        data: response.data,
        headers: response.headers as Record<string, string>,
        status: response.status,
      };
    } catch (error: any) {
      throw error.response.data;
    }
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {

      const response = await this.axiosInstance.delete<T>(url, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  }

  async patch<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  }
}
