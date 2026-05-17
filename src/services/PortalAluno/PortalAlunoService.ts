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
   * Lista os editais visíveis ao aluno: além dos `ABERTO` (aceitando
   * inscrição), também `EM_ANDAMENTO` e `ENCERRADO`, para que o estudante
   * acompanhe processos passados/em análise. As regras do botão de
   * "Inscrever-se" continuam a cargo do componente que renderiza os cards.
   *
   * @param nivelAcademico Graduação ou Pós-graduação (perfil do aluno).
   */
  async getEditals(nivelAcademico: string) {
    const q = encodeURIComponent(nivelAcademico);
    const url = `${API_BASE_URL}/editais/visiveis-aluno?nivel_academico=${q}`;
    const response = await this.httpClient.get(url);
    return response;
  }

  async getInscriptions() {
    const url = API_BASE_URL + "/aluno/inscricoes";
    const response = await this.httpClient.get(url);
    return response;
  }
}
