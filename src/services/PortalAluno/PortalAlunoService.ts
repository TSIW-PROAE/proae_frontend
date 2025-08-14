import IHttpClient from "../BaseRequestService/HttpClient";

export default class PortalAlunoService {

  constructor(private readonly httpClient: IHttpClient) {}

  async getBenefts() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/beneficios/aluno`;
    const response = await this.httpClient.get(url);
    return response;
  }

  async getEditals() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/editais/abertos`;
    const response = await this.httpClient.get(url);
    return response;
  }

  async getInscriptions() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno/inscricoes`;
    const response = await this.httpClient.get(url);
    return response;
  }
}
