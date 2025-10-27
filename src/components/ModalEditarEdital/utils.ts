import { StatusEdital } from "./types";

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
