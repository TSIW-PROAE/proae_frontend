import { FetchAdapter } from "../BaseRequestService/HttpClient";
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

  // Listar todos os editais (não precisa de token)
  async listarEditais(): Promise<Edital[]> {
    return this.httpClient.get<Edital[]>(BASE_URL);
  }

  // Listar editais abertos (não precisa de token)
  async listarEditaisAbertos(): Promise<Edital[]> {
    return this.httpClient.get<Edital[]>(`${BASE_URL}/abertos`);
  }

  // Buscar edital por ID (não precisa de token)
  async buscarEditalPorId(id: number): Promise<Edital> {
    return this.httpClient.get<Edital>(`${BASE_URL}/${id}`);
  }

  // Buscar vagas de um edital (não precisa de token)
  async buscarVagasDoEdital(editalId: number): Promise<Vaga[]> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
    return this.httpClient.get<Vaga[]>(`${baseUrl}/vagas/edital/${editalId}`);
  }

  // Criar nova vaga (precisa de token)
  async criarVaga(
    vaga: Omit<Vaga, "id" | "created_at" | "updated_at">
  ): Promise<Vaga> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
  const resp = await this.httpClient.post<Vaga>(`${baseUrl}/vagas`, vaga);
  return resp.data;
  }

  // Atualizar vaga (precisa de token)
  async atualizarVaga(
    id: number,
    vaga: Partial<Omit<Vaga, "id" | "created_at" | "updated_at">>
  ): Promise<Vaga> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
  return this.httpClient.patch<Vaga>(`${baseUrl}/vagas/${id}`, vaga);
  }

  // Deletar vaga (precisa de token)
  async deletarVaga(id: number): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
  return this.httpClient.delete<void>(`${baseUrl}/vagas/${id}`);
  }

  // Criar novo edital (precisa de token)
  async criarEdital(edital: CreateEditalRequest): Promise<Edital> {
    return (await this.httpClient.post<Edital>(BASE_URL, edital)).data;
  }

  // Atualizar edital (precisa de token)
  async atualizarEdital(
    id: number,
    edital: UpdateEditalRequest
  ): Promise<Edital> {
    return this.httpClient.patch<Edital>(`${BASE_URL}/${id}`, edital);
  }

  // Alterar status do edital em rota específica (precisa de token)
  async alterarStatusEdital(
    id: number,
    status: Edital["status_edital"]
  ): Promise<Edital> {
    // Alguns backends aceitam PATCH sem body para essa rota
    return this.httpClient.patch<Edital>(
      `${BASE_URL}/${id}/status/${status}`,
      {}
    );
  }

  // Deletar edital (precisa de token)
  async deletarEdital(id: number): Promise<void> {
    return this.httpClient.delete<void>(`${BASE_URL}/${id}`);
  }
}

export const editalService = new EditalService();
