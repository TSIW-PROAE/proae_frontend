import { FetchAdapter } from "../BaseRequestService/HttpClient";
import type { InscricaoStatusAuditEntry } from "../../types/inscricaoStatusAudit";
import { AlunoInscrito, ListaAlunosInscritosResponse } from "../../types/inscricao";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;

/** GET /editais/:id/inscritos pode vir achatado ou com `usuario` aninhado (legado). */
function normalizeAlunoInscrito(raw: AlunoInscrito & { usuario?: AlunoInscrito["usuario"] }): AlunoInscrito {
  const { usuario: u, ...rest } = raw;
  const base: AlunoInscrito = {
    ...rest,
    aluno_id: String(rest.aluno_id ?? ""),
    inscricao_id: String(rest.inscricao_id ?? ""),
  };
  if (!u) return base;
  return {
    ...base,
    usuario_id: base.usuario_id ?? u.usuario_id ?? "",
    nome: base.nome || u.nome || "",
    email: base.email || u.email || "",
    cpf: base.cpf || u.cpf || "",
    celular: base.celular || u.celular || "",
    data_nascimento: base.data_nascimento || (u.data_nascimento as string) || "",
  };
}

export class InscricaoServiceManager {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarAlunosPorQuestionario(editalId: string, stepId: string): Promise<AlunoInscrito[]> {
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

  async buscarInscricaoPorId(id: string): Promise<AlunoInscrito | null> {
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

  async atualizarStatusInscricao(inscricaoId: string, status: string): Promise<void> {
    try {
      await this.httpClient.patch(`${BASE_URL}/inscricoes/${inscricaoId}`, {
        status_inscricao: status,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status da inscrição:", error);
      throw new Error(error.response?.data?.message || error.message || "Erro ao atualizar status da inscrição");
    }
  }

  /**
   * [Admin] Altera status + observação em qualquer inscrição (edital comum, Form. Geral ou Renovação).
   * Body: { status, observacao? } — status com os mesmos valores do enum (ex.: "Inscrição Aprovada").
   */
  async adminAlterarStatusInscricao(
    inscricaoId: string,
    body: { status: string; observacao?: string },
  ): Promise<void> {
    await this.httpClient.patch(`${BASE_URL}/inscricoes/admin/${inscricaoId}/status`, body);
  }

  /** Situação de benefício no edital (separada do status de análise da inscrição). */
  async adminAlterarBeneficioEdital(
    inscricaoId: string,
    body: { status_beneficio_edital: string },
  ): Promise<void> {
    await this.httpClient.patch(`${BASE_URL}/inscricoes/admin/${inscricaoId}/beneficio-edital`, body);
  }

  /** [Admin] Histórico de alterações de status (auditoria). */
  async listarStatusAuditAdmin(inscricaoId: string): Promise<InscricaoStatusAuditEntry[]> {
    const data = await this.httpClient.get<InscricaoStatusAuditEntry[]>(
      `${BASE_URL}/inscricoes/admin/${inscricaoId}/status-audit`,
    );
    return Array.isArray(data) ? data : [];
  }

  async listarInscritosPorEdital(editalId: string): Promise<AlunoInscrito[]> {
    try {
      const response = await this.httpClient.get<AlunoInscrito[]>(`${BASE_URL}/editais/${editalId}/inscritos`);

      if (Array.isArray(response)) {
        return response.map((r) => normalizeAlunoInscrito(r as AlunoInscrito & { usuario?: AlunoInscrito["usuario"] }));
      }

      // Caso a API retorne com wrapper { sucesso, dados }
      const wrapped = response as unknown as { sucesso?: boolean; dados?: AlunoInscrito[] };
      if (wrapped?.dados && Array.isArray(wrapped.dados)) {
        return wrapped.dados.map((r) => normalizeAlunoInscrito(r as AlunoInscrito & { usuario?: AlunoInscrito["usuario"] }));
      }

      console.warn("Formato de resposta inesperado em listarInscritosPorEdital:", response);
      return [];
    } catch (error: any) {
      console.error("Erro ao buscar inscritos do edital:", error);
      if (error.response?.status === 404) return [];
      throw new Error(error.response?.data?.message || error.message || "Erro ao carregar inscritos");
    }
  }

  /** PDF: inscrições com status "Inscrição Aprovada" (análise). */
  async downloadPdfAprovados(editalId?: string): Promise<void> {
    const q = editalId ? `?editalId=${encodeURIComponent(editalId)}` : "";
    await downloadPdfBlob(`${BASE_URL}/inscricoes/aprovados/pdf${q}`, "inscricoes-aprovadas-analise.pdf");
  }

  /** PDF: beneficiários homologados no edital (situação de benefício). */
  async downloadPdfBeneficiarios(editalId: string): Promise<void> {
    const q = `?editalId=${encodeURIComponent(editalId)}`;
    await downloadPdfBlob(`${BASE_URL}/inscricoes/beneficiarios/pdf${q}`, "beneficiarios-edital.pdf");
  }
}

/** Baixa PDF com cookie; interpreta erros JSON quando a API não retorna PDF. */
async function downloadPdfBlob(url: string, fallbackFilename: string): Promise<void> {
  const axios = (await import("axios")).default;
  try {
    const response = await axios.get<Blob>(url, {
      responseType: "blob",
      withCredentials: true,
    });

    const ct = (response.headers["content-type"] || "").toLowerCase();
    if (!ct.includes("application/pdf")) {
      const text = await blobToText(response.data as unknown as Blob);
      throw new Error(parseJsonMessage(text) || "O servidor não retornou um PDF.");
    }

    const blob = new Blob([response.data as BlobPart], { type: "application/pdf" });
    triggerDownload(blob, pickFilename(response.headers["content-disposition"], fallbackFilename));
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: Blob }; message?: string };
    if (e.response?.data instanceof Blob) {
      const text = await blobToText(e.response.data);
      const msg = parseJsonMessage(text) || text?.slice(0, 400) || `Erro ${e.response.status ?? ""}`;
      throw new Error(msg);
    }
    throw new Error(e?.message || "Erro ao baixar PDF.");
  }
}

async function blobToText(blob: Blob): Promise<string> {
  try {
    return await blob.text();
  } catch {
    return "";
  }
}

function parseJsonMessage(text: string): string | null {
  if (!text?.trim()) return null;
  try {
    const j = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(j.message)) return j.message.join(", ");
    if (typeof j.message === "string") return j.message;
  } catch {
    /* não é JSON */
  }
  return null;
}

function pickFilename(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) return fallback;
  const m = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
  if (m?.[1]) return decodeURIComponent(m[1].replace(/"/g, "").trim());
  const m2 = contentDisposition.match(/filename="?([^";\n]+)"?/i);
  if (m2?.[1]) return m2[1].trim();
  return fallback;
}

function triggerDownload(blob: Blob, filename: string): void {
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export const inscricaoServiceManager = new InscricaoServiceManager();
