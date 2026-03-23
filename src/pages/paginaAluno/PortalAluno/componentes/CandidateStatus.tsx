import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  Users,
  XCircle,
  ArrowRight,
} from "lucide-react";

interface EtapaEdital {
  etapa: string;
  ordem_elemento: number;
  data_inicio: string;
  data_fim: string;
}

interface Vaga {
  vaga_id: string;
  beneficio: string;
  descricao_beneficio: string;
  numero_vagas: number;
}

interface PendenciaStep {
  step_id: string;
  step_texto: string;
  total_pendentes: number;
}

interface NovaPerguntaPendenteStep {
  step_id: string;
  step_texto: string;
  total_novas: number;
  /** Deep-link: mesma URL que Pendências (`pergunta_id`). */
  primeira_pergunta_id?: number;
}

interface EditalAPI {
  edital_id: string;
  inscricao_id: string;
  titulo_edital: string;
  status_edital: string;
  etapa_edital: EtapaEdital[];
  status_inscricao: string;
  /** Homologação da vaga no edital (API `status_beneficio_edital`) */
  status_beneficio_edital?: string;
  data_inscricao: string;
  vaga: Vaga;
  possui_pendencias: boolean;
  total_pendencias: number;
  pendencias_por_step?: PendenciaStep[];
  rejeitada_por_prazo?: boolean;
  rejeitada_por_prazo_complemento?: boolean;
  possui_novas_perguntas_pendentes?: boolean;
  total_novas_perguntas?: number;
  novas_perguntas_pendentes_por_step?: NovaPerguntaPendenteStep[];
  is_formulario_geral?: boolean;
  is_formulario_renovacao?: boolean;
  observacao_admin?: string | null;
}

interface CandidateStatusProps {
  edital: EditalAPI | null;
  onReload?: () => void;
}

