import IHttpClient from "../BaseRequestService/HttpClient";

export default class CadastroAlunoService {
  headerToken: string;

  constructor(private readonly httpClient: IHttpClient) {
    //TODO: Implementar o token de autenticação
    // this.headerToken = localStorage.getItem('token') || '';
    this.headerToken = "";
  }

  async createAlunoUser(data: object) {
    //console.log("first");
    //console.log(import.meta.env.VITE_API_URL_SERVICES);
    const url = import.meta.env.VITE_API_URL_SERVICES + `/auth/signup`;
    const response = await this.httpClient.post(url, data, this.headerToken);
    return response;
  }
  
}
