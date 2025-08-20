import { setCookie, deleteCookie, extractCookieFromHeaders } from "@/utils/utils";
import IHttpClient from "../BaseRequestService/HttpClient";
import { UserSignup, UserLogin, UserLoginResponse, IResetPassword } from "@/types/auth";

export default class CadastroAlunoService {

  constructor(private readonly httpClient: IHttpClient) {}

  async createAlunoUser(data: UserSignup) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/signup`;
    const response = await this.httpClient.post(url, data);
    return response.data;
  }

  async LoginAluno(data: UserLogin){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/login`;

    const response = await this.httpClient.post<UserLoginResponse>(url, data)


    const tokenFromCookie = extractCookieFromHeaders(response.headers, import.meta.env.VITE_COOKIE_NAME);


    if (tokenFromCookie) {
      setCookie(import.meta.env.VITE_COOKIE_NAME, tokenFromCookie, import.meta.env.VITE_COOKIE_EXPIRATION_DAYS ? parseInt(import.meta.env.VITE_COOKIE_EXPIRATION_DAYS) : 7);
    }

    return response.data;
  }

  // TODO: Refazer implementação de tipo para o retorno da função
  async validateToken() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/validate-token`;
    const response = await this.httpClient.post(url, {});
    return response.data;
  }

  async LogoutAluno(){
    deleteCookie(import.meta.env.VITE_COOKIE_NAME);
  }

  async forgotPassword(email:string){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/forgot-password`;
    const response = await this.httpClient.post(url, { email });
    return response.data;
  }

  async resetPassword(data: IResetPassword ){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/reset-password`;
    const response = await this.httpClient.post(url, data);
    return response.data;
  }
}
