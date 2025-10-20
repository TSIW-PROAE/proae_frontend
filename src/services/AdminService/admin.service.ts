import { FetchAdapter } from "../BaseRequestService/HttpClient";
import {  DefaultResponse } from "@/types/auth";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/auth";

export class AdminService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async approveAdmin(token: string): Promise<DefaultResponse> {
    const response = await this.httpClient.get<DefaultResponse>(
      `${BASE_URL}/approve-admin/${token}`
    );
    return response.data;
  }

  async rejectAdmin(token: string): Promise<DefaultResponse>{
    const response = await this.httpClient.get<DefaultResponse>(
        `${BASE_URL}/reject-admin/${token}`
    );
    return response.data;
  }
}
