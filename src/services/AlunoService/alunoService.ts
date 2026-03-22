import { FetchAdapter } from "../BaseRequestService/HttpClient";
import type { AdminAlunoResumo } from "../../types/adminAlunoResumo";
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

  /** [Admin] Hub: dados do aluno + todas as inscrições (por vaga). */
  async buscarResumoAdmin(alunoId: string): Promise<AdminAlunoResumo> {
    return this.httpClient.get<AdminAlunoResumo>(`${BASE_URL}/admin/${alunoId}/resumo`);
  }

  /** Alunos com inscrição no edital; filtros opcionais (benefício vs análise da inscrição). */
  async listarAlunosPorEditalComFiltros(
    editalId: string,
    opts?: { apenasBeneficiariosEdital?: boolean; apenasInscricaoAprovada?: boolean },
  ): Promise<ListaAlunosResponse> {
    const q = new URLSearchParams();
    if (opts?.apenasBeneficiariosEdital) q.set("apenas_beneficiarios_edital", "true");
    if (opts?.apenasInscricaoAprovada) q.set("apenas_inscricao_aprovada", "true");
    const qs = q.toString();
    const url = `${BASE_URL}/admin/por-edital/${editalId}/alunos${qs ? `?${qs}` : ""}`;
    return this.httpClient.get<ListaAlunosResponse>(url);
  }
}

export const alunoService = new AlunoService();
