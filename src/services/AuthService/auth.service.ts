import { extractCookieFromHeaders, setCookie } from "@/utils/utils";
import { FetchAdapter } from "../BaseRequestService/HttpClient";
import {
  UserLoginResponse,
  UserSignup,
  DefaultResponse,
  IResetPassword,
  UserLogin,
} from "@/types/auth";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/auth";

export default class AuthService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async login(data: UserLogin): Promise<UserLoginResponse> {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/login`;
    const response = await this.httpClient.post<UserLoginResponse>(url, data);
    const tokenFromCookie = extractCookieFromHeaders(
      response.headers,
      import.meta.env.VITE_COOKIE_NAME
    );

    if (tokenFromCookie) {
      setCookie(
        import.meta.env.VITE_COOKIE_NAME,
        tokenFromCookie,
        import.meta.env.VITE_COOKIE_EXPIRATION_DAYS
          ? parseInt(import.meta.env.VITE_COOKIE_EXPIRATION_DAYS)
          : 7
      );
    }

    return response.data;
  }

  async signupAdmin(data: UserSignup): Promise<DefaultResponse> {
    const response = await this.httpClient.post<DefaultResponse>(
      `${BASE_URL}/signup-admin`,
      data
    );
    return response.data;
  }

  async signupAluno(data: UserSignup): Promise<DefaultResponse> {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/signup`;
    const response = await this.httpClient.post<DefaultResponse>(url, data);
    return response.data;
  }

  async validateToken() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/validate-token`;
    const response = await this.httpClient.post(url, {});
    return response.data;
  }

  async logout() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/logout`;
    const response = await this.httpClient.post(url, {});
    return response.data;
  }

  async forgotPassword(email: string) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/forgot-password`;
    const response = await this.httpClient.post(url, { email });
    return response.data;
  }

  async resetPassword(data: IResetPassword) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/reset-password`;
    const response = await this.httpClient.post(url, data);
    return response.data;
  }
}
