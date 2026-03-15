import IHttpClient from "../api";
import { API_BASE_URL } from "@/config/api";

export default class PortalAlunoService {

  constructor(private readonly httpClient: IHttpClient) {}

  async getBenefts() {
    const url = API_BASE_URL + "/beneficios/aluno";
    const response = await this.httpClient.get(url);
    return response;
  }

  async getEditals() {
    const url = API_BASE_URL + "/editais/abertos";
    const response = await this.httpClient.get(url);
    return response;
  }

  async getInscriptions() {
    const url = API_BASE_URL + "/aluno/inscricoes";
    const response = await this.httpClient.get(url);
    return response;
  }
}
