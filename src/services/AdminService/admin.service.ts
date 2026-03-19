import { FetchAdapter } from "../api";
import { DefaultResponse } from "@/types/auth";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/auth";

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
