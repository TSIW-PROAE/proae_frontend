import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { getCookie } from "@/utils/utils";
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

  private getToken(): string {
    // Usa o cookie de autenticação configurado pelo AuthProvider
    return getCookie("token") ?? "";
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
    const token = this.getToken();
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
    return this.httpClient.post<Vaga>(`${baseUrl}/vagas`, vaga, token);
  }

  // Atualizar vaga (precisa de token)
  async atualizarVaga(
    id: number,
    vaga: Partial<Omit<Vaga, "id" | "created_at" | "updated_at">>
  ): Promise<Vaga> {
    const token = this.getToken();
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
    return this.httpClient.patch<Vaga>(`${baseUrl}/vagas/${id}`, vaga, token);
  }

  // Deletar vaga (precisa de token)
  async deletarVaga(id: number): Promise<void> {
    const token = this.getToken();
    const baseUrl = import.meta.env.VITE_API_URL_SERVICES;
    return this.httpClient.delete<void>(`${baseUrl}/vagas/${id}`, token);
  }

  // Criar novo edital (precisa de token)
  async criarEdital(edital: CreateEditalRequest): Promise<Edital> {
    const token = this.getToken();
    return this.httpClient.post<Edital>(BASE_URL, edital, token);
  }

  // Atualizar edital (precisa de token)
  async atualizarEdital(
    id: number,
    edital: UpdateEditalRequest
  ): Promise<Edital> {
    const token = this.getToken();
    return this.httpClient.patch<Edital>(`${BASE_URL}/${id}`, edital, token);
  }

  // Alterar status do edital em rota específica (precisa de token)
  async alterarStatusEdital(
    id: number,
    status: Edital["status_edital"]
  ): Promise<Edital> {
    const token = this.getToken();
    // Alguns backends aceitam PATCH sem body para essa rota
    return this.httpClient.patch<Edital>(
      `${BASE_URL}/${id}/status/${status}`,
      {},
      token
    );
  }

  // Deletar edital (precisa de token)
  async deletarEdital(id: number): Promise<void> {
    const token = this.getToken();
    return this.httpClient.delete<void>(`${BASE_URL}/${id}`, token);
  }
}

export const editalService = new EditalService();
