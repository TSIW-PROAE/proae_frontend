import axios, { AxiosInstance } from "axios";

export default interface IHttpClient {
  get<T>(url: string, token?: string): Promise<T>;

  post<T>(url: string, data: unknown, token: string): Promise<T>;

  put<T>(url: string, data: unknown, token: string): Promise<T>;

  patch<T>(url: string, data: unknown, token: string): Promise<T>; // <-- Add this

  delete<T>(url: string, token: string): Promise<T>;

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
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      const response = await this.axiosInstance.get<T>(url, {
        headers,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Erro na requisição GET"
        );
      }
      throw error;
    }
  }

  async post<T>(url: string, data: unknown, token: string): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      // if (axios.isAxiosError(error)) {
      //   throw new Error(
      //     error.response?.data?.message || "Erro na requisição POST"
      //   );
      // }
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Erro na requisição PUT"
        );
      }
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Erro na requisição DELETE"
        );
      }
      throw error;
    }
  }

  async patch<T>(url: string, data: unknown, token: string): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Erro na requisição PATCH"
        );
      }
      throw error;
    }
  }
}
