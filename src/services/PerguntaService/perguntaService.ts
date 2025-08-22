import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { Pergunta } from "@/types/step";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/perguntas";

export class PerguntaService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarPerguntasPorStep(stepId: number): Promise<Pergunta[]> {
    return this.httpClient.get<Pergunta[]>(`${BASE_URL}/step/${stepId}`);
  }

  async buscarPerguntaPorId(id: number): Promise<Pergunta> {
    return this.httpClient.get<Pergunta>(`${BASE_URL}/${id}`);
  }

  async criarPergunta(
    data: Omit<Pergunta, "id" | "created_at" | "updated_at">
  ): Promise<Pergunta> {
  const resp = await this.httpClient.post<Pergunta>(`${BASE_URL}`, data);
  return resp.data;
  }

  async atualizarPergunta(
    id: number,
    data: Partial<
      Omit<Pergunta, "id" | "created_at" | "updated_at" | "step_id">
    >
  ): Promise<Pergunta> {
  return this.httpClient.patch<Pergunta>(`${BASE_URL}/${id}`, data);
  }

  async deletarPergunta(id: number): Promise<{ message: string }> {
  return this.httpClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
  }
}

export const perguntaService = new PerguntaService();
