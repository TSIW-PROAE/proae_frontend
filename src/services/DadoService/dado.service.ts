import { FetchAdapter } from "../api";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/dado";

export interface Dado {
  id?: number;
  nome: string;
  tipo: "text" | "number" | "date" | "select" | "file";
  obrigatorio: boolean;
  opcoes?: string[];
  created_at?: string;
  updated_at?: string;
}

export class DadoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarDados(): Promise<Dado[]> {
    return this.httpClient.get<Dado[]>(BASE_URL);
  }

  async buscarDadoPorId(id: number): Promise<Dado> {
    return this.httpClient.get<Dado>(`${BASE_URL}/${id}`);
  }

  async criarDado(
    data: Omit<Dado, "id" | "created_at" | "updated_at">
  ): Promise<Dado> {
    const resp = await this.httpClient.post<Dado>(BASE_URL, data);
    return resp.data;
  }
}

export const dadoService = new DadoService();
