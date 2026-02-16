import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { AlunoInscrito, ListaAlunosInscritosResponse } from "../../types/inscricao";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;

export class InscricaoServiceManager {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarAlunosPorQuestionario(editalId: number, stepId: number): Promise<AlunoInscrito[]> {
    try {
      const response = await this.httpClient.get<ListaAlunosInscritosResponse>(`${BASE_URL}/aluno/edital/${editalId}/step/${stepId}/alunos`);

      // Verifica se a resposta tem a estrutura esperada
      if (response.sucesso && response.dados && Array.isArray(response.dados.alunos)) {
        return response.dados.alunos;
      }

      console.warn("Formato de resposta inesperado:", response);
      return [];
    } catch (error: any) {
      console.error("Erro ao buscar alunos do questionário:", error);

      // Se der 404, retorna array vazio
      if (error.response?.status === 404) {
        return [];
      }

      // Se der 400, lança erro com mensagem específica
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || "Parâmetros inválidos";
        throw new Error(message);
      }

      // Se der 500, lança erro com mensagem amigável
      if (error.response?.status === 500) {
        throw new Error("Erro interno do servidor ao buscar alunos.");
      }

      // Para outros erros, repassa a mensagem
      throw new Error(error.response?.data?.message || error.message || "Erro ao carregar alunos");
    }
  }

  async buscarInscricaoPorId(id: number): Promise<AlunoInscrito | null> {
    try {
      const response = await this.httpClient.get<{ sucesso: boolean; dados: AlunoInscrito }>(`${BASE_URL}/inscricoes/${id}`);

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async atualizarStatusInscricao(inscricaoId: number, status: string): Promise<void> {
    try {
      await this.httpClient.patch(`${BASE_URL}/inscricoes/${inscricaoId}`, {
        status_inscricao: status,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status da inscrição:", error);
      throw new Error(error.response?.data?.message || error.message || "Erro ao atualizar status da inscrição");
    }
  }

  async listarInscritosPorEdital(editalId: number): Promise<AlunoInscrito[]> {
    try {
      const response = await this.httpClient.get<AlunoInscrito[]>(`${BASE_URL}/editais/${editalId}/inscritos`);

      if (Array.isArray(response)) {
        return response;
      }

      // Caso a API retorne com wrapper { sucesso, dados }
      const wrapped = response as unknown as { sucesso?: boolean; dados?: AlunoInscrito[] };
      if (wrapped?.dados && Array.isArray(wrapped.dados)) {
        return wrapped.dados;
      }

      console.warn("Formato de resposta inesperado em listarInscritosPorEdital:", response);
      return [];
    } catch (error: any) {
      console.error("Erro ao buscar inscritos do edital:", error);
      if (error.response?.status === 404) return [];
      throw new Error(error.response?.data?.message || error.message || "Erro ao carregar inscritos");
    }
  }

  async downloadPdfAprovados(editalId?: number): Promise<void> {
    try {
      const url = editalId ? `${BASE_URL}/inscricoes/aprovados/pdf?editalId=${editalId}` : `${BASE_URL}/inscricoes/aprovados/pdf`;

      // Usa axios diretamente para fazer download de arquivo
      const axios = (await import("axios")).default;
      const response = await axios.get(url, {
        responseType: "blob",
        withCredentials: true,
      });

      // Cria um link temporário para download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Define o nome do arquivo
      const contentDisposition = response.headers["content-disposition"];
      let filename = "aprovados.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error("Erro ao baixar PDF de aprovados:", error);
      throw new Error(error.response?.data?.message || error.message || "Erro ao baixar PDF de aprovados");
    }
  }
}

export const inscricaoServiceManager = new InscricaoServiceManager();
