type EtapaLike = {
  etapa?: string;
  tipo_etapa?: string;
  data_inicio?: string | null;
  data_fim?: string | null;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toDateStart(value: unknown): Date | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateEnd(value: unknown): Date | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59, 999);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

function isNowWithinEtapa(etapa: EtapaLike, now = new Date()): boolean {
  const inicio = toDateStart(etapa.data_inicio);
  const fim = toDateEnd(etapa.data_fim);
  if (!inicio || !fim) return false;
  return now.getTime() >= inicio.getTime() && now.getTime() <= fim.getTime();
}

function etapaTipoMatches(etapa: EtapaLike, expectedTipos: string[]): boolean {
  const tipo = normalizeText(etapa.tipo_etapa);
  if (!tipo) return false;
  const expected = expectedTipos.map((t) => normalizeText(t));
  return expected.some((x) => tipo === x || tipo.includes(x));
}

function findEtapaByTipoOrKeywords(
  etapas: unknown,
  opts: { tipos?: string[]; keywords?: string[] },
): EtapaLike | null {
  if (!Array.isArray(etapas) || etapas.length === 0) return null;
  const tipos = opts.tipos ?? [];
  const keywords = (opts.keywords ?? []).map((k) => normalizeText(k)).filter(Boolean);

  for (const item of etapas) {
    if (!item || typeof item !== "object") continue;
    const etapa = item as EtapaLike;
    if (tipos.length > 0 && etapaTipoMatches(etapa, tipos)) return etapa;
  }

  for (const item of etapas) {
    if (!item || typeof item !== "object") continue;
    const etapa = item as EtapaLike;
    const nome = normalizeText(etapa.etapa);
    if (!nome) continue;
    if (keywords.some((k) => nome.includes(k))) return etapa;
  }

  return null;
}

export function isInscricaoDisponivelEdital(edital: {
  inscricoes_abertas?: boolean;
  etapa_edital?: unknown;
  etapas?: unknown;
}): boolean {
  const etapas = edital.etapa_edital ?? edital.etapas;
  const etapaInscricao = findEtapaByTipoOrKeywords(etapas, {
    tipos: ["INSCRICAO"],
    keywords: ["inscricao", "solicitacao", "submissao"],
  });
  const dentroDoPeriodo = etapaInscricao ? isNowWithinEtapa(etapaInscricao) : false;
  return edital.inscricoes_abertas === true || dentroDoPeriodo;
}

export function isAjusteDisponivelEdital(edital: {
  ajustes_abertos?: boolean;
  etapa_edital?: unknown;
  etapas?: unknown;
}): boolean {
  const etapas = edital.etapa_edital ?? edital.etapas;
  const etapaAjuste = findEtapaByTipoOrKeywords(etapas, {
    tipos: ["AJUSTES", "COMPLEMENTACAO"],
    keywords: ["ajuste", "complemento", "correcao", "pendencia"],
  });
  const etapaFallbackInscricao = etapaAjuste
    ? null
    : findEtapaByTipoOrKeywords(etapas, {
        tipos: ["INSCRICAO"],
        keywords: ["inscricao", "solicitacao", "submissao"],
      });
  const etapaBase = etapaAjuste ?? etapaFallbackInscricao;
  const dentroDoPeriodo = etapaBase ? isNowWithinEtapa(etapaBase) : false;
  return edital.ajustes_abertos === true || dentroDoPeriodo;
}
