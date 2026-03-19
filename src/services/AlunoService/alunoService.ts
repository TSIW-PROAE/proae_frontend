import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { Aluno, ListaAlunosResponse } from "../../types/aluno";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/aluno";

export class AlunoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarTodosAlunos(): Promise<Aluno[]> {
    try {
      const response = await this.httpClient.get<ListaAlunosResponse>(`${BASE_URL}/all`);
      return response.dados;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return [];
      }
      throw error;
    }
  }

  async buscarAlunoPorId(id: string): Promise<Aluno> {
    return this.httpClient.get<Aluno>(`${BASE_URL}/${id}`);
  }
}

export const alunoService = new AlunoService();
