import IHttpClient from "../api";
import { API_BASE_URL } from "@/config/api";

export default class PortalAlunoService {

  constructor(private readonly httpClient: IHttpClient) {}

  async getBenefts() {
    const url = API_BASE_URL + "/beneficios/aluno";
    const response = await this.httpClient.get(url);
    return response;
  }

  /**
   * @param nivelAcademico Graduação ou Pós-graduação (perfil do aluno).
   */
  async getEditals(nivelAcademico: string) {
    const q = encodeURIComponent(nivelAcademico);
    const url = `${API_BASE_URL}/editais/abertos?nivel_academico=${q}`;
    const response = await this.httpClient.get(url);
    return response;
  }

  async getInscriptions() {
    const url = API_BASE_URL + "/aluno/inscricoes";
    const response = await this.httpClient.get(url);
    return response;
  }
}