const CandidateStatus: React.FC<CandidateStatusProps> = ({ edital }) => {
  const navigate = useNavigate();
  const [fichaOpen, setFichaOpen] = useState(false);
  if (!edital) return null;

  const {
    titulo_edital,
    status_inscricao,
    status_beneficio_edital,
    possui_pendencias,
    etapa_edital: etapaEditalProp,
    data_inscricao,
    vaga,
    total_pendencias: totalPendenciasProp,
    pendencias_por_step,
    possui_novas_perguntas_pendentes,
    total_novas_perguntas,
    novas_perguntas_pendentes_por_step,
    is_formulario_geral,
    is_formulario_renovacao,
    observacao_admin,
  } = edital;

  /** API antiga mandava `etapas_edital`; a correta é `etapa_edital`. */
  const etapa_edital =
    etapaEditalProp ??
    (edital as { etapas_edital?: typeof etapaEditalProp }).etapas_edital ??
    [];
  const total_pendencias = totalPendenciasProp ?? 0;

  const benLower = (status_beneficio_edital ?? "").toLowerCase();
  const ehBeneficiario =
    benLower.includes("beneficiário") || benLower.includes("beneficiario");
  const ehPendenteSelecao =
    benLower.includes("pendente seleção") || benLower.includes("pendente selecao");
  const ehNaoBeneficiario =
    benLower.includes("não beneficiário") ||
    benLower.includes("nao beneficiário") ||
    benLower.includes("nao beneficiario");

  const statusLower = (status_inscricao ?? "").toLowerCase();
  const isAjuste = status_inscricao === "Ajuste Necessário";
  const isNegada = statusLower.includes("negada") || statusLower.includes("rejeitada") || statusLower.includes("reprovada");
  const isFG = is_formulario_geral === true;
  const isFR = is_formulario_renovacao === true;
  /** Mesmo padrão de query que `PendenciasAluno` → `buildAjusteUrl`. */
  const resolveAjusteUrl = () => {
    const first = novas_perguntas_pendentes_por_step?.[0];
    const firstStepId = first?.step_id;
    const firstPerguntaId = first?.primeira_pergunta_id;
    const query = new URLSearchParams();
    query.set("corrigir", "1");
    if (firstStepId) query.set("step_id", String(firstStepId));
    if (firstPerguntaId != null) query.set("pergunta_id", String(firstPerguntaId));
    if (vaga?.vaga_id) query.set("vaga_id", String(vaga.vaga_id));
    if (edital.inscricao_id) {
      query.set("inscricao_id", String(edital.inscricao_id));
    }
    const suffix = `?${query.toString()}`;
    if (isFG) return `/portal-aluno/formulario-geral${suffix}`;
    if (isFR) return `/portal-aluno/formulario-renovacao${suffix}`;
    return `/questionario/${edital.edital_id}${suffix}`;
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (dateStr == null || String(dateStr).trim() === "") return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizarData = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hoje = normalizarData(new Date());

  const getEtapaStatus = (etapa: EtapaEdital): "completed" | "current" | "upcoming" => {
    if (!etapa?.data_inicio || !etapa?.data_fim) return "upcoming";
    const [ai, mi, di] = etapa.data_inicio.split("-").map(Number);
    const [af, mf, df] = etapa.data_fim.split("-").map(Number);
    if ([ai, mi, di, af, mf, df].some((n) => Number.isNaN(n))) return "upcoming";
    const inicio = new Date(ai, mi - 1, di);
    const fim = new Date(af, mf - 1, df);
    if (hoje.getTime() > fim.getTime()) return "completed";
    if (hoje.getTime() >= inicio.getTime() && hoje.getTime() <= fim.getTime()) return "current";
    return "upcoming";
  };

  const etapasOrdenadas = [...(etapa_edital ?? [])].sort(
    (a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime(),
  );

  const getStatusInfo = () => {
    if (isAjuste) {
      return { icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", label: "Ajuste Necessário" };
    }
    if (statusLower.includes("aprovada")) {
      return { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", label: "Aprovada" };
    }
    if (statusLower.includes("rejeitada por prazo de complemento") || statusLower.includes("rejeitada_por_prazo_complemento")) {
      return { icon: Clock, color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-300", label: "Rejeitada por Prazo de Complemento" };
    }
    if (isNegada) {
      return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", label: "Negada" };
    }
    if (statusLower.includes("aguardando complemento") || statusLower.includes("aguardando_complemento")) {
      return { icon: RefreshCw, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-300", label: "Aguardando Complemento" };
    }
    if (statusLower.includes("selecionada") && !statusLower.includes("não")) {
      return { icon: Award, color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-300", label: "Selecionada" };
    }
    if (statusLower.includes("não selecionada") || statusLower.includes("nao_selecionada")) {
      return { icon: Ban, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", label: "Não Selecionada" };
    }
    if (statusLower.includes("regularização") || statusLower.includes("regularizacao")) {
      return { icon: ShieldAlert, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-300", label: "Pendente de Regularização" };
    }
    if (statusLower.includes("em_analise") || statusLower.includes("em análise")) {
      return { icon: HelpCircle, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", label: "Em Análise" };
    }
    if (statusLower.includes("pendente")) {
      return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", label: "Pendente" };
    }
    return { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", label: status_inscricao };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="candidate-status-card">
      <div className="status-header">
        <div className="status-title-section">
          <h3 className="status-title">{titulo_edital}</h3>
          <div className="status-subtitle">
            <Calendar className="w-4 h-4" />
            <span>Inscrito em {formatDate(data_inscricao)}</span>
          </div>
        </div>

        <div className={`status-badge ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
          <span className={statusInfo.color}>{statusInfo.label}</span>
        </div>
      </div>

      <div className="status-content">
        {!isFG && status_beneficio_edital && (
          <div
            className={`mb-3 rounded-lg border px-3 py-2.5 text-sm ${
              ehBeneficiario
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : ehNaoBeneficiario
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            <p className="font-semibold m-0 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Sua participação neste edital
            </p>
            <p className="m-0 mt-1 opacity-95">
              <span className="font-medium">Inscrição:</span> você está inscrito desde {formatDate(data_inscricao)}.{" "}
              <span className="font-medium">Análise da inscrição:</span>{" "}
              {status_inscricao || "—"}.
            </p>
            {ehBeneficiario && statusLower.includes("aprovada") && (
              <p className="m-0 mt-2 font-medium text-emerald-900">
                Você foi <strong>homologado como beneficiário da vaga</strong> neste edital (além da inscrição aprovada na análise).
              </p>
            )}
            {ehPendenteSelecao && !ehBeneficiario && statusLower.includes("aprovada") && (
              <p className="m-0 mt-2">
                Sua inscrição está aprovada na análise; o próximo passo é a <strong>homologação como beneficiário</strong> no edital — aguarde a divulgação ou acompanhe a PROAE.
              </p>
            )}
            {ehNaoBeneficiario && statusLower.includes("aprovada") && (
              <p className="m-0 mt-2">
                Neste edital você <strong>não foi selecionado como beneficiário da vaga</strong>. Sua inscrição segue o status da análise acima.
              </p>
            )}
          </div>
        )}

        {isAjuste && (
          <div className="alert alert-warning">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div className="alert-content">
              <h4 className="alert-title">Ajustes Solicitados</h4>
              <p className="alert-description">
                {observacao_admin ? observacao_admin : "A equipe PROAE solicitou correções na sua inscrição."}
              </p>
            </div>
          </div>
        )}

        {isNegada && observacao_admin && (
          <div className="alert alert-warning">
            <XCircle className="w-5 h-5 text-red-600" />
            <div className="alert-content">
              <h4 className="alert-title">Motivo</h4>
              <p className="alert-description">{observacao_admin}</p>
            </div>
          </div>
        )}

        {vaga && (
          <div className="vaga-card">
            <div className="vaga-card-header">
              <Award className="w-5 h-5 text-indigo-600" />
              <h4 className="vaga-card-title">Vaga Concorrida</h4>
            </div>
            <div className="vaga-card-body">
              <div className="vaga-info">
                <span className="vaga-beneficio">{vaga.beneficio}</span>
                <p className="vaga-descricao">{vaga.descricao_beneficio}</p>
              </div>
              <div className="vaga-slots">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="vaga-slots-number">{vaga.numero_vagas}</span>
                <span className="vaga-slots-label">vagas disponíveis</span>
              </div>
            </div>
          </div>
        )}

        <div className="timeline-section">
          <h4 className="timeline-title">Linha do Tempo do Processo</h4>
          {etapasOrdenadas.length === 0 ? (
            <p className="text-sm text-gray-500 px-1 py-2 m-0">
              Não há etapas com datas cadastradas para este edital. Se o processo já deveria aparecer aqui, entre em contato com a PROAE.
            </p>
          ) : null}
          <div className="timeline-container">
            {etapasOrdenadas.map((etapa, index) => {
              const status = getEtapaStatus(etapa);
              const isLast = index === etapasOrdenadas.length - 1;
              return (
                <div key={index} className={`timeline-item timeline-${status}`}>
                  <div className="timeline-marker-col">
                    <div className={`timeline-dot timeline-dot-${status}`}>
                      {status === "completed" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : status === "current" ? (
                        <div className="timeline-pulse" />
                      ) : (
                        <div className="timeline-empty-dot" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`timeline-line ${
                          status === "completed" ? "timeline-line-solid" : "timeline-line-dashed"
                        }`}
                      />
                    )}
                  </div>
                  <div className="timeline-content-col">
                    <span className="timeline-etapa-name">{etapa.etapa}</span>
                    <span className="timeline-etapa-dates">
                      {formatDate(etapa.data_inicio)} — {formatDate(etapa.data_fim)}
                    </span>
                    {status === "current" && (
                      <span className="timeline-current-badge">Em andamento</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {possui_pendencias && (
          <div className="pendencias-urgent-section">
            <div className="pendencias-urgent-header">
              <div className="pendencias-urgent-icon-wrapper">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="pendencias-urgent-info">
                <h4 className="pendencias-urgent-title">
                  {total_pendencias} pendência{total_pendencias > 1 ? "s" : ""} requer
                  {total_pendencias > 1 ? "em" : ""} sua atenção
                </h4>
              </div>
            </div>

            {pendencias_por_step && pendencias_por_step.length > 0 && (
              <div className="pendencias-steps-list">
                {pendencias_por_step.map((step) => (
                  <div key={step.step_id} className="pendencia-step-item">
                    <div className="pendencia-step-icon">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="pendencia-step-info">
                      <span className="pendencia-step-name">{step.step_texto}</span>
                      <span className="pendencia-step-count">
                        {step.total_pendentes} pendente{step.total_pendentes > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate("/portal-aluno/pendencias")} className="pendencias-urgent-button">
              <RefreshCw className="w-4 h-4" />
              <span>Resolver pendências</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {possui_novas_perguntas_pendentes && (
          <div className="pendencias-urgent-section novas-perguntas-section">
            <div className="pendencias-urgent-header">
              <div className="pendencias-urgent-icon-wrapper novas-perguntas-icon">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="pendencias-urgent-info">
                <h4 className="pendencias-urgent-title">
                  {total_novas_perguntas ?? 0} ajuste{(total_novas_perguntas ?? 0) > 1 ? "s" : ""} de resposta/complemento
                  {" "}pendente{(total_novas_perguntas ?? 0) > 1 ? "s" : ""}
                </h4>
              </div>
            </div>

            {novas_perguntas_pendentes_por_step && novas_perguntas_pendentes_por_step.length > 0 && (
              <div className="pendencias-steps-list">
                {novas_perguntas_pendentes_por_step.map((step) => (
                  <div key={step.step_id} className="pendencia-step-item">
                    <div className="pendencia-step-icon">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="pendencia-step-info">
                      <span className="pendencia-step-name">{step.step_texto}</span>
                      <span className="pendencia-step-count">
                        {step.total_novas} nova{step.total_novas > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate(resolveAjusteUrl())} className="pendencias-urgent-button novas-perguntas-button">
              <RefreshCw className="w-4 h-4" />
              <span>Resolver ajustes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="status-actions">
        <button onClick={() => setFichaOpen(true)} className="action-button secondary">
          <FileText className="w-4 h-4" />
          <span>Ver Ficha de Inscrição</span>
        </button>

        {isAjuste && isFG && (
          <button onClick={() => navigate("/portal-aluno/formulario-geral")} className="action-button primary">
            <AlertTriangle className="w-4 h-4" />
            <span>Corrigir Formulário</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {fichaOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ficha da inscrição"
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setFichaOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h4 className="m-0 text-base font-semibold text-slate-900">Ficha de Inscrição</h4>
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setFichaOpen(false)}
              >
                Fechar
              </button>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm text-slate-800">
              <p className="m-0">
                <span className="font-semibold">Edital:</span> {titulo_edital}
              </p>
              <p className="m-0">
                <span className="font-semibold">Status da inscrição:</span> {status_inscricao || "—"}
              </p>
              <p className="m-0">
                <span className="font-semibold">Status do benefício no edital:</span> {status_beneficio_edital || "—"}
              </p>
              <p className="m-0">
                <span className="font-semibold">Data de inscrição:</span> {formatDate(data_inscricao)}
              </p>
              {vaga && (
                <p className="m-0">
                  <span className="font-semibold">Vaga/benefício:</span> {vaga.beneficio || "—"}
                </p>
              )}
              <p className="m-0">
                <span className="font-semibold">Pendências de documentos:</span> {total_pendencias}
              </p>
              <p className="m-0">
                <span className="font-semibold">Novas perguntas pendentes:</span> {total_novas_perguntas ?? 0}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                onClick={() => {
                  navigate("/portal-aluno/pendencias");
                  setFichaOpen(false);
                }}
              >
                Ir para Pendências
              </button>
              {isFG && (
                <button
                  type="button"
                  className="rounded-md bg-[#183b4e] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                  onClick={() => {
                    navigate("/portal-aluno/formulario-geral");
                    setFichaOpen(false);
                  }}
                >
                  Abrir formulário geral
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateStatus;

