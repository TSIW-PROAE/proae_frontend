import IHttpClient from "../BaseRequestService/HttpClient";

export default class PendenciasAlunoService {

  constructor(private readonly httpClient: IHttpClient) {}

  async getInscriptionsDocs(inscricaoId: string) {
    if (!inscricaoId) {
      throw new Error("inscricaoId é obrigatório");
    }
    const url = `${import.meta.env.VITE_API_URL_SERVICES}/documentos/inscricao/${inscricaoId}`;
    const response = await this.httpClient.get(url);
    return response;
  }

  async getInscriptions() {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno/inscricoes`;
    const response = await this.httpClient.get(url);
    return response;
  }

  async getDocsReprovados() {

    const url = `${import.meta.env.VITE_API_URL_SERVICES}/documentos/pendencias/meus`;
    const response = await this.httpClient.get(url);
    return response;
  }

}
