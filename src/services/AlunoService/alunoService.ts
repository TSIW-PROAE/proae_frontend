import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { Aluno } from "@/types";

interface AlunoApiResponse {
  aluno_id?: number;
  nome?: string;
  email?: string;
  matricula?: string;
  cpf?: string;
  campus?: string;
  curso?: string;
  celular?: string;
  telefone?: string;
  status?: string;
  data_nascimento?: string;
  data_ingresso?: string;
  created_at?: string;
  updated_at?: string;
}

const LIST_ENDPOINT = `${import.meta.env.VITE_API_URL_SERVICES}/aluno/list`;

export class AlunoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  private mapAluno(data: AlunoApiResponse): Aluno {
    return {
      ...data,
      id: data.aluno_id,
      aluno_id: data.aluno_id,
      telefone: data.telefone ?? data.celular,
    };
  }

  async listarAlunos(): Promise<Aluno[]> {
    const response = await this.httpClient.get<unknown>(LIST_ENDPOINT);

    if (Array.isArray(response)) {
      return response.map((item) => this.mapAluno(item as AlunoApiResponse));
    }

    if (
      response &&
      typeof response === "object" &&
      "dados" in response &&
      Array.isArray((response as any).dados)
    ) {
      return (response as any).dados.map((item: AlunoApiResponse) =>
        this.mapAluno(item)
      );
    }

    if (
      response &&
      typeof response === "object" &&
      "dados" in response &&
      (response as any).dados?.alunos &&
      Array.isArray((response as any).dados.alunos)
    ) {
      return (response as any).dados.alunos.map((item: AlunoApiResponse) =>
        this.mapAluno(item)
      );
    }

    return [];
  }
}

export const alunoService = new AlunoService();
