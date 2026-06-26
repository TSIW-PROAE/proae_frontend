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
  situacao_solicitacao?:
    | "SELECIONADA"
    | "CLASSIFICADA"
    | "INDEFERIDA"
    | "DESISTENTE";
  status_beneficio_edital?: string;
  resultado_fase?: string;
  recurso_status?: string;
  recurso_observacao?: string | null;
  observacao_admin?: string | null;
  possui_pendencias?: boolean;
  total_pendencias?: number;
  possui_novas_perguntas_pendentes?: boolean;
  total_novas_perguntas?: number;
  novas_perguntas_pendentes_por_step?: Array<{
    step_id?: string | number;
    primeira_pergunta_id?: number;
  }>;
  vaga?: { beneficio?: string; vaga_id?: string | number };
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

function prefixoProcesso(_ins: InscricaoPortalLike): string {
  return "";
}

function sufixoBeneficio(ins: InscricaoPortalLike): string {
  const b = ins.vaga?.beneficio?.trim();
  return b ? ` (${b})` : "";
}

function norm(s: string | undefined | null): string {
  return (s ?? "").toLowerCase();
}

function resolveAjusteHref(ins: InscricaoPortalLike): string {
  const query = new URLSearchParams();
  query.set("corrigir", "1");
  const first = ins.novas_perguntas_pendentes_por_step?.[0];
  if (first?.step_id != null) query.set("step_id", String(first.step_id));
  if (first?.primeira_pergunta_id != null) {
    query.set("pergunta_id", String(first.primeira_pergunta_id));
  }
  if (ins.vaga?.vaga_id != null) query.set("vaga_id", String(ins.vaga.vaga_id));
  if (ins.inscricao_id != null) query.set("inscricao_id", String(ins.inscricao_id));
  const suffix = `?${query.toString()}`;

  if (ins.edital_id != null) return `/questionario/${ins.edital_id}${suffix}`;
  return "/portal-aluno/pendencias";
}

