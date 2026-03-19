import { FetchAdapter } from "../api";
import { Edital, CreateEditalRequest, UpdateEditalRequest, Vaga } from "../../types/edital";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/editais";

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
    return this.httpClient.get<Vaga[]>(`${API_BASE_URL}/vagas/edital/${editalId}`);
  }

  async criarVaga(vaga: Omit<Vaga, "id" | "created_at" | "updated_at">): Promise<Vaga> {
    const resp = await this.httpClient.post<Vaga>(`${API_BASE_URL}/vagas`, vaga);
    return resp.data;
  }

  async atualizarVaga(
    id: string,
    vaga: Partial<Omit<Vaga, "id" | "created_at" | "updated_at">>,
  ): Promise<Vaga> {
    return this.httpClient.patch<Vaga>(`${API_BASE_URL}/vagas/${id}`, vaga);
  }

  async deletarVaga(id: string): Promise<void> {
    await this.httpClient.delete<void>(`${API_BASE_URL}/vagas/${id}`);
  }

  async criarEdital(edital: CreateEditalRequest): Promise<Edital> {
    return (await this.httpClient.post<Edital>(BASE_URL, edital)).data;
  }

  async atualizarEdital(id: string, edital: UpdateEditalRequest): Promise<Edital> {
    return this.httpClient.patch<Edital>(`${BASE_URL}/${id}`, edital);
  }

  async alterarStatusEdital(id: string, status: Edital["status_edital"]): Promise<Edital> {
    return this.httpClient.patch<Edital>(`${BASE_URL}/${id}/status/${status}`, {});
  }

  async deletarEdital(id: string): Promise<void> {
    await this.httpClient.delete<void>(`${BASE_URL}/${id}`);
  }
}

export const editalService = new EditalService();

