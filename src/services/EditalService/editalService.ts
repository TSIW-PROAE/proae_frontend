import { FetchAdapter } from "../BaseRequestService/HttpClient";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
  Vaga,
} from "../../types/edital";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/editais";

export class EditalService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  private getToken(): string {
    const token = getCookie("__session");
    if (!token) {
      throw new Error("Sessão não encontrada no cookie");
    }
    return token;
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

  // Deletar edital (precisa de token)
  async deletarEdital(id: number): Promise<void> {
    const token = this.getToken();
    console.log("Token para deletar edital:", token); // Debug
    console.log("URL para deletar:", `${BASE_URL}/${id}`); // Debug
    return this.httpClient.delete<void>(`${BASE_URL}/${id}`, token);
  }
}

export const editalService = new EditalService();
