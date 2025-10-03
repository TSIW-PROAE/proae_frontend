import { PagesResponse, Answers } from "@/pages/Enrollment/Inscricao";
import IHttpClient, { FetchAdapter } from "../BaseRequestService/HttpClient";

export class InscricaoService {
  private static instance: InscricaoService;
  private readonly httpClient: IHttpClient;
  private readonly url;

  private constructor() {
    this.httpClient = new FetchAdapter();
    this.url = import.meta.env.VITE_API_URL_SERVICES;
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

  async submeterRespostas(data: any) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/inscricoes`;
    const response = await this.httpClient.post(url, data);
    return response.data;
  }
}
