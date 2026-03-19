import { FetchAdapter } from "../api";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
  Vaga,
} from "../../types/edital";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/editais";

export class EditalService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarEditais(): Promise<Edital[]> {
    return this.httpClient.get<Edital[]>(BASE_URL);
  }

  async listarEditaisAbertos(): Promise<Edital[]> {
    return this.httpClient.get<Edital[]>(`${BASE_URL}/abertos`);
  }

  async buscarEditalPorId(id: string): Promise<Edital> {
    return this.httpClient.get<Edital>(`${BASE_URL}/${id}`);
  }

  async buscarVagasDoEdital(editalId: string): Promise<Vaga[]> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
    return this.httpClient.get<Vaga[]>(`${baseUrl}/vagas/edital/${editalId}`);
  }

  async criarVaga(
    vaga: Omit<Vaga, "id" | "created_at" | "updated_at">
  ): Promise<Vaga> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
  const resp = await this.httpClient.post<Vaga>(`${baseUrl}/vagas`, vaga);
  return resp.data;
  }

  async atualizarVaga(
    id: string,
    vaga: Partial<Omit<Vaga, "id" | "created_at" | "updated_at">>
  ): Promise<Vaga> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
  return this.httpClient.patch<Vaga>(`${baseUrl}/vagas/${id}`, vaga);
  }

  async deletarVaga(id: string): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
  return this.httpClient.delete<void>(`${baseUrl}/vagas/${id}`);
  }

  async criarEdital(edital: CreateEditalRequest): Promise<Edital> {
    return (await this.httpClient.post<Edital>(BASE_URL, edital)).data;
  }

  async atualizarEdital(
    id: string,
    edital: UpdateEditalRequest
  ): Promise<Edital> {
    return this.httpClient.patch<Edital>(`${BASE_URL}/${id}`, edital);
  }

  async alterarStatusEdital(
    id: string,
    status: Edital["status_edital"]
  ): Promise<Edital> {
    return this.httpClient.patch<Edital>(
      `${BASE_URL}/${id}/status/${status}`,
      {}
    );
  }

  async deletarEdital(id: string): Promise<void> {
    return this.httpClient.delete<void>(`${BASE_URL}/${id}`);
  }
}

export const editalService = new EditalService();
