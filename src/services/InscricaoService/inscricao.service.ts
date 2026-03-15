import { PagesResponse, Answers } from "@/pages/Enrollment/Inscricao";
import IHttpClient, { FetchAdapter } from "../api";
import { API_BASE_URL } from "@/config/api";

export interface CacheRespostasResponse {
  message: string;
  respostas: Array<{
    perguntaId: number;
    valorTexto?: string;
    valorOpcoes?: string[];
    isFile?: boolean;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }>;
}

export class InscricaoService {
  private static instance: InscricaoService;
  private readonly httpClient: IHttpClient;
  private readonly url;

  private constructor() {
    this.httpClient = new FetchAdapter();
    this.url = API_BASE_URL;
  }

  static getInstance(): InscricaoService {
    if (!InscricaoService.instance) {
      InscricaoService.instance = new InscricaoService();
    }
    return InscricaoService.instance;
  }

  async fetchPagesInformation(editalId: number): Promise<PagesResponse[]> {
    return await this.httpClient.get<PagesResponse[]>(
      this.url + "/steps/edital/" + editalId);
  }

  async saveInscricao(answers: Answers) {
    return await this.httpClient.post(
      this.url + "/inscricoes",
      answers);
  }

  async submeterRespostas(data: { vaga_id: number; respostas: any[] }) {
    const url = this.url + "/inscricoes";
    const response = await this.httpClient.post(url, data);
    return (response as any).data;
  }

  async salvarRespostas(vaga_id: number, respostas: any[]): Promise<{ message: string }> {
    const url = this.url + `/inscricoes/cache/save/respostas`;
    const response = await this.httpClient.post(url, { vaga_id, respostas });
    return response.data;
  }

  async buscarRespostas(vagaId: number): Promise<CacheRespostasResponse> {
    const url = this.url + `/inscricoes/cache/respostas/vaga/${vagaId}`;
    const response = await this.httpClient.get<CacheRespostasResponse>(url);
    return response; // get() returns data directly
  }

  async atualizarInscricao(id: number, answers: Answers) {
    const url = this.url + `/inscricoes/${id}`;
    const response: any = await this.httpClient.put(url, answers);
    return response.data;
  }

}
