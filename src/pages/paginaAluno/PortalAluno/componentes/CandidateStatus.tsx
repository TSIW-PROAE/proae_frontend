import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  ArrowRight,
  Award,
  Users,
  ShieldAlert,
  Ban,
  HelpCircle,
  RefreshCw,
  X,
  ArrowLeft,
  Send,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { respostaService, UpdateRespostaDto } from "../../../../services/RespostaService/respostaService";

// Tipos baseados no novo formato da API
interface EtapaEdital {
  etapa: string;
  ordem_elemento: number;
  data_inicio: string;
  data_fim: string;
}

interface Vaga {
  vaga_id: number;
  beneficio: string;
  descricao_beneficio: string;
  numero_vagas: number;
}

interface PerguntaPendente {
  pergunta_id: number;
  pergunta_texto: string;
  resposta_id: number;
  resposta_texto: string;
  parecer: string;
  prazo_reenvio: string;
  tipo_pergunta?: string;
  opcoes?: string[];
}

interface PendenciaStep {
  step_id: number;
  step_texto: string;
  perguntas_pendentes: PerguntaPendente[];
  total_pendentes: number;
}

interface EditalAPI {
  edital_id: number;
  inscricao_id: number;
  titulo_edital: string;
  status_edital: string;
  etapa_edital: EtapaEdital[];
  status_inscricao: string;
  data_inscricao: string;
  vaga: Vaga;
  possui_pendencias: boolean;
  total_pendencias: number;
  pendencias_por_step?: PendenciaStep[];
  rejeitada_por_prazo?: boolean;
}

interface CandidateStatusProps {
  edital: EditalAPI | null;
  onReload?: () => void;
}

