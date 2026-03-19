import { extractCookieFromHeaders, setCookie } from "@/utils/utils";
import { FetchAdapter } from "../api";
import {
  UserLoginResponse,
  UserSignup,
  DefaultResponse,
  IResetPassword,
  UserLogin,
} from "@/types/auth";
import { CadastroFormData } from "@/pages/paginaProae/CadastroProae/CadastroProae";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/auth";

export default class AuthService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async login(data: UserLogin): Promise<UserLoginResponse> {
    const url = BASE_URL + "/login";
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

  async signupAdmin(data: Omit<CadastroFormData, "confirmarSenha">): Promise<DefaultResponse> {
    const response = await this.httpClient.post<DefaultResponse>(
      `${BASE_URL}/signup-admin`,
      data
    );
    return response.data;
  }

  async signupAluno(data: UserSignup): Promise<DefaultResponse> {
    const url = `${BASE_URL}/signup`;
    const response = await this.httpClient.post<DefaultResponse>(url, data);
    return response.data;
  }

  async validateToken() {
    const url = `${BASE_URL}/validate-token`;
    const response = await this.httpClient.post(url, {});
    return response.data;
  }

  async logout() {
    const url = `${BASE_URL}/logout`;
    const response = await this.httpClient.post(url, {});
    return response.data;
  }

  async forgotPassword(email: string) {
    const url = `${BASE_URL}/forgot-password`;
    const response = await this.httpClient.post(url, { email });
    return response.data;
  }

  async resetPassword(data: IResetPassword) {
    const url = `${BASE_URL}/reset-password`;
    const response = await this.httpClient.post(url, data);
    return response.data;
  }
}
