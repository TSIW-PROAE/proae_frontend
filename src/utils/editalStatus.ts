/**
 * Normaliza `status_edital` da API (código de domínio ou label legado).
 */
export type EditalStatusCategoria =
  | "ABERTO"
  | "EM_ANDAMENTO"
  | "ENCERRADO"
  | "RASCUNHO"
  | "DESCONHECIDO";

export function classificarStatusEdital(
  status: string | undefined | null,
): EditalStatusCategoria {
  const s = (status ?? "").toString().trim().toLowerCase();
  if (!s) return "DESCONHECIDO";
  if (s === "aberto" || s.includes("em aberto")) return "ABERTO";
  if (s === "em_andamento" || s.includes("andamento")) return "EM_ANDAMENTO";
  if (s === "encerrado" || s.includes("encerrado")) return "ENCERRADO";
  if (s === "rascunho" || s.includes("rascunho")) return "RASCUNHO";
  return "DESCONHECIDO";
}

/** Status usado pelo componente ProcessoSeletivo na Home pública. */
export type ProcessoSeletivoStatusVisual =
  | "aberto"
  | "em_andamento"
  | "encerrado"
  | "fechado"
  | "concluido"
  | "default";

export function statusEditalParaProcessoSeletivo(
  status: string | undefined | null,
): ProcessoSeletivoStatusVisual {
  switch (classificarStatusEdital(status)) {
    case "ABERTO":
      return "aberto";
    case "EM_ANDAMENTO":
      return "em_andamento";
    case "ENCERRADO":
      return "encerrado";
    case "RASCUNHO":
      return "default";
    default:
      return "default";
  }
}

export function editalAceitaInscricao(status: string | undefined | null): boolean {
  return classificarStatusEdital(status) === "ABERTO";
}
