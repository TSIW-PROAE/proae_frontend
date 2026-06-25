/** Título curto/genérico no cadastro (ex.: "Edital - 2026.1"). */
function isTituloEditalGenerico(titulo: string): boolean {
  const t = titulo.trim();
  if (!t) return true;
  return /^edital\s*[-–—]?\s*[\d./]+/i.test(t) || t.length < 28;
}

/**
 * Define o que mostrar no card: evita título genérico + descrição repetida sobreposta.
 */
export function resolveTituloCardExibicao(
  tituloRaw: string | null | undefined,
  descricaoRaw: string | null | undefined,
): { titulo: string; descricao?: string } {
  const titulo = getTituloEdital({ titulo_edital: tituloRaw });
  const descricao = String(descricaoRaw ?? "").trim();
  if (!descricao) return { titulo };
  if (descricao.toLowerCase() === titulo.toLowerCase()) return { titulo };

  if (isTituloEditalGenerico(titulo) && descricao.length > titulo.length) {
    return { titulo: descricao };
  }

  if (titulo.length < descricao.length && descricao.toLowerCase().startsWith(titulo.toLowerCase().slice(0, 12))) {
    return { titulo: descricao };
  }

  return { titulo, descricao };
}

/** Extrai o título exibível de um edital (tolerante a variações da API). */
export function getTituloEdital(
  edital:
    | {
        titulo_edital?: string | null;
        titulo?: string | null;
        nome?: string | null;
      }
    | null
    | undefined,
  fallback = "Edital PROAE",
): string {
  if (!edital) return fallback;
  const raw = edital.titulo_edital ?? edital.titulo ?? edital.nome ?? "";
  const t = String(raw).trim();
  return t || fallback;
}

/** Normaliza item da lista de editais do portal do aluno. */
export function normalizeEditalPortalItem(raw: Record<string, unknown>) {
  const titulo_edital = getTituloEdital(raw as Parameters<typeof getTituloEdital>[0]);
  const isRenovacao =
    raw.is_formulario_renovacao === true ||
    String(raw.is_formulario_renovacao).toLowerCase() === "true";
  const isCadastroGeral =
    raw.is_cadastro_geral === true ||
    String(raw.is_cadastro_geral).toLowerCase() === "true";
  const inscricoesAbertas =
    raw.inscricoes_abertas === true ||
    String(raw.inscricoes_abertas).toLowerCase() === "true";
  const ajustesAbertos =
    raw.ajustes_abertos === true ||
    String(raw.ajustes_abertos).toLowerCase() === "true";
  return {
    ...raw,
    id: String(raw.id ?? ""),
    titulo_edital,
    descricao:
      raw.descricao != null && String(raw.descricao).trim()
        ? String(raw.descricao).trim()
        : raw.descricao,
    status_edital: String(raw.status_edital ?? ""),
    quantidade_bolsas: Number(raw.quantidade_bolsas ?? 0),
    numero_beneficios: Number(raw.numero_beneficios ?? 0),
    etapas: (raw.etapa_edital ?? raw.etapas) as unknown,
    edital_url: raw.edital_url,
    data_fim_vigencia: raw.data_fim_vigencia as string | null | undefined,
    is_formulario_renovacao: isRenovacao,
    is_cadastro_geral: isCadastroGeral,
    inscricoes_abertas: inscricoesAbertas,
    ajustes_abertos: ajustesAbertos,
  };
}

export function unwrapEditaisList(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) {
    return response.filter((x) => x && typeof x === "object") as Record<string, unknown>[];
  }
  if (response && typeof response === "object") {
    const dados = (response as { dados?: unknown }).dados;
    if (Array.isArray(dados)) {
      return dados.filter((x) => x && typeof x === "object") as Record<string, unknown>[];
    }
  }
  return [];
}
