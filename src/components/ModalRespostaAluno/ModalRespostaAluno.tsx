import { useContext, useEffect, useMemo, useState } from "react";
import { X, MessageSquare, CheckCircle2, AlertCircle, CheckCircle, XCircle, Clock, FileText, Paperclip } from "lucide-react";
import { AlunoInscrito, RespostaStep } from "../../types/inscricao";
import { respostaService } from "../../services/RespostaService/respostaService";
import { documentoService } from "../../services/DocumentoService/documentoService";
import { DocumentoInscricao, DocumentoStatus } from "../../types/documento";
import { validacaoService } from "../../services/ValidacaoService/validacaoService";
import { AuthContext } from "../../context/AuthContext";
import DocumentViewerModal from "@/components/DocumentViewerModal/DocumentViewerModal";
import "./ModalRespostaAluno.css";

interface ModalRespostaAlunoProps {
  aluno: AlunoInscrito | null;
  onClose: () => void;
  onSaved?: () => void;
}

type RespostaEstado = {
  validada: boolean;
  dataValidade?: string;
};

type DocumentoEstado = {
  status: DocumentoStatus;
  parecer: string;
};

const DOCUMENT_STATUS_OPTIONS: DocumentoStatus[] = ["Não Enviado", "Pendente", "Aprovado", "Reprovado", "Em Análise"];

