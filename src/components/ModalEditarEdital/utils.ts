import { StatusEdital } from "./types";

/**
 * Normaliza qualquer representação de data (objeto Date, ISO completo
 * `2026-05-10T00:00:00.000Z`, `YYYY-MM-DD`, etc.) para a string
 * `YYYY-MM-DD` exigida por `<input type="date">`.
 *
 * Se o valor for inválido / vazio, devolve string vazia. Esse helper é
 * crítico ao re-hidratar formulários a partir do backend: campos JSON
 * como `etapa_edital` voltam como ISO datetime, e o input HTML descarta
 * silenciosamente valores fora do formato `YYYY-MM-DD` — daí a sensação
 * de "não consigo editar" / "mantém o valor antigo".
 */
export const toIsoDateOnly = (
  value: string | Date | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (!s) return "";
  // Já está no formato esperado (com possível " 00:00:00" no fim)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}[T ]/.test(s)) return s.slice(0, 10);
  // Fallback para formatos que o JS sabe parsear (ex.: "10/05/2026" pt-BR não é
  // determinístico no JS — evitamos transformar para não corromper). Tentamos
  // uma última vez via Date só se for um ISO-like que escapou dos regex acima.
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "";
};

export const toInternalStatus = (value: string): StatusEdital => {
  const norm = (value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (norm === "rascunho") return "RASCUNHO";
  if (norm === "aberto" || norm === "edital em aberto") return "ABERTO";
  if (norm === "em andamento" || norm === "edital em andamento")
    return "EM_ANDAMENTO";
  if (norm === "encerrado" || norm === "edital encerrado") return "ENCERRADO";
  // também aceitar já no formato interno
  const upper = (value || "").toUpperCase();
  if (
    upper === "RASCUNHO" ||
    upper === "ABERTO" ||
    upper === "EM_ANDAMENTO" ||
    upper === "ENCERRADO"
  ) {
    return upper as StatusEdital;
  }
  return "RASCUNHO";
};

export const makeSnapshot = (
  t: string,
  d: string,
  docsArr: any[],
  etapasArr: any[],
  vagasArr: any[],
  questionariosArr: any[] = []
) => {
  const norm = {
    titulo: (t || "").trim(),
    descricao: (d || "").trim(),
    documentos: (docsArr || []).map((x) => ({
      titulo_documento: (x.titulo_documento || "").trim(),
      url_documento: (x.url_documento || "").trim(),
    })),
    etapas: (etapasArr || []).map((x) => ({
      etapa: (x.etapa || "").trim(),
      tipo_etapa: (x.tipo_etapa || "").trim(),
      data_inicio: x.data_inicio || "",
      data_fim: x.data_fim || "",
      ordem_elemento: x.ordem_elemento ?? null,
    })),
    vagas: (vagasArr || []).map((x) => ({
      beneficio: (x.beneficio || "").trim(),
      descricao_beneficio: (x.descricao_beneficio || "").trim(),
      numero_vagas: Number(x.numero_vagas) || 0,
    })),
    questionarios: (questionariosArr || []).map((q) => ({
      titulo: (q.titulo || "").trim(),
      previewPerguntas: (q.previewPerguntas || []).map((p: any) =>
        (p || "").trim()
      ),
    })),
  };
  return JSON.stringify(norm);
};
