import type { DocumentoEdital, EtapaEdital } from "@/types/edital";

/** Normaliza valor vindo do DatePicker (string ISO / CalendarDate / objeto). */
export function toDateStringYmd(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    return s.slice(0, 10);
  }
  if (typeof value === "object" && value !== null && "year" in value) {
    const cal = value as unknown as { year: number; month: number; day: number };
    const y = String(cal.year);
    const m = String(cal.month).padStart(2, "0");
    const d = String(cal.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return "";
}

function collectMeioEtapasPrefixes(allKeys: string[]): string[] {
  const bases = new Set<string>();
  for (const k of allKeys) {
    if (k === "meioEtapas") bases.add("meioEtapas");
    if (/^meioEtapas-\d+$/.test(k)) bases.add(k);
    const m = k.match(/^(meioEtapas-\d+)(DateInitial|DateFinal)$/);
    if (m) bases.add(m[1]);
  }
  return Array.from(bases).sort((a, b) => {
    if (a === "meioEtapas") return -1;
    if (b === "meioEtapas") return 1;
    const na = parseInt(a.replace("meioEtapas-", ""), 10) || 0;
    const nb = parseInt(b.replace("meioEtapas-", ""), 10) || 0;
    return na - nb;
  });
}

function buildEditalUrls(values: Record<string, unknown>): DocumentoEdital[] {
  const keys = Object.keys(values).filter((k) => k === "edital_url" || /^edital_url-\d+$/.test(k));
  keys.sort((a, b) => {
    if (a === "edital_url") return -1;
    if (b === "edital_url") return 1;
    const na = parseInt(a.replace("edital_url-", ""), 10) || 0;
    const nb = parseInt(b.replace("edital_url-", ""), 10) || 0;
    return na - nb;
  });
  const out: DocumentoEdital[] = [];
  keys.forEach((key, idx) => {
    const url = String(values[key] ?? "").trim();
    if (!url) return;
    out.push({
      titulo_documento: idx === 0 ? "Documento do edital" : `Documento ${idx + 1}`,
      url_documento: url,
    });
  });
  return out;
}

function buildEtapas(values: Record<string, unknown>): EtapaEdital[] {
  const etapas: EtapaEdital[] = [];
  let ordem = 1;

  const pNome = String(values.primeiraEtapa ?? "").trim();
  const pData = toDateStringYmd(values.primeiraEtapa1);
  if (pNome && pData) {
    etapas.push({
      etapa: pNome,
      ordem_elemento: ordem++,
      data_inicio: pData,
      data_fim: pData,
    });
  }

  const meioPrefixes = collectMeioEtapasPrefixes(Object.keys(values));
  for (const prefix of meioPrefixes) {
    const nome = String(values[prefix] ?? "").trim();
    const di = toDateStringYmd(values[`${prefix}DateInitial`]);
    const df = toDateStringYmd(values[`${prefix}DateFinal`]);
    if (nome && di && df) {
      etapas.push({
        etapa: nome,
        ordem_elemento: ordem++,
        data_inicio: di,
        data_fim: df,
      });
    }
  }

  const uNome = String(values.ultimaEtapa ?? "").trim();
  const uData = toDateStringYmd(values.ultimaEtapa1);
  if (uNome && uData) {
    etapas.push({
      etapa: uNome,
      ordem_elemento: ordem++,
      data_inicio: uData,
      data_fim: uData,
    });
  }

  return etapas.map((e, i) => ({ ...e, ordem_elemento: i + 1 }));
}

export interface CadastroEditalPayload {
  titulo_edital: string;
  descricao: string;
  edital_url: DocumentoEdital[];
  etapa_edital: EtapaEdital[];
  data_fim_vigencia: string | null;
}

/**
 * Monta o PATCH do edital a partir dos valores do react-hook-form do wizard CadastroEdital.
 */
export function mapCadastroEditalFormToPayload(values: Record<string, unknown>): CadastroEditalPayload {
  const nome = String(values.nome_edital ?? "").trim();
  const descBase = String(values.descricao ?? "").trim();
  const tipoBen = String(values.tipo_do_beneficio ?? "").trim();
  const qtd = String(values.quantidade_bolsas ?? "").trim();

  let descricao = descBase;
  if (tipoBen || qtd) {
    const extra = [
      tipoBen ? `Tipo de benefício (informado no cadastro): ${tipoBen}` : "",
      qtd ? `Quantidade de bolsas/vagas informada: ${qtd}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    descricao = descBase ? `${descBase}\n\n${extra}` : extra;
  }

  const dfvRaw = String(values.data_fim_vigencia ?? "").trim();
  let data_fim_vigencia: string | null = null;
  if (dfvRaw && /^\d{4}-\d{2}-\d{2}$/.test(dfvRaw)) {
    data_fim_vigencia = dfvRaw;
  }

  return {
    titulo_edital: nome,
    descricao,
    edital_url: buildEditalUrls(values),
    etapa_edital: buildEtapas(values),
    data_fim_vigencia,
  };
}