const RESPOSTA_STATUS_INFO: Record<"aprovado" | "reprovado" | "pendente", { className: string; label: string; icon: JSX.Element }> = {
  aprovado: {
    className: "status-pill status-pill-aprovado",
    label: "Validada",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  reprovado: {
    className: "status-pill status-pill-reprovado",
    label: "Reprovada",
    icon: <XCircle className="w-4 h-4" />,
  },
  pendente: {
    className: "status-pill status-pill-pendente",
    label: "Pendente",
    icon: <Clock className="w-4 h-4" />,
  },
};

const mapDocumentoStatusToValidacaoStatus = (status: DocumentoStatus): "pendente" | "aprovado" | "reprovado" => {
  if (status === "Aprovado") return "aprovado";
  if (status === "Reprovado") return "reprovado";
  return "pendente";
};

export default function ModalRespostaAluno({ aluno, onClose, onSaved }: ModalRespostaAlunoProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authContext = useContext(AuthContext) as any;
  const userInfo = authContext?.userInfo;

  const [respostasEstado, setRespostasEstado] = useState<Record<string, RespostaEstado>>({});
  const [documentos, setDocumentos] = useState<DocumentoInscricao[]>([]);
  const [documentosEstado, setDocumentosEstado] = useState<Record<string, DocumentoEstado>>({});
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFileRef, setViewerFileRef] = useState<string | null>(null);

  const abrirArquivo = (ref: string | null | undefined) => {
    if (!ref?.trim()) return;
    setViewerFileRef(ref);
    setViewerOpen(true);
  };

  useEffect(() => {
    if (!aluno?.respostas_step) {
      setRespostasEstado({});
      return;
    }

    const estadoInicial = aluno.respostas_step.reduce<Record<string, RespostaEstado>>((acc, resposta) => {
      acc[resposta.resposta_id] = {
        validada: Boolean(resposta.validada),
        dataValidade: resposta.data_validacao ? new Date(resposta.data_validacao).toISOString().split("T")[0] : undefined,
      };
      return acc;
    }, {});

    setRespostasEstado(estadoInicial);
  }, [aluno]);

  useEffect(() => {
    const carregarDocumentos = async () => {
      if (!aluno?.inscricao_id) {
        setDocumentos([]);
        setDocumentosEstado({});
        return;
      }

      setCarregandoDocumentos(true);
      try {
        const lista = await documentoService.listarPorInscricao(aluno.inscricao_id);
        setDocumentos(lista);
        const estadoDocs = lista.reduce<Record<string, DocumentoEstado>>((acc, documento) => {
          const parecerAnterior = documento.validacoes?.[0]?.parecer ?? "";
          acc[documento.documento_id] = {
            status: documento.status_documento,
            parecer: parecerAnterior,
          };
          return acc;
        }, {});
        setDocumentosEstado(estadoDocs);
      } catch (error) {
        console.error(error);
        setMessage({ tipo: "erro", texto: (error as Error).message || "Erro ao carregar documentos" });
      } finally {
        setCarregandoDocumentos(false);
      }
    };

    carregarDocumentos();
  }, [aluno?.inscricao_id]);

  const respostasOrdenadas: RespostaStep[] = useMemo(() => {
    return [...(aluno?.respostas_step || [])].sort((a, b) => String(a.pergunta_id).localeCompare(String(b.pergunta_id)));
  }, [aluno?.respostas_step]);

  if (!aluno) return null;

  const handleRespostaStatus = (respostaId: string, validada: boolean) => {
    setRespostasEstado((prev) => ({
      ...prev,
      [respostaId]: {
        ...prev[respostaId],
        validada,
      },
    }));
  };

  const handleRespostaDataValidade = (respostaId: string, dataValidade: string) => {
    setRespostasEstado((prev) => ({
      ...prev,
      [respostaId]: {
        ...prev[respostaId],
        dataValidade: dataValidade || undefined,
      },
    }));
  };

  const aplicarStatusTodasRespostas = (validada: boolean) => {
    if (!aluno?.respostas_step) return;
    const atualizado = aluno.respostas_step.reduce<Record<string, RespostaEstado>>((acc, resposta) => {
      acc[resposta.resposta_id] = {
        validada,
        dataValidade: respostasEstado[resposta.resposta_id]?.dataValidade,
      };
      return acc;
    }, {});
    setRespostasEstado(atualizado);
  };

  const handleDocumentoStatus = (documentoId: string, status: DocumentoStatus) => {
    setDocumentosEstado((prev) => ({
      ...prev,
      [documentoId]: {
        ...prev[documentoId],
        status,
      },
    }));
  };

  const handleDocumentoParecer = (documentoId: string, parecer: string) => {
    setDocumentosEstado((prev) => ({
      ...prev,
      [documentoId]: {
        ...prev[documentoId],
        parecer,
      },
    }));
  };

  const handleSalvar = async () => {
    if (!userInfo?.id) {
      setMessage({ tipo: "erro", texto: "Usuário não autenticado" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const promessas: Promise<unknown>[] = [];

      aluno?.respostas_step?.forEach((resposta) => {
        const estadoAtual = respostasEstado[resposta.resposta_id];
        if (!estadoAtual) return;

        const originalmenteValidada = Boolean(resposta.validada);
        const dataOriginal = resposta.data_validacao ? new Date(resposta.data_validacao).toISOString().split("T")[0] : undefined;

        const mudouValidacao = originalmenteValidada !== estadoAtual.validada;
        const mudouData = (estadoAtual.dataValidade || undefined) !== dataOriginal;

        if (!mudouValidacao && !mudouData) {
          return;
        }

        const respostaId = resposta.resposta_id;
        if (!respostaId) {
          console.warn(`Resposta com ID inválido recebido (${resposta.resposta_id}). Ignorando validação desta resposta.`);
          return;
        }

        promessas.push(
          respostaService.validarResposta(respostaId, {
            validada: estadoAtual.validada,
            dataValidade: estadoAtual.dataValidade,
          }),
        );
      });

      documentos.forEach((documento) => {
        const estado = documentosEstado[documento.documento_id];
        if (!estado) return;

        const statusAlterado = estado.status !== documento.status_documento;
        const possuiParecer = estado.parecer.trim().length > 0;

        if (statusAlterado) {
          promessas.push(documentoService.atualizarStatus(documento.documento_id, estado.status));
        }

        if (possuiParecer) {
          promessas.push(
            validacaoService.criarValidacao({
              parecer: estado.parecer.trim(),
              status: mapDocumentoStatusToValidacaoStatus(estado.status),
              responsavel_id: userInfo.id,
              documento_id: documento.documento_id,
              data_validacao: new Date().toISOString().split("T")[0],
            }),
          );
        }
      });

      await Promise.all(promessas);

      setMessage({ tipo: "sucesso", texto: "Validações atualizadas com sucesso." });

      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage({ tipo: "erro", texto: (error as Error).message || "Erro ao salvar validações" });
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data?: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  };

  return (
    <>
    <div className="modal-overlay resposta-modal" onClick={onClose}>
      <div className="modal-content resposta-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3>Validação de Respostas - {aluno.nome}</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Fechar" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="aluno-info">
            <div>
              <strong>Matrícula:</strong> {aluno.matricula}
            </div>
            <div>
              <strong>Email:</strong> {aluno.email}
            </div>
            <div>
              <strong>Curso:</strong> {aluno.curso} - {aluno.campus}
            </div>
          </div>

          {(!aluno.respostas_step || aluno.respostas_step.length === 0) && documentos.length === 0 ? (
            <div className="empty-respostas">
              <AlertCircle className="w-8 h-8 text-gray-400" />
              <p>Nenhuma resposta ou documento encontrado para este aluno.</p>
            </div>
          ) : (
            <>
              {aluno.respostas_step && aluno.respostas_step.length > 0 && (
                <div className="respostas-validacao-list">
                  <div className="respostas-header">
                    <h4 className="section-title">Respostas do Questionário ({aluno.respostas_step.length})</h4>
                    <div className="acoes-validacao">
                      <button type="button" className="botao-acao" onClick={() => aplicarStatusTodasRespostas(true)} disabled={loading}>
                        <CheckCircle className="w-4 h-4" />
                        Validar todas
                      </button>
                      <button type="button" className="botao-acao secundario" onClick={() => aplicarStatusTodasRespostas(false)} disabled={loading}>
                        <Clock className="w-4 h-4" />
                        Marcar como pendente
                      </button>
                    </div>
                  </div>

                  {respostasOrdenadas.map((resposta, index) => {
                    const estado = respostasEstado[resposta.resposta_id] ?? {
                      validada: Boolean(resposta.validada),
                    };
                    const statusKey: "aprovado" | "reprovado" | "pendente" = estado.validada ? "aprovado" : "pendente";

                    return (
                      <div key={resposta.resposta_id} className="resposta-validacao-card">
                        <div className="resposta-header">
                          <div className="pergunta-info">
                            <span className="pergunta-label">Pergunta {index + 1}</span>
                            <h5 className="pergunta-texto">{resposta.pergunta_texto}</h5>
                            <span className={RESPOSTA_STATUS_INFO[statusKey].className}>
                              {RESPOSTA_STATUS_INFO[statusKey].icon}
                              {RESPOSTA_STATUS_INFO[statusKey].label}
                            </span>
                            {resposta.validada && resposta.data_validacao && (
                              <span className="status-data">Validada em {new Date(resposta.data_validacao).toLocaleDateString("pt-BR")}</span>
                            )}
                          </div>
                        </div>

                        <div className="resposta-conteudo">
                          <div className="resposta-aluno">
                            <strong>Resposta do aluno:</strong>
                            <p>{resposta.resposta_texto || resposta.valor_texto || "-"}</p>
                            <span className="resposta-data">Respondido em: {new Date(resposta.data_resposta).toLocaleString("pt-BR")}</span>
                          </div>

                          {resposta.url_arquivo?.trim() && (
                            <div className="resposta-documento">
                              <Paperclip className="w-4 h-4" />
                              <button type="button" className="documento-link" onClick={() => abrirArquivo(resposta.url_arquivo)}>
                                Ver PDF / documento enviado
                              </button>
                            </div>
                          )}

                          <div className="resposta-validacao-controles">
                            <div className="controle-status">
                              <label htmlFor={`status-resposta-${resposta.resposta_id}`}>Situação</label>
                              <select
                                id={`status-resposta-${resposta.resposta_id}`}
                                value={estado.validada ? "validada" : "pendente"}
                                onChange={(event) => handleRespostaStatus(resposta.resposta_id, event.target.value === "validada")}
                                disabled={loading}
                              >
                                <option value="validada">Validada</option>
                                <option value="pendente">Pendente</option>
                              </select>
                            </div>

                            <div className="controle-data">
                              <label htmlFor={`data-validade-${resposta.resposta_id}`}>Data de validade (opcional)</label>
                              <input
                                id={`data-validade-${resposta.resposta_id}`}
                                type="date"
                                value={estado.dataValidade || ""}
                                onChange={(event) => handleRespostaDataValidade(resposta.resposta_id, event.target.value)}
                                disabled={loading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="documentos-validacao-list">
                <div className="respostas-header">
                  <h4 className="section-title">Documentos anexados ({documentos.length})</h4>
                </div>

                {carregandoDocumentos ? (
                  <div className="empty-respostas">
                    <Clock className="w-6 h-6 text-gray-400" />
                    <p>Carregando documentos...</p>
                  </div>
                ) : documentos.length === 0 ? (
                  <div className="empty-respostas">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <p>Nenhum documento enviado para esta inscrição.</p>
                  </div>
                ) : (
                  documentos.map((documento) => {
                    const estado = documentosEstado[documento.documento_id];
                    return (
                      <div key={documento.documento_id} className="documento-validacao-card">
                        <div className="documento-header">
                          <div className="documento-meta">
                            <FileText className="w-4 h-4" />
                            <span>{documento.tipo_documento}</span>
                          </div>
                          {documento.documento_url?.trim() && (
                            <button type="button" className="documento-link" onClick={() => abrirArquivo(documento.documento_url)}>
                              <Paperclip className="w-4 h-4" />
                              Ver PDF / arquivo
                            </button>
                          )}
                        </div>

                        <div className="documento-controles">
                          <div className="controle-status">
                            <label htmlFor={`status-documento-${documento.documento_id}`}>Status</label>
                            <select
                              id={`status-documento-${documento.documento_id}`}
                              value={estado?.status || documento.status_documento}
                              onChange={(event) => handleDocumentoStatus(documento.documento_id, event.target.value as DocumentoStatus)}
                              disabled={loading}
                            >
                              {DOCUMENT_STATUS_OPTIONS.map((status) => (
                                <option value={status} key={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="controle-parecer">
                            <label htmlFor={`parecer-documento-${documento.documento_id}`}>Parecer</label>
                            <textarea
                              id={`parecer-documento-${documento.documento_id}`}
                              rows={3}
                              value={estado?.parecer ?? ""}
                              onChange={(event) => handleDocumentoParecer(documento.documento_id, event.target.value)}
                              placeholder="Descreva o parecer sobre este documento"
                              disabled={loading}
                            />
                          </div>

                          {documento.validacoes && documento.validacoes.length > 0 && (
                            <div className="historico-validacoes">
                              <span>Últimos pareceres</span>
                              <ul>
                                {documento.validacoes.slice(0, 2).map((validacao, index) => (
                                  <li key={`${documento.documento_id}-${index}`}>
                                    <strong>{validacao.status ?? "parecer"}</strong>
                                    <span>{validacao.parecer}</span>
                                    <small>{formatarData(validacao.data_validacao)}</small>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {message && (
                <div className={`message-box ${message.tipo === "sucesso" ? "message-success" : "message-error"}`}>
                  {message.tipo === "sucesso" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{message.texto}</span>
                </div>
              )}

              <div className="validacao-footer">
                <button className="btn-cancel" onClick={onClose} disabled={loading}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleSalvar} disabled={loading}>
                  <CheckCircle2 className="w-4 h-4" />
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    <DocumentViewerModal
      open={viewerOpen}
      fileRef={viewerFileRef}
      onClose={() => {
        setViewerOpen(false);
        setViewerFileRef(null);
      }}
    />
    </>
  );
}
