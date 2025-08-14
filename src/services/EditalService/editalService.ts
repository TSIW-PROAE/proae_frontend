import { FetchAdapter } from "../BaseRequestService/HttpClient";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
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

  // Deletar edital (precisa de token)
  async deletarEdital(id: number): Promise<void> {
    console.log("Token para deletar edital:"); // Debug
    console.log("URL para deletar:", `${BASE_URL}/${id}`); // Debug
    return this.httpClient.delete<void>(`${BASE_URL}/${id}`);
  }
}

export const editalService = new EditalService();
