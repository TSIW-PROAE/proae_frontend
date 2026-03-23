import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ExternalLink, History } from "lucide-react";
import { alunoService } from "@/services/AlunoService/alunoService";
import { inscricaoServiceManager } from "@/services/InscricaoService/inscricaoService";
import type { AdminAlunoResumo, AdminAlunoResumoInscricao } from "@/types/adminAlunoResumo";
import type { InscricaoStatusAuditEntry } from "@/types/inscricaoStatusAudit";
import "./CentralEstudanteDrawer.css";

/** Alinhado ao enum `StatusBeneficioEdital` do backend */
const BENEFICIO_OPCOES = ["Pendente seleção", "Beneficiário no edital", "Não beneficiário"] as const;

function labelProcesso(row: AdminAlunoResumoInscricao): string {
  if (row.processo_tipo === "FORMULARIO_GERAL") return "Form. Geral";
  if (row.processo_tipo === "RENOVACAO") return "Renovação";
  return "Edital";
}

/** Abre a tela admin com painel de respostas/documentos (mesmo fluxo das telas FG / FR / Inscrições). */
function hrefDetalheAdmin(row: AdminAlunoResumoInscricao, nivelAluno: string): string {
  const id = row.inscricao_id;
  const n = encodeURIComponent(row.nivel_academico ?? nivelAluno);
  if (row.processo_tipo === "FORMULARIO_GERAL") {
    return `/portal-proae/formulario-geral?tab=inscricoes&expandInscricao=${id}&nivel_academico=${n}`;
  }
  if (row.processo_tipo === "RENOVACAO") {
    return `/portal-proae/formulario-renovacao?tab=inscricoes&expandInscricao=${id}&nivel_academico=${n}`;
  }
  const eid = row.edital_id;
  return `/portal-proae/inscricoes?editalId=${eid}&expandInscricao=${id}`;
}