const CandidateStatus: React.FC<CandidateStatusProps> = ({ edital, onReload }) => {
  // ── Estado do modal de reenvio ──
  const [modalAberto, setModalAberto] = useState(false);
  const [stepSelecionado, setStepSelecionado] = useState<PendenciaStep | null>(null);
  const [respostasEditadas, setRespostasEditadas] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState<Record<number, boolean>>({});
  const [resultados, setResultados] = useState<Record<number, "sucesso" | "erro">>({});
  const [mensagensErro, setMensagensErro] = useState<Record<number, string>>({});
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [houveEnvio, setHouveEnvio] = useState(false);

  if (!edital) return null;

  const {
    titulo_edital,
    status_inscricao,
    possui_pendencias,
    etapa_edital,
    inscricao_id,
    data_inscricao,
    vaga,
    total_pendencias,
    pendencias_por_step,
    rejeitada_por_prazo,
  } = edital;

  // Ordenar etapas
  const etapasOrdenadas = [...etapa_edital].sort((a, b) => a.ordem_elemento - b.ordem_elemento);

  // Normalizar data para comparar apenas ano/mês/dia (ignora horário)
  const normalizarData = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const hoje = normalizarData(new Date());

  const getEtapaStatus = (etapa: EtapaEdital): "completed" | "current" | "upcoming" => {
    // Parsear datas no formato "YYYY-MM-DD" como local (evita fuso UTC)
    const [ai, mi, di] = etapa.data_inicio.split("-").map(Number);
    const [af, mf, df] = etapa.data_fim.split("-").map(Number);
    const inicio = new Date(ai, mi - 1, di);
    const fim = new Date(af, mf - 1, df);

    if (hoje.getTime() > fim.getTime()) return "completed";
    if (hoje.getTime() >= inicio.getTime() && hoje.getTime() <= fim.getTime()) return "current";
    return "upcoming";
  };

  // Status de inscrição com todas as variações
  const getStatusInfo = () => {
    const statusLower = status_inscricao.toLowerCase();

    if (statusLower.includes("aprovada")) {
      return {
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        label: "Aprovada",
        dotClass: "status-dot-approved",
      };
    } else if (statusLower.includes("rejeitada") || statusLower.includes("reprovada")) {
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        label: "Rejeitada",
        dotClass: "status-dot-rejected",
      };
    } else if (statusLower.includes("selecionada") && !statusLower.includes("não")) {
      return {
        icon: Award,
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-300",
        label: "Selecionada",
        dotClass: "status-dot-selected",
      };
    } else if (statusLower.includes("não selecionada") || statusLower.includes("nao_selecionada")) {
      return {
        icon: Ban,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        label: "Não Selecionada",
        dotClass: "status-dot-not-selected",
      };
    } else if (statusLower.includes("regularização") || statusLower.includes("regularizacao")) {
      return {
        icon: ShieldAlert,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-300",
        label: "Pendente de Regularização",
        dotClass: "status-dot-regularization",
      };
    } else if (statusLower.includes("em_analise") || statusLower.includes("em análise")) {
      return {
        icon: HelpCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: "Em Análise",
        dotClass: "status-dot-analysis",
      };
    } else if (statusLower.includes("pendente")) {
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        label: "Pendente",
        dotClass: "status-dot-pending",
      };
    } else {
      return {
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: status_inscricao,
        dotClass: "status-dot-default",
      };
    }
  };

  const statusInfo = getStatusInfo();

  const handleViewForm = () => {
    alert("Abrir ficha de inscrição");
  };

  // ── Handlers do modal de reenvio ──
  const abrirModal = useCallback(() => {
    setModalAberto(true);
    setStepSelecionado(null);
    setRespostasEditadas({});
    setEnviando({});
    setResultados({});
    setMensagensErro({});
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setStepSelecionado(null);
    setRespostasEditadas({});
    setEnviando({});
    setResultados({});
    setMensagensErro({});
    setConfirmandoId(null);
    if (houveEnvio && onReload) {
      onReload();
    }
    setHouveEnvio(false);
  }, [houveEnvio, onReload]);

  const voltarParaSteps = useCallback(() => {
    setStepSelecionado(null);
    setRespostasEditadas({});
    setEnviando({});
    setMensagensErro({});
    setConfirmandoId(null);
    // NÃO limpa resultados — preserva o estado de quem já foi corrigido
  }, []);

  const handleRespostaChange = useCallback((respostaId: number, valor: string) => {
    setRespostasEditadas((prev) => ({ ...prev, [respostaId]: valor }));
  }, []);

  const pedirConfirmacao = useCallback((respostaId: number) => {
    setConfirmandoId(respostaId);
  }, []);

  const cancelarConfirmacao = useCallback(() => {
    setConfirmandoId(null);
  }, []);

  const confirmarEnvio = useCallback(
    async (pergunta: PerguntaPendente) => {
      const novoValor = respostasEditadas[pergunta.resposta_id]?.trim();
      if (!novoValor) return;

      setConfirmandoId(null);
      setEnviando((prev) => ({ ...prev, [pergunta.resposta_id]: true }));
      setResultados((prev) => {
        const copia = { ...prev };
        delete copia[pergunta.resposta_id];
        return copia;
      });
      setMensagensErro((prev) => {
        const copia = { ...prev };
        delete copia[pergunta.resposta_id];
        return copia;
      });

      try {
        const dto: UpdateRespostaDto = { valorTexto: novoValor };
        await respostaService.atualizarResposta(pergunta.resposta_id, dto);
        setResultados((prev) => ({ ...prev, [pergunta.resposta_id]: "sucesso" }));
        setHouveEnvio(true);
      } catch (err: any) {
        setResultados((prev) => ({ ...prev, [pergunta.resposta_id]: "erro" }));
        setMensagensErro((prev) => ({
          ...prev,
          [pergunta.resposta_id]: err?.message || "Erro ao enviar resposta",
        }));
      } finally {
        setEnviando((prev) => ({ ...prev, [pergunta.resposta_id]: false }));
      }
    },
    [respostasEditadas],
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Verificar prazo mais próximo nas pendências
  const getPrazoMaisProximo = (): string | null => {
    if (!pendencias_por_step) return null;
    let menorPrazo: Date | null = null;
    pendencias_por_step.forEach((step) => {
      step.perguntas_pendentes.forEach((p) => {
        const prazo = new Date(p.prazo_reenvio);
        if (!menorPrazo || prazo < menorPrazo) menorPrazo = prazo;
      });
    });
    if (!menorPrazo) return null;
    const resultado: Date = menorPrazo;
    return resultado.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const prazoProximo = getPrazoMaisProximo();

  return (
    <div className="candidate-status-card">
      {/* Header */}
      <div className="status-header">
        <div className="status-title-section">
          <h3 className="status-title">{titulo_edital}</h3>
          <div className="status-subtitle">
            <Calendar className="w-4 h-4" />
            <span>
              Inscrito em {formatDate(data_inscricao)} &middot; #{inscricao_id}
            </span>
          </div>
        </div>

        <div className={`status-badge ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
          <span className={statusInfo.color}>{statusInfo.label}</span>
        </div>
      </div>

      <div className="status-content">
        {/* Card de Vaga */}
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

        {/* Timeline de Etapas */}
        <div className="timeline-section">
          <h4 className="timeline-title">Linha do Tempo do Processo</h4>
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
                    {!isLast && <div className={`timeline-line ${status === "completed" ? "timeline-line-solid" : "timeline-line-dashed"}`} />}
                  </div>
                  <div className="timeline-content-col">
                    <span className="timeline-etapa-name">{etapa.etapa}</span>
                    <span className="timeline-etapa-dates">
                      {formatDate(etapa.data_inicio)} — {formatDate(etapa.data_fim)}
                    </span>
                    {status === "current" && <span className="timeline-current-badge">Em andamento</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção de Pendências (urgente) */}
        {possui_pendencias && pendencias_por_step && pendencias_por_step.length > 0 && (
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
                {prazoProximo && (
                  <p className="pendencias-urgent-prazo">
                    <Clock className="w-3.5 h-3.5" />
                    Prazo mais próximo: <strong>{prazoProximo}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="pendencias-steps-list">
              {pendencias_por_step.map((step) => (
                <div key={step.step_id} className="pendencia-step-item">
                  <div className="pendencia-step-icon">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="pendencia-step-info">
                    <span className="pendencia-step-name">{step.step_texto}</span>
                    <span className="pendencia-step-count">
                      {step.total_pendentes} resposta{step.total_pendentes > 1 ? "s" : ""} pendente
                      {step.total_pendentes > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={abrirModal} className="pendencias-urgent-button">
              <RefreshCw className="w-4 h-4" />
              <span>Reenviar Respostas Pendentes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sem pendências */}
        {!possui_pendencias &&
          (() => {
            const statusLower = status_inscricao.toLowerCase();
            const isRejeitada = statusLower.includes("rejeitada") || statusLower.includes("reprovada");
            const isNaoSelecionada = statusLower.includes("não selecionada") || statusLower.includes("nao_selecionada");

            if (isRejeitada) {
              return (
                <div className="alert alert-rejected">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div className="alert-content">
                    <h4 className="alert-title">Inscrição rejeitada</h4>
                    <p className="alert-description">
                      {rejeitada_por_prazo
                        ? "Sua inscrição foi rejeitada devido ao não cumprimento do prazo para correção das pendências solicitadas."
                        : "Infelizmente sua inscrição não foi aprovada neste edital. Consulte o edital para mais informações ou entre em contato com a PROAE."}
                    </p>
                    {rejeitada_por_prazo && (
                      <div className="alert-prazo-aviso">
                        <Clock className="w-4 h-4" />
                        <span>O prazo para reenvio das respostas expirou antes que as correções fossem realizadas.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (isNaoSelecionada) {
              return (
                <div className="alert alert-not-selected">
                  <Ban className="w-5 h-5 text-purple-600" />
                  <div className="alert-content">
                    <h4 className="alert-title">Não selecionada</h4>
                    <p className="alert-description">
                      Sua inscrição não foi selecionada neste processo. Fique atento a novos editais e oportunidades.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="alert alert-success">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div className="alert-content">
                  <h4 className="alert-title">Tudo em dia!</h4>
                  <p className="alert-description">Nenhuma pendência encontrada na sua inscrição.</p>
                </div>
              </div>
            );
          })()}
      </div>

      <div className="status-actions">
        <button onClick={handleViewForm} className="action-button secondary">
          <FileText className="w-4 h-4" />
          <span>Ver Ficha de Inscrição</span>
        </button>
      </div>

      {/* ── Modal de Reenvio de Respostas (portal para tela inteira) ── */}
      {modalAberto &&
        pendencias_por_step &&
        createPortal(
          <div className="reenvio-overlay" onClick={fecharModal}>
            <div className="reenvio-modal" onClick={(e) => e.stopPropagation()}>
              {/* Header do modal */}
              <div className="reenvio-modal-header">
                <div className="reenvio-modal-header-left">
                  {stepSelecionado && (
                    <button className="reenvio-voltar-btn" onClick={voltarParaSteps} title="Voltar para etapas">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <h2 className="reenvio-modal-title">{stepSelecionado ? stepSelecionado.step_texto : "Reenviar Respostas Pendentes"}</h2>
                    <p className="reenvio-modal-subtitle">
                      {(() => {
                        const totalCorrigidas = Object.values(resultados).filter((r) => r === "sucesso").length;
                        if (stepSelecionado) {
                          const corrigidasStep = stepSelecionado.perguntas_pendentes.filter((p) => resultados[p.resposta_id] === "sucesso").length;
                          const restantesStep = stepSelecionado.total_pendentes - corrigidasStep;
                          return restantesStep > 0
                            ? `${restantesStep} resposta${restantesStep > 1 ? "s" : ""} pendente${restantesStep > 1 ? "s" : ""}`
                            : "Todas as respostas foram corrigidas!";
                        }
                        const restantesTotal = total_pendencias - totalCorrigidas;
                        return restantesTotal > 0
                          ? `${restantesTotal} pendência${restantesTotal > 1 ? "s" : ""} em ${pendencias_por_step.length} etapa${pendencias_por_step.length > 1 ? "s" : ""}`
                          : "Todas as pendências foram corrigidas!";
                      })()}
                    </p>
                  </div>
                </div>
                <button className="reenvio-fechar-btn" onClick={fecharModal} title="Fechar">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo do modal */}
              <div className="reenvio-modal-body">
                {!stepSelecionado ? (
                  /* ── Grade de Steps ── */
                  <div className="reenvio-steps-grid">
                    {pendencias_por_step.map((step) => {
                      const corrigidasNoStep = step.perguntas_pendentes.filter((p) => resultados[p.resposta_id] === "sucesso").length;
                      const restantes = step.total_pendentes - corrigidasNoStep;

                      return (
                        <button
                          key={step.step_id}
                          className={`reenvio-step-card ${restantes === 0 ? "reenvio-step-card-done" : ""}`}
                          onClick={() => setStepSelecionado(step)}
                        >
                          <div className={`reenvio-step-card-icon ${restantes === 0 ? "reenvio-step-icon-done" : ""}`}>
                            {restantes === 0 ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                          </div>
                          <h3 className="reenvio-step-card-title">{step.step_texto}</h3>
                          {restantes > 0 ? (
                            <div className="reenvio-step-card-badge">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>
                                {restantes} pendente{restantes > 1 ? "s" : ""}
                              </span>
                            </div>
                          ) : (
                            <div className="reenvio-step-card-badge-done">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tudo corrigido</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* ── Lista de Perguntas Pendentes ── */
                  <div className="reenvio-perguntas-lista">
                    {stepSelecionado.perguntas_pendentes.map((pergunta) => {
                      const jaEnviou = resultados[pergunta.resposta_id] === "sucesso";
                      const temErro = resultados[pergunta.resposta_id] === "erro";
                      const estaEnviando = enviando[pergunta.resposta_id] || false;
                      const valorEditado = respostasEditadas[pergunta.resposta_id] ?? "";

                      const prazo = new Date(pergunta.prazo_reenvio);
                      const prazoExpirado = prazo.getTime() < Date.now();
                      const prazoFormatado = prazo.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={pergunta.resposta_id}
                          className={`reenvio-pergunta-card ${jaEnviou ? "reenvio-pergunta-sucesso" : ""} ${prazoExpirado ? "reenvio-pergunta-expirada" : ""}`}
                        >
                          {/* Cabeçalho da pergunta */}
                          <div className="reenvio-pergunta-header">
                            <h4 className="reenvio-pergunta-texto">{pergunta.pergunta_texto}</h4>
                            <div className={`reenvio-prazo-chip ${prazoExpirado ? "reenvio-prazo-expirado" : ""}`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{prazoExpirado ? "Prazo vencido" : `Prazo: ${prazoFormatado}`}</span>
                            </div>
                          </div>

                          {/* Resposta anterior */}
                          <div className="reenvio-resposta-anterior">
                            <span className="reenvio-label">Resposta anterior:</span>
                            <p className="reenvio-valor-anterior">{pergunta.resposta_texto || "—"}</p>
                          </div>

                          {/* Parecer da PROAE */}
                          <div className="reenvio-parecer-box">
                            <div className="reenvio-parecer-header">
                              <MessageSquare className="w-4 h-4" />
                              <span className="reenvio-parecer-label">Parecer da PROAE</span>
                            </div>
                            <p className="reenvio-parecer-texto">{pergunta.parecer}</p>
                          </div>

                          {/* Input de reenvio ou mensagem de sucesso */}
                          {jaEnviou ? (
                            <div className="reenvio-sucesso-msg">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Resposta reenviada com sucesso!</span>
                            </div>
                          ) : prazoExpirado ? (
                            <div className="reenvio-expirado-msg">
                              <AlertCircle className="w-4 h-4" />
                              <span>O prazo para reenvio desta resposta já expirou.</span>
                            </div>
                          ) : (
                            <div className="reenvio-input-area">
                              <label className="reenvio-input-label">Nova resposta</label>
                              <textarea
                                className="reenvio-textarea"
                                rows={3}
                                placeholder="Digite sua nova resposta..."
                                value={valorEditado}
                                onChange={(e) => handleRespostaChange(pergunta.resposta_id, e.target.value)}
                                disabled={estaEnviando}
                              />
                              {temErro && mensagensErro[pergunta.resposta_id] && (
                                <div className="reenvio-erro-msg">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{mensagensErro[pergunta.resposta_id]}</span>
                                </div>
                              )}

                              {confirmandoId === pergunta.resposta_id ? (
                                <div className="reenvio-confirmacao">
                                  <p className="reenvio-confirmacao-texto">
                                    <AlertTriangle className="w-4 h-4" />
                                    Tem certeza que deseja enviar esta correção?
                                  </p>
                                  <div className="reenvio-confirmacao-botoes">
                                    <button className="reenvio-confirmar-sim" onClick={() => confirmarEnvio(pergunta)}>
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Sim, enviar</span>
                                    </button>
                                    <button className="reenvio-confirmar-nao" onClick={cancelarConfirmacao}>
                                      <X className="w-4 h-4" />
                                      <span>Cancelar</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className="reenvio-enviar-btn"
                                  onClick={() => pedirConfirmacao(pergunta.resposta_id)}
                                  disabled={estaEnviando || !valorEditado.trim()}
                                >
                                  {estaEnviando ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Enviando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4" />
                                      <span>Enviar Resposta</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default CandidateStatus;
