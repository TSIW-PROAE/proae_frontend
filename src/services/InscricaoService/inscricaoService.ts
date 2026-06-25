import { FetchAdapter } from "../BaseRequestService/HttpClient";
import axios from "axios";
import type { InscricaoStatusAuditEntry } from "../../types/inscricaoStatusAudit";
import {
  AlunoInscrito,
  ListaAlunosInscritosResponse,
  ListaInscritosEditalResponse,
  PaginacaoPadrao,
} from "../../types/inscricao";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL;

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

  async listarAlunosPorQuestionarioPaginado(
    editalId: string,
    stepId: string,
    opts?: {
      page?: number;
      limit?: number;
      busca?: string;
      status?: string;
    },
  ): Promise<ListaAlunosInscritosResponse["dados"]> {
    try {
      const params = new URLSearchParams();
      if (opts?.page != null) params.set("page", String(opts.page));
      if (opts?.limit != null) params.set("limit", String(opts.limit));
      if (opts?.busca && opts.busca.trim() !== "") {
        params.set("busca", opts.busca.trim());
      }
      if (opts?.status && opts.status.trim() !== "") {
        params.set("status", opts.status.trim());
      }
      const query = params.toString();
      const response = await this.httpClient.get<ListaAlunosInscritosResponse>(
        `${BASE_URL}/aluno/edital/${editalId}/step/${stepId}/alunos${query ? `?${query}` : ""}`,
      );

      // Verifica se a resposta tem a estrutura esperada
      if (response.sucesso && response.dados && Array.isArray(response.dados.alunos)) {
        return response.dados;
      }

      console.warn("Formato de resposta inesperado:", response);
      return {
        edital: { id: String(editalId), titulo: "", descricao: "", status: "" },
        step: { id: String(stepId), texto: "" },
        total_alunos: 0,
        alunos: [],
      };
    } catch (error: any) {
      console.error("Erro ao buscar alunos do questionário:", error);

      // Se der 404, retorna array vazio
      if (error.response?.status === 404) {
        return {
          edital: { id: String(editalId), titulo: "", descricao: "", status: "" },
          step: { id: String(stepId), texto: "" },
          total_alunos: 0,
          alunos: [],
        };
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

  async listarAlunosPorQuestionario(editalId: string, stepId: string): Promise<AlunoInscrito[]> {
    const todos: AlunoInscrito[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const resp = await this.listarAlunosPorQuestionarioPaginado(editalId, stepId, {
        page,
        limit,
      });
      todos.push(...(resp.alunos ?? []));
      if (!resp.paginacao?.tem_proxima) break;
      page += 1;
    }

    return todos;
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
    body: { status: string; observacao?: string; marcar_pcd_cg?: boolean },
  ): Promise<void> {
    await this.httpClient.patch(`${BASE_URL}/inscricoes/admin/${inscricaoId}/status`, body);
  }

  /** Situação de benefício no edital (separada do status de análise da inscrição). */
  async adminAlterarBeneficioEdital(
    inscricaoId: string,
    body: {
      status_beneficio_edital: string;
      permitir_exceder_vagas?: boolean;
      justificativa_override?: string;
    },
  ): Promise<void> {
    await this.httpClient.patch(`${BASE_URL}/inscricoes/admin/${inscricaoId}/beneficio-edital`, body);
  }

  /** [Admin] Atualiza fase de resultado (preliminar/final) e situação do recurso. */
  async adminAlterarResultadoRecurso(
    inscricaoId: string,
    body: {
      resultado_fase: string;
      recurso_status: string;
      recurso_observacao?: string;
    },
  ): Promise<void> {
    await this.httpClient.patch(`${BASE_URL}/inscricoes/admin/${inscricaoId}/resultado-recurso`, body);
  }

  /** [Admin] Histórico de alterações de status (auditoria). */
  async listarStatusAuditAdmin(inscricaoId: string): Promise<InscricaoStatusAuditEntry[]> {
    const data = await this.httpClient.get<InscricaoStatusAuditEntry[]>(
      `${BASE_URL}/inscricoes/admin/${inscricaoId}/status-audit`,
    );
    return Array.isArray(data) ? data : [];
  }

  async listarInscritosPorEditalPaginado(
    editalId: string,
    opts?: {
      page?: number;
      limit?: number;
      busca?: string;
      status?: string;
      situacao_solicitacao?: "SELECIONADA" | "CLASSIFICADA" | "INDEFERIDA" | "DESISTENTE";
      ordenacao?: "data_desc" | "data_asc" | "pontuacao_desc" | "pontuacao_asc";
    },
  ): Promise<ListaInscritosEditalResponse> {
    try {
      const params = new URLSearchParams();
      if (opts?.page != null) params.set("page", String(opts.page));
      if (opts?.limit != null) params.set("limit", String(opts.limit));
      if (opts?.busca && opts.busca.trim() !== "") {
        params.set("busca", opts.busca.trim());
      }
      if (opts?.status && opts.status.trim() !== "") {
        params.set("status", opts.status.trim());
      }
      if (opts?.situacao_solicitacao) {
        params.set("situacao_solicitacao", opts.situacao_solicitacao);
      }
      if (opts?.ordenacao) params.set("ordenacao", opts.ordenacao);

      const query = params.toString();
      const response = await this.httpClient.get<
        ListaInscritosEditalResponse | AlunoInscrito[] | { sucesso?: boolean; dados?: AlunoInscrito[] }
      >(`${BASE_URL}/editais/${editalId}/inscritos${query ? `?${query}` : ""}`);

      if (Array.isArray(response)) {
        return {
          dados: response.map((r) =>
            normalizeAlunoInscrito(r as AlunoInscrito & { usuario?: AlunoInscrito["usuario"] }),
          ),
          paginacao: {
            pagina: 1,
            limite: response.length || 20,
            total_itens: response.length,
            total_paginas: 1,
            tem_anterior: false,
            tem_proxima: false,
          },
        };
      }

      const paginado = response as ListaInscritosEditalResponse;
      if (Array.isArray(paginado?.dados) && paginado?.paginacao) {
        return {
          dados: paginado.dados.map((r) =>
            normalizeAlunoInscrito(r as AlunoInscrito & { usuario?: AlunoInscrito["usuario"] }),
          ),
          paginacao: paginado.paginacao as PaginacaoPadrao,
        };
      }

      // Caso a API retorne com wrapper legado { sucesso, dados }
      const wrapped = response as unknown as { sucesso?: boolean; dados?: AlunoInscrito[] };
      if (wrapped?.dados && Array.isArray(wrapped.dados)) {
        const dadosNormalizados = wrapped.dados.map((r) =>
          normalizeAlunoInscrito(r as AlunoInscrito & { usuario?: AlunoInscrito["usuario"] }),
        );
        return {
          dados: dadosNormalizados,
          paginacao: {
            pagina: 1,
            limite: dadosNormalizados.length || 20,
            total_itens: dadosNormalizados.length,
            total_paginas: 1,
            tem_anterior: false,
            tem_proxima: false,
          },
        };
      }

      console.warn("Formato de resposta inesperado em listarInscritosPorEdital:", response);
      return {
        dados: [],
        paginacao: {
          pagina: 1,
          limite: 20,
          total_itens: 0,
          total_paginas: 1,
          tem_anterior: false,
          tem_proxima: false,
        },
      };
    } catch (error: any) {
      console.error("Erro ao buscar inscritos do edital:", error);
      if (error.response?.status === 404) {
        return {
          dados: [],
          paginacao: {
            pagina: 1,
            limite: 20,
            total_itens: 0,
            total_paginas: 1,
            tem_anterior: false,
            tem_proxima: false,
          },
        };
      }
      throw new Error(error.response?.data?.message || error.message || "Erro ao carregar inscritos");
    }
  }

  async listarInscritosPorEdital(editalId: string): Promise<AlunoInscrito[]> {
    const todos: AlunoInscrito[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const resp = await this.listarInscritosPorEditalPaginado(editalId, {
        page,
        limit,
      });
      todos.push(...resp.dados);
      if (!resp.paginacao?.tem_proxima) break;
      page += 1;
    }

    return todos;
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

  /** PDF detalhado de uma única inscrição (perguntas e respostas). */
  async downloadPdfInscricao(inscricaoId: string | number): Promise<void> {
    await downloadPdfBlob(
      `${BASE_URL}/inscricoes/admin/${inscricaoId}/pdf`,
      `inscricao-${inscricaoId}.pdf`,
    );
  }

  /**
   * CSV agregado das inscrições de um edital.
   * UTF-8 com BOM e separador ";", abre direto no Excel-pt-BR.
   */
  async downloadCsvInscricoesEdital(editalId: string | number): Promise<void> {
    await downloadFileBlob(
      `${BASE_URL}/inscricoes/admin/edital/${editalId}/export.csv`,
      `inscricoes-edital-${editalId}.csv`,
      "text/csv",
    );
  }
}

/**
 * Baixa um arquivo arbitrário (CSV, txt, etc.) com cookie. Aceita um
 * `expectedContentType` opcional para diferenciar erro JSON de payload válido.
 */
async function downloadFileBlob(
  url: string,
  fallbackFilename: string,
  expectedContentType: string,
): Promise<void> {
  try {
    const response = await axios.get<Blob>(url, {
      responseType: "blob",
      withCredentials: true,
    });

    const ct = (response.headers["content-type"] || "").toLowerCase();
    if (!ct.includes(expectedContentType)) {
      const text = await blobToText(response.data as unknown as Blob);
      throw new Error(parseJsonMessage(text) || "Resposta inesperada do servidor.");
    }
    const blob = new Blob([response.data as BlobPart], {
      type: expectedContentType,
    });
    triggerDownload(blob, pickFilename(response.headers["content-disposition"], fallbackFilename));
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: Blob }; message?: string };
    if (e.response?.data instanceof Blob) {
      const text = await blobToText(e.response.data);
      const msg = parseJsonMessage(text) || text?.slice(0, 400) || `Erro ${e.response.status ?? ""}`;
      throw new Error(msg);
    }
    throw new Error(e?.message || "Erro ao baixar arquivo.");
  }
}

/** Baixa PDF com cookie; interpreta erros JSON quando a API não retorna PDF. */
async function downloadPdfBlob(url: string, fallbackFilename: string): Promise<void> {
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