export function buildPortalNotifications(
  inscriptions: InscricaoPortalLike[] | undefined,
): PortalNotification[] {
  const list: PortalNotification[] = [];

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
        href: resolveAjusteHref(ins),
        variant: "warning",
        urgent: true,
      });
    }

    const st = norm(ins.status_inscricao);
    const stRaw = ins.status_inscricao ?? "";
    const situacao = (ins.situacao_solicitacao ?? "").toString().trim().toUpperCase();
    const hasSituacaoExplicita = [
      "SELECIONADA",
      "CLASSIFICADA",
      "INDEFERIDA",
      "DESISTENTE",
    ].includes(situacao);

    if (hasSituacaoExplicita) {
      if (situacao === "SELECIONADA") {
        list.push({
          id: `sit-selecionada-${sid}`,
          title: `${pref}Situação da solicitação`,
          body: `${titulo}${suf}: solicitação selecionada.`,
          variant: "success",
          urgent: false,
        });
      } else if (situacao === "CLASSIFICADA") {
        list.push({
          id: `sit-classificada-${sid}`,
          title: `${pref}Situação da solicitação`,
          body: `${titulo}${suf}: solicitação classificada.`,
          variant: "info",
          urgent: false,
        });
      } else if (situacao === "INDEFERIDA") {
        const obs = ins.observacao_admin?.trim();
        list.push({
          id: `sit-indeferida-${sid}`,
          title: `${pref}Situação da solicitação`,
          body: obs
            ? `${titulo}${suf}: solicitação indeferida. Observação: ${obs}`
            : `${titulo}${suf}: solicitação indeferida.`,
          variant: "danger",
          urgent: false,
        });
      } else if (situacao === "DESISTENTE") {
        list.push({
          id: `sit-desistente-${sid}`,
          title: `${pref}Situação da solicitação`,
          body: `${titulo}${suf}: solicitação marcada como desistente.`,
          variant: "info",
          urgent: false,
        });
      }
    }

    if (!hasSituacaoExplicita && st.includes("aprovad")) {
      list.push({
        id: `insc-aprov-${sid}`,
        title: `${pref}Análise da inscrição`,
        body: `${titulo}${suf}: inscrição aprovada na análise.`,
        variant: "success",
        urgent: false,
      });
    } else if (
      !hasSituacaoExplicita &&
      (st.includes("negad") ||
        st.includes("reprov") ||
        st.includes("rejeit"))
    ) {
      const obs = ins.observacao_admin?.trim();
      list.push({
        id: `insc-neg-${sid}`,
        title: `${pref}Análise da inscrição`,
        body: obs
          ? `${titulo}${suf}: inscrição não aprovada. Observação: ${obs}`
          : `${titulo}${suf}: inscrição não aprovada na análise.`,
        variant: "danger",
        /** Situação final — não há ação no portal; só informa na lista. */
        urgent: false,
      });
    } else if (
      !hasSituacaoExplicita &&
      (stRaw === "Ajuste Necessário" || st.includes("ajuste"))
    ) {
      list.push({
        id: `insc-ajuste-${sid}`,
        title: `${pref}Análise da inscrição`,
        body: `${titulo}${suf}: ajuste necessário — verifique o questionário e as orientações.`,
        href: resolveAjusteHref(ins),
        variant: "warning",
        urgent: true,
      });
    } else if (
      !hasSituacaoExplicita &&
      (st.includes("aguardando complemento") ||
        st.includes("complemento") ||
        st.includes("regulariza") ||
        st.includes("pendente_regularizacao"))
    ) {
      list.push({
        id: `insc-complemento-${sid}`,
        title: `${pref}Análise da inscrição`,
        body: `${titulo}${suf}: há ajustes/complementos pendentes na sua inscrição.`,
        href: resolveAjusteHref(ins),
        variant: "warning",
        urgent: true,
      });
    } else if (
      !hasSituacaoExplicita &&
      (st.includes("pendente") ||
        st.includes("análise") ||
        st.includes("analise") ||
        st.includes("em andamento"))
    ) {
      list.push({
        id: `insc-analise-${sid}`,
        title: `${pref}Análise da inscrição`,
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

    const resultado = norm(ins.resultado_fase);
    const recurso = norm(ins.recurso_status);
    if (resultado.includes("preliminar")) {
      list.push({
        id: `res-prelim-${sid}`,
        title: `${pref}Resultado da inscrição`,
        body: `${titulo}${suf}: resultado preliminar publicado.`,
        variant: "info",
        urgent: false,
      });
    } else if (resultado.includes("final")) {
      list.push({
        id: `res-final-${sid}`,
        title: `${pref}Resultado da inscrição`,
        body: `${titulo}${suf}: resultado final publicado.`,
        variant: "success",
        urgent: false,
      });
    }

    if (recurso.includes("solicitado")) {
      list.push({
        id: `recurso-sol-${sid}`,
        title: `${pref}Recurso da inscrição`,
        body: `${titulo}${suf}: recurso solicitado e aguardando julgamento.`,
        variant: "warning",
        urgent: true,
      });
    } else if (recurso.includes("deferido")) {
      list.push({
        id: `recurso-def-${sid}`,
        title: `${pref}Recurso da inscrição`,
        body: `${titulo}${suf}: recurso deferido.`,
        variant: "success",
        urgent: false,
      });
    } else if (recurso.includes("indeferido")) {
      const obs = ins.recurso_observacao?.trim();
      list.push({
        id: `recurso-ind-${sid}`,
        title: `${pref}Recurso da inscrição`,
        body: obs
          ? `${titulo}${suf}: recurso indeferido. Parecer: ${obs}`
          : `${titulo}${suf}: recurso indeferido.`,
        variant: "danger",
        urgent: false,
      });
    }
  }

  return list;
}

export function countUrgentNotifications(notifications: PortalNotification[]): number {
  return notifications.filter((n) => n.urgent).length;
}

/** Chave no sessionStorage por usuário (e-mail). */
export function portalNotifReadStorageKey(userKey: string): string {
  const safe = (userKey || "anon").trim().toLowerCase();
  return `proae_portal_notif_read_${safe}`;
}

export function loadReadPortalNotificationIds(userKey: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(portalNotifReadStorageKey(userKey));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveReadPortalNotificationIds(
  userKey: string,
  ids: Set<string>,
): void {
  try {
    sessionStorage.setItem(
      portalNotifReadStorageKey(userKey),
      JSON.stringify([...ids]),
    );
  } catch {
    /* quota / modo privado */
  }
}

/** Urgentes que o aluno ainda não abriu no sininho nesta sessão/navegador. */
export function countUnreadUrgentNotifications(
  notifications: PortalNotification[],
  readIds: Set<string>,
): number {
  return notifications.filter((n) => n.urgent && !readIds.has(n.id)).length;
}
