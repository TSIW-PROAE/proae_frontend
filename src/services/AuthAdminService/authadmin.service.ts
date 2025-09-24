import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { UserLoginResponse, UserSignup, DefaultResponse } from "@/types/auth";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/auth";

export class AuthAdminService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async login(email: string, password: string): Promise<UserLoginResponse> {
    const response = await this.httpClient.post<UserLoginResponse>(
      `${BASE_URL}/login`,
      {
        email,
        password,
      }
    );
    return response.data;
  }

  async signup(data: UserSignup): Promise<DefaultResponse> {
    const response = await this.httpClient.post<DefaultResponse>(
      `${BASE_URL}/signup-admin`,
      data
    );
    return response.data;
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
