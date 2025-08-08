import { setCookie, deleteCookie } from "@/utils/utils";
import IHttpClient from "../BaseRequestService/HttpClient";
import { UserSignup, UserLogin, UserLoginResponse } from "@/types/auth";

export default class CadastroAlunoService {
  headerToken: string;

  constructor(private readonly httpClient: IHttpClient) {
    this.headerToken = "";
  }

  async createAlunoUser(data: UserSignup) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/signup`;
    const response = await this.httpClient.post(url, data, this.headerToken);
    return response;
  }

  async LoginAluno(data: UserLogin){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/login`;
    const response: UserLoginResponse = await this.httpClient.post(url, data, "");
    console.log(response)
    setCookie(import.meta.env.VITE_COOKIE_NAME, response.access_token, 7);
    return response;
  }

  async validateToken(token: string) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/validate-token`;
    const response: UserSignup = await this.httpClient.post(url, { token }, this.headerToken);
    return response;
  }

  async LogoutAluno(){
    deleteCookie(import.meta.env.VITE_COOKIE_NAME);
  }

}
