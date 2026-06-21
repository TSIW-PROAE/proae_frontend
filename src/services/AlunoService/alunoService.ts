import { FetchAdapter } from "../BaseRequestService/HttpClient";
import type { AdminAlunoResumo } from "../../types/adminAlunoResumo";
import { Aluno, ListaAlunosResponse } from "../../types/aluno";
import { API_BASE_URL } from "@/config/api";

/** Sempre URL absoluta do backend. Não use só VITE_API_URL_SERVICES: se estiver vazio vira "/aluno" relativo e o browser chama o Vercel → "Cannot GET /aluno/...". */
const BASE_URL = `${API_BASE_URL}/aluno`;

export class AlunoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarTodosAlunos(
    opts?: { page?: number; limit?: number },
  ): Promise<ListaAlunosResponse> {
    try {
      const q = new URLSearchParams();
      if (opts?.page != null) q.set("page", String(opts.page));
      if (opts?.limit != null) q.set("limit", String(opts.limit));
      const qs = q.toString();
      const response = await this.httpClient.get<ListaAlunosResponse>(
        `${BASE_URL}/all${qs ? `?${qs}` : ""}`,
      );
      return response;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return { sucesso: true, dados: [] };
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

  /** [Gerencial] Remove perfil de aluno sem inscrições (mantém auditoria por regras do backend). */
  async excluirPerfilAlunoAdmin(
    alunoId: string,
  ): Promise<{ sucesso: boolean; mensagem: string; dados?: { aluno_id: number } }> {
    return this.httpClient.delete<{ sucesso: boolean; mensagem: string; dados?: { aluno_id: number } }>(
      `${BASE_URL}/admin/${alunoId}/perfil`,
    );
  }

  /** Alunos com inscrição no edital; filtros opcionais (benefício vs análise da inscrição). */
  async listarAlunosPorEditalComFiltros(
    editalId: string,
    opts?: {
      apenasBeneficiariosEdital?: boolean;
      apenasInscricaoAprovada?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<ListaAlunosResponse> {
    const q = new URLSearchParams();
    if (opts?.apenasBeneficiariosEdital) q.set("apenas_beneficiarios_edital", "true");
    if (opts?.apenasInscricaoAprovada) q.set("apenas_inscricao_aprovada", "true");
    if (opts?.page != null) q.set("page", String(opts.page));
    if (opts?.limit != null) q.set("limit", String(opts.limit));
    const qs = q.toString();
    const url = `${BASE_URL}/admin/por-edital/${editalId}/alunos${qs ? `?${qs}` : ""}`;
    return this.httpClient.get<ListaAlunosResponse>(url);
  }
}

export const alunoService = new AlunoService();
