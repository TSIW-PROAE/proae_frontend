import IHttpClient from "../BaseRequestService/HttpClient";

export default class PortalAlunoService {
  headerToken: string;

  constructor(private readonly httpClient: IHttpClient) {
    //TODO: Implementar o token de autenticação
    this.headerToken = localStorage.getItem('token') || '';
    this.headerToken = "";
  }

  async getBenefts(id: string) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno/${id}/benefits`;
    const response = await this.httpClient.get(url);
    return response;
  }


  async getEditals() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/editais`;
    const response = await this.httpClient.get(url);
    return response;
  }

  async getInscriptions(userId: string) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/inscricoes-aluno/${userId}`;
    const response = await this.httpClient.get(url);
    return response;
  }


}