function formatActorDisplay(entry: { actor_nome?: string | null; actor_usuario_id: string | null }): string {
  const nome = entry.actor_nome?.trim();
  if (nome) return nome;
  const id = entry.actor_usuario_id;
  if (!id) return "—";
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function InscricaoAuditTimeline({ inscricaoId }: { inscricaoId: number }) {
  const [itens, setItens] = useState<InscricaoStatusAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErro(false);
    inscricaoServiceManager
      .listarStatusAuditAdmin(String(inscricaoId))
      .then((data) => {
        if (!cancelled) {
          const asc = [...(data || [])].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );
          setItens(asc);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErro(true);
          setItens([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inscricaoId]);

  if (loading) {
    return (
      <div className="central-audit-loading">
        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        <span>Carregando histórico…</span>
      </div>
    );
  }

  if (erro) {
    return <p className="central-audit-empty">Não foi possível carregar o histórico de auditoria.</p>;
  }

  if (itens.length === 0) {
    return <p className="central-audit-empty">Nenhuma alteração de status registrada ainda.</p>;
  }

  return (
    <ul className="central-audit-timeline">
      {itens.map((ev) => (
        <li key={ev.id} className="central-audit-item">
          <div className="central-audit-dot" aria-hidden />
          <div className="central-audit-body">
            <time className="central-audit-time" dateTime={ev.created_at}>
              {new Date(ev.created_at).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </time>
            <p className="central-audit-change">
              <span className="central-audit-status anterior">{ev.status_anterior ?? "—"}</span>
              <span className="central-audit-arrow">→</span>
              <span className="central-audit-status novo">{ev.status_novo}</span>
            </p>
            <p className="central-audit-actor">
              Por: <span className="central-audit-actor-name">{formatActorDisplay(ev)}</span>
            </p>
            {ev.observacao ? <p className="central-audit-obs">Obs.: {ev.observacao}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Somente leitura: dados consolidados + auditoria. Decisões (status / benefício) ficam em Inscrições por edital ou FG/FR. */
function InscricaoRowResumo({
  row,
  nivelAluno,
  auditGlobalNonce,
}: {
  row: AdminAlunoResumoInscricao;
  nivelAluno: string;
  auditGlobalNonce: number;
}) {
  const isEditalComBeneficio = row.processo_tipo === "EDITAL";
  const beneficioInicial =
    row.status_beneficio_edital && BENEFICIO_OPCOES.includes(row.status_beneficio_edital as (typeof BENEFICIO_OPCOES)[number])
      ? row.status_beneficio_edital
      : "Pendente seleção";

  return (
    <div className="central-inscricao-card">
      <div className="central-inscricao-head">
        <span className={`central-badge central-badge--${row.processo_tipo.toLowerCase()}`}>{labelProcesso(row)}</span>
        <span className="central-edital-title">{row.titulo_edital}</span>
      </div>
      <div className="central-inscricao-meta">
        <span>Inscrição #{row.inscricao_id}</span>
        {row.edital_id ? <span>Edital #{row.edital_id}</span> : null}
        <span>
          Data:{" "}
          {row.data_inscricao ? new Date(row.data_inscricao).toLocaleDateString("pt-BR") : "—"}
        </span>
        {row.possui_pendencias ? <span className="central-pendencia">Pendências doc.</span> : null}
      </div>
      <div className="central-inscricao-meta central-inscricao-meta--destaque">
        <span title="Resultado da análise da inscrição (documentos, parecer)">
          <strong>Análise:</strong> {row.status_inscricao}
        </span>
        {isEditalComBeneficio ? (
          <span title="Homologação do benefício no edital (vaga)">
            <strong>Benefício no edital:</strong> {beneficioInicial}
            {row.beneficio_nome ? ` (${row.beneficio_nome})` : ""}
          </span>
        ) : (
          <span className="central-meta-muted">Benefício no edital: não se aplica (FG / Renovação)</span>
        )}
      </div>
      <a
        className="central-detalhe-link"
        href={hrefDetalheAdmin(row, nivelAluno)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Abrir em gerenciamento (validar respostas e alterar status / benefício)
      </a>
      <p className="central-form-section-hint" style={{ marginTop: "10px", marginBottom: 0 }}>
        A Central concentra apenas a visualização e o histórico. Para registrar decisões de análise ou de benefício no edital, use o link acima.
      </p>

      <div className="central-audit-section">
        <h4 className="central-audit-title">
          <History className="w-4 h-4" />
          Histórico de alterações do status da inscrição (auditoria)
        </h4>
        <InscricaoAuditTimeline
          key={`${row.inscricao_id}-${auditGlobalNonce}`}
          inscricaoId={row.inscricao_id}
        />
      </div>
    </div>
  );
}

interface CentralEstudanteDrawerProps {
  alunoId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CentralEstudanteDrawer({ alunoId, isOpen, onClose }: CentralEstudanteDrawerProps) {
  const [resumo, setResumo] = useState<AdminAlunoResumo | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  /** Incrementa após cada resumo carregado para forçar refetch das linhas do tempo de auditoria. */
  const [auditGlobalNonce, setAuditGlobalNonce] = useState(0);

  const carregar = async () => {
    if (!alunoId) return;
    setLoading(true);
    setErro(null);
    try {
      const data = await alunoService.buscarResumoAdmin(alunoId);
      setResumo(data);
      setAuditGlobalNonce((n) => n + 1);
    } catch (e: unknown) {
      setResumo(null);
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Não foi possível carregar o resumo.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && alunoId) void carregar();
    if (!isOpen) {
      setResumo(null);
      setErro(null);
    }
  }, [isOpen, alunoId]);

  if (!isOpen || typeof document === "undefined") return null;

  const a = resumo?.aluno;

  return createPortal(
    <div className="central-drawer-root" role="dialog" aria-modal="true" aria-label="Central do estudante">
      <button type="button" className="central-drawer-backdrop" onClick={onClose} aria-label="Fechar" />
      <div className="central-drawer-panel">
        <div className="central-drawer-header">
          <h2>Central do estudante</h2>
          <button type="button" className="central-drawer-close" onClick={onClose} aria-label="Fechar painel">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="central-drawer-body">
          {loading && (
            <div className="central-drawer-loading">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p>Carregando dados…</p>
            </div>
          )}

          {!loading && erro && <div className="central-drawer-error">{erro}</div>}

          {!loading && !erro && a && (
            <>
              <section className="central-aluno-bloco">
                <h3>Dados cadastrais</h3>
                <ul className="central-aluno-list">
                  <li>
                    <strong>Nome:</strong> {a.nome || "—"}
                  </li>
                  <li>
                    <strong>Matrícula:</strong> {a.matricula}
                  </li>
                  <li>
                    <strong>E-mail:</strong> {a.email || "—"}
                  </li>
                  <li>
                    <strong>CPF:</strong> {a.cpf || "—"}
                  </li>
                  <li>
                    <strong>Celular:</strong> {a.celular || "—"}
                  </li>
                  <li>
                    <strong>Curso / Campus:</strong> {a.curso} — {a.campus}
                  </li>
                  <li>
                    <strong>Ingresso:</strong>{" "}
                    {a.data_ingresso ? new Date(a.data_ingresso).toLocaleDateString("pt-BR") : "—"}
                  </li>
                  <li>
                    <strong>Nível:</strong> {a.nivel_academico ?? "—"}
                  </li>
                </ul>
              </section>

              <section className="central-inscricoes-bloco">
                <h3>Inscrições ({resumo!.inscricoes.length})</h3>
                <p className="central-inscricoes-hint">
                  Visão consolidada dos processos e do histórico de status. Para alterar análise ou benefício no edital, abra o gerenciamento pelo link em cada inscrição (Inscrições por edital, Form. Geral ou Renovação).
                </p>
                {resumo!.inscricoes.length === 0 ? (
                  <p className="central-vazio">Nenhuma inscrição encontrada.</p>
                ) : (
                  resumo!.inscricoes.map((row) => (
                    <InscricaoRowResumo
                      key={row.inscricao_id}
                      row={row}
                      nivelAluno={a.nivel_academico ?? "Graduação"}
                      auditGlobalNonce={auditGlobalNonce}
                    />
                  ))
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
