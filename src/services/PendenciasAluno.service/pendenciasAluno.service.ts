import { getCookie } from "@/utils/utils";
import IHttpClient from "../BaseRequestService/HttpClient";

export default class PendenciasAlunoService {
  headerToken: string;

  constructor(private readonly httpClient: IHttpClient) {
    this.headerToken = getCookie('__session') || '';
  }

  async getInscriptionsDocs(inscricaoId: string) {
    if (!this.headerToken) {
      throw new Error("Sessão não encontrada no cookie");
    }
    if (!inscricaoId) {
      throw new Error("inscricaoId é obrigatório");
    }
    const url = `${import.meta.env.VITE_API_URL_SERVICES}/documentos/inscricao/${inscricaoId}`;
    const response = await this.httpClient.get(url, this.headerToken);
    return response;
  }

  async getInscriptions() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno/inscricoes`;
    const response = await this.httpClient.get(url, this.headerToken);
    return response;
  }

  async getDocsReprovados() {
    if (!this.headerToken) {
      throw new Error("Sessão não encontrada no cookie");
    }
    
    const url = `${import.meta.env.VITE_API_URL_SERVICES}/documentos/pendencias/meus`;
    const response = await this.httpClient.get(url, this.headerToken);
    return response;
  }

}