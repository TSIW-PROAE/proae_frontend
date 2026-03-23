/**
 * Notificações derivadas dos dados já carregados no portal (sem API de notificações persistidas).
 * O sininho lista resumo de documentação, inscrição e benefício no edital.
 */

export type PortalNotificationVariant = "warning" | "info" | "success" | "danger";

export interface PortalNotification {
  id: string;
  title: string;
  body: string;
  href?: string;
  variant: PortalNotificationVariant;
  /** Se true, entra no contador vermelho do sininho (precisa de atenção). */
  urgent: boolean;
}

/** Formato flexível: vem de GET /aluno/inscricoes */
export type InscricaoPortalLike = {
  inscricao_id?: number;
  edital_id?: number;
  titulo_edital?: string;
  status_inscricao?: string;
  status_beneficio_edital?: string;
  observacao_admin?: string | null;
  possui_pendencias?: boolean;
  total_pendencias?: number;
  possui_novas_perguntas_pendentes?: boolean;
  total_novas_perguntas?: number;
  is_formulario_geral?: boolean;
  vaga?: { beneficio?: string };
};

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "sim";
  }
  return false;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function prefixoProcesso(ins: InscricaoPortalLike): string {
  return ins.is_formulario_geral ? "[Formulário geral] " : "";
}

function sufixoBeneficio(ins: InscricaoPortalLike): string {
  const b = ins.vaga?.beneficio?.trim();
  return b ? ` (${b})` : "";
}

function norm(s: string | undefined | null): string {
  return (s ?? "").toLowerCase();
}

export function buildPortalNotifications(
  inscriptions: InscricaoPortalLike[] | undefined,
  renovacaoPendente: boolean,
): PortalNotification[] {
  const list: PortalNotification[] = [];

  if (renovacaoPendente) {
    list.push({
      id: "renovacao-obrigatoria",
      title: "Renovação",
      body: "Há formulário de renovação aberto. Conclua-o para voltar a se inscrever em editais.",
      href: "/portal-aluno/formulario-renovacao",
      variant: "warning",
      urgent: true,
    });
  }

  for (const ins of inscriptions ?? []) {
    const sid = String(ins.inscricao_id ?? ins.edital_id ?? Math.random());
    const titulo = ins.titulo_edital?.trim() || "Edital";
    const pref = prefixoProcesso(ins);
    const suf = sufixoBeneficio(ins);

    const totalPendencias = asNumber(ins.total_pendencias);
    const hasPendencias = asBool(ins.possui_pendencias) || totalPendencias > 0;
    if (hasPendencias) {
      const n = totalPendencias;
      list.push({
        id: `docs-${sid}`,
        title: `${pref}Documentação`,
        body:
          n > 0
            ? `${titulo}${suf}: ${n} documento(s) não aprovado(s) ou aguardando envio.`
            : `${titulo}${suf}: pendência de documentação.`,
        href: "/portal-aluno/pendencias",
        variant: "warning",
        urgent: true,
      });
    }

    const totalNovas = asNumber(ins.total_novas_perguntas);
    const hasNovasPerguntas =
      asBool(ins.possui_novas_perguntas_pendentes) || totalNovas > 0;
    if (hasNovasPerguntas) {
      const n = totalNovas;
      list.push({
        id: `nova-perg-${sid}`,
        title: `${pref}Ajustes da inscrição`,
        body:
          n > 0
            ? `${titulo}${suf}: ${n} ajuste(s)/complemento(s) pendente(s) para responder/corrigir.`
            : `${titulo}${suf}: há ajustes/complementos pendentes.`,
        href: "/portal-aluno/pendencias",
        variant: "warning",
        urgent: true,
      });
    }

    const st = norm(ins.status_inscricao);
    const stRaw = ins.status_inscricao ?? "";

    if (st.includes("aprovad")) {
      list.push({
        id: `insc-aprov-${sid}`,
        title: `${pref}Inscrição`,
        body: `${titulo}${suf}: inscrição aprovada na análise.`,
        variant: "success",
        urgent: false,
      });
    } else if (
      st.includes("negad") ||
      st.includes("reprov") ||
      st.includes("rejeit")
    ) {
      const obs = ins.observacao_admin?.trim();
      list.push({
        id: `insc-neg-${sid}`,
        title: `${pref}Inscrição`,
        body: obs
          ? `${titulo}${suf}: inscrição não aprovada. Observação: ${obs}`
          : `${titulo}${suf}: inscrição não aprovada na análise.`,
        variant: "danger",
        urgent: true,
      });
    } else if (stRaw === "Ajuste Necessário" || st.includes("ajuste")) {
      list.push({
        id: `insc-ajuste-${sid}`,
        title: `${pref}Inscrição`,
        body: `${titulo}${suf}: ajuste necessário — verifique o questionário e as orientações.`,
        variant: "warning",
        urgent: true,
      });
    } else if (
      st.includes("aguardando complemento") ||
      st.includes("complemento") ||
      st.includes("regulariza") ||
      st.includes("pendente_regularizacao")
    ) {
      list.push({
        id: `insc-complemento-${sid}`,
        title: `${pref}Inscrição`,
        body: `${titulo}${suf}: há ajustes/complementos pendentes na sua inscrição.`,
        href: "/portal-aluno/pendencias",
        variant: "warning",
        urgent: true,
      });
    } else if (
      st.includes("pendente") ||
      st.includes("análise") ||
      st.includes("analise") ||
      st.includes("em andamento")
    ) {
      list.push({
        id: `insc-analise-${sid}`,
        title: `${pref}Inscrição`,
        body: `${titulo}${suf}: inscrição em análise.`,
        variant: "info",
        urgent: false,
      });
    }

    const ben = norm(ins.status_beneficio_edital);
    if (ben.includes("beneficiário") || ben.includes("beneficiario")) {
      list.push({
        id: `ben-sim-${sid}`,
        title: `${pref}Benefício no edital`,
        body: `${titulo}${suf}: homologado como beneficiário da vaga.`,
        variant: "success",
        urgent: false,
      });
    } else if (
      ben.includes("não beneficiário") ||
      ben.includes("nao beneficiário") ||
      ben.includes("nao beneficiario")
    ) {
      list.push({
        id: `ben-nao-${sid}`,
        title: `${pref}Benefício no edital`,
        body: `${titulo}${suf}: não homologado como beneficiário nesta vaga.`,
        variant: "info",
        urgent: false,
      });
    } else if (ben.includes("pendente") && ben.includes("seleção")) {
      list.push({
        id: `ben-sel-${sid}`,
        title: `${pref}Benefício no edital`,
        body: `${titulo}${suf}: seleção/homologação do benefício pendente.`,
        variant: "info",
        urgent: false,
      });
    }
  }

  return list;
}

export function countUrgentNotifications(notifications: PortalNotification[]): number {
  return notifications.filter((n) => n.urgent).length;
}
