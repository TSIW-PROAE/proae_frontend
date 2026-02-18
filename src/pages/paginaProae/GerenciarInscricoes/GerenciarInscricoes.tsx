import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Mail,
  BookOpen,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ClipboardList,
  Download,
  Search,
  Filter,
  Users,
  CheckSquare,
  XSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@heroui/button";
import { toast, Toaster } from "react-hot-toast";
import { AlunoInscrito } from "../../../types/inscricao";
import { Edital } from "../../../types/edital";
import { StepResponseDto } from "../../../types/step";
import { inscricaoServiceManager } from "../../../services/InscricaoService/inscricaoService";
import { editalService } from "../../../services/EditalService/editalService";
import { stepService } from "../../../services/StepService/stepService";
import ModalSelecionarEdital from "../../../components/ModalSelecionarEdital/ModalSelecionarEdital";
import ModalSelecionarQuestionario from "../../../components/ModalSelecionarQuestionario/ModalSelecionarQuestionario";
import ModalRespostaAluno from "../../../components/ModalRespostaAluno/ModalRespostaAluno";
import "./GerenciarInscricoes.css";

type StatusFilter = "TODOS" | "PENDENTE" | "APROVADA" | "REPROVADA" | "EM_ANALISE";

export default function GerenciarInscricoes() {
  const [inscricoes, setInscricoes] = useState<AlunoInscrito[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [questionarios, setQuestionarios] = useState<StepResponseDto[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState<Edital | null>(null);
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState<StepResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEditais, setIsLoadingEditais] = useState(true);
  const [isLoadingQuestionarios, setIsLoadingQuestionarios] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModalEditais, setShowModalEditais] = useState(false);
  const [showModalQuestionarios, setShowModalQuestionarios] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<AlunoInscrito | null>(null);
  const [showModalRespostas, setShowModalRespostas] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  
  // Filtros
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusFilter>("TODOS");

  // Carregar edital e questionário salvos no sessionStorage ao montar
  useEffect(() => {
    const editalSalvo = sessionStorage.getItem("editalSelecionadoInscricoes");
    const questionarioSalvo = sessionStorage.getItem("questionarioSelecionadoInscricoes");

    if (editalSalvo) {
      const edital = JSON.parse(editalSalvo);
      setEditalSelecionado(edital);
      if (edital.id) {
        carregarQuestionarios(edital.id);
      }
    }

    if (questionarioSalvo && editalSalvo) {
      const questionario = JSON.parse(questionarioSalvo);
      const edital = JSON.parse(editalSalvo);
      setQuestionarioSelecionado(questionario);
      if (edital.id && questionario.id) {
        carregarInscricoes(edital.id, questionario.id);
      }
    }

    carregarEditais();
  }, []);

  const carregarEditais = async () => {
    try {
      setIsLoadingEditais(true);
      const dados = await editalService.listarEditais();
      setEditais(dados);
    } catch (err: any) {
      console.error("Erro ao carregar editais:", err);
      setError(err.message || "Erro ao carregar editais");
    } finally {
      setIsLoadingEditais(false);
    }
  };

  const carregarQuestionarios = async (editalId: string) => {
    try {
      setIsLoadingQuestionarios(true);
      setError(null);
      const dados = await stepService.listarStepsPorEdital(editalId);
      setQuestionarios(dados);
    } catch (err: any) {
      console.error("Erro ao carregar questionários:", err);
      setError(err.message || "Erro ao carregar questionários");
    } finally {
      setIsLoadingQuestionarios(false);
    }
  };

  const carregarInscricoes = async (editalId: string, stepId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const dados = await inscricaoServiceManager.listarAlunosPorQuestionario(editalId, stepId);
      setInscricoes(dados);
    } catch (err: any) {
      console.error("Erro ao carregar inscrições:", err);
      setError(err.message || "Erro ao carregar inscrições");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelecionarEdital = (edital: Edital) => {
    setEditalSelecionado(edital);
    setQuestionarioSelecionado(null);
    setInscricoes([]);
    sessionStorage.setItem("editalSelecionadoInscricoes", JSON.stringify(edital));
    sessionStorage.removeItem("questionarioSelecionadoInscricoes");
    setShowModalEditais(false);
    if (edital.id) {
      carregarQuestionarios(edital.id);
      setShowModalQuestionarios(true);
    }
  };

  const handleSelecionarQuestionario = (questionario: StepResponseDto) => {
    setQuestionarioSelecionado(questionario);
    sessionStorage.setItem("questionarioSelecionadoInscricoes", JSON.stringify(questionario));
    setShowModalQuestionarios(false);
    if (editalSelecionado?.id && questionario.id) {
      carregarInscricoes(editalSelecionado.id, questionario.id);
    }
  };

  const getStatusIcon = (status: AlunoInscrito["status_inscricao"]) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "APROVADA":
      case "APROVADO":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "REPROVADA":
      case "REPROVADO":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "EM_ANALISE":
      case "EM ANÁLISE":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeClass = (status: AlunoInscrito["status_inscricao"]) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "APROVADA":
      case "APROVADO":
        return "status-badge status-aprovada";
      case "REPROVADA":
      case "REPROVADO":
        return "status-badge status-reprovada";
      case "EM_ANALISE":
      case "EM ANÁLISE":
        return "status-badge status-analise";
      default:
        return "status-badge status-pendente";
    }
  };

  const getStatusLabel = (status: AlunoInscrito["status_inscricao"]) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "APROVADA":
      case "APROVADO":
        return "Aprovada";
      case "REPROVADA":
      case "REPROVADO":
        return "Reprovada";
      case "EM_ANALISE":
      case "EM ANÁLISE":
        return "Em Análise";
      default:
        return "Pendente";
    }
  };

  // Filtragem das inscrições
  const inscricoesFiltradas = useMemo(() => {
    return inscricoes.filter((inscricao) => {
      // Filtro de busca
      const matchBusca =
        termoBusca === "" ||
        inscricao.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        inscricao.email?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        inscricao.matricula?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        inscricao.curso?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        inscricao.campus?.toLowerCase().includes(termoBusca.toLowerCase());

      // Filtro de status
      const normalizedStatus = inscricao.status_inscricao?.toUpperCase().replace(" ", "_") || "PENDENTE";
      const matchStatus =
        filtroStatus === "TODOS" ||
        normalizedStatus === filtroStatus ||
        (filtroStatus === "APROVADA" && (normalizedStatus === "APROVADA" || normalizedStatus === "APROVADO")) ||
        (filtroStatus === "REPROVADA" && (normalizedStatus === "REPROVADA" || normalizedStatus === "REPROVADO")) ||
        (filtroStatus === "EM_ANALISE" && (normalizedStatus === "EM_ANALISE" || normalizedStatus === "EM ANÁLISE"));

      return matchBusca && matchStatus;
    });
  }, [inscricoes, termoBusca, filtroStatus]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const stats = {
      total: inscricoes.length,
      aprovadas: 0,
      reprovadas: 0,
      pendentes: 0,
      emAnalise: 0,
    };

    inscricoes.forEach((inscricao) => {
      const normalizedStatus = inscricao.status_inscricao?.toUpperCase().replace(" ", "_") || "PENDENTE";
      if (normalizedStatus === "APROVADA" || normalizedStatus === "APROVADO") {
        stats.aprovadas++;
      } else if (normalizedStatus === "REPROVADA" || normalizedStatus === "REPROVADO") {
        stats.reprovadas++;
      } else if (normalizedStatus === "EM_ANALISE" || normalizedStatus === "EM ANÁLISE") {
        stats.emAnalise++;
      } else {
        stats.pendentes++;
      }
    });

    return stats;
  }, [inscricoes]);

  // Download PDF dos aprovados
  const handleDownloadPdf = async () => {
    if (!editalSelecionado?.id) {
      toast.error("Selecione um edital para baixar o PDF dos aprovados");
      return;
    }

    try {
      setIsDownloadingPdf(true);
      await inscricaoServiceManager.downloadPdfAprovados(editalSelecionado.id);
      toast.success("PDF dos aprovados baixado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao baixar PDF:", err);
      toast.error(err.message || "Erro ao baixar PDF dos aprovados");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Limpar filtros
  const limparFiltros = () => {
    setTermoBusca("");
    setFiltroStatus("TODOS");
  };

  if (isLoadingEditais) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="inscricoes-container">
          <div className="lista-inscricoes-loading">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
      <div className="inscricoes-container">
        {/* Header Principal */}
        <header className="inscricoes-page-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-container">
                <div className="avatar">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">Gerenciamento de Inscrições</h1>
                <p className="welcome-subtitle">
                  {editalSelecionado
                    ? `Gerenciando inscrições do edital: ${editalSelecionado.titulo_edital}`
                    : "Selecione um edital para gerenciar as inscrições"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="btn-close-error" title="Fechar mensagem de erro">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conteúdo Principal */}
        <main className="main-content">
          {!editalSelecionado ? (
            <section className="inscricoes-section">
              <div className="lista-inscricoes-container">
                <div className="empty-inscricoes">
                  <div className="empty-icon">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="empty-title">Selecione um Edital</h3>
                  <p className="empty-description">
                    Para gerenciar as inscrições, primeiro você precisa selecionar um edital. Clique no botão abaixo para ver a lista de editais
                    disponíveis.
                  </p>
                  <button onClick={() => setShowModalEditais(true)} className="btn-selecionar-edital">
                    <FileText className="w-5 h-5" />
                    Selecionar Edital
                  </button>
                </div>
              </div>
            </section>
          ) : !questionarioSelecionado ? (
            <section className="inscricoes-section">
              {/* Botão para trocar edital */}
              <div className="edital-selector">
                <button onClick={() => setShowModalEditais(true)} className="btn-trocar-edital">
                  <FileText className="w-4 h-4" />
                  <span>{editalSelecionado.titulo_edital}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="lista-inscricoes-container">
                {isLoadingQuestionarios ? (
                  <div className="lista-inscricoes-loading">
                    <div className="loading-spinner"></div>
                    <p>Carregando questionários...</p>
                  </div>
                ) : (
                  <div className="empty-inscricoes">
                    <div className="empty-icon">
                      <ClipboardList className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="empty-title">Selecione um Questionário</h3>
                    <p className="empty-description">Agora selecione um questionário deste edital para visualizar os alunos que responderam.</p>
                    <button onClick={() => setShowModalQuestionarios(true)} className="btn-selecionar-edital">
                      <ClipboardList className="w-5 h-5" />
                      Selecionar Questionário
                    </button>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="inscricoes-section">
              {/* Botões para trocar edital e questionário */}
              <div className="edital-selector">
                <button onClick={() => setShowModalEditais(true)} className="btn-trocar-edital">
                  <FileText className="w-4 h-4" />
                  <span>{editalSelecionado.titulo_edital}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => setShowModalQuestionarios(true)} className="btn-trocar-edital">
                  <ClipboardList className="w-4 h-4" />
                  <span>{questionarioSelecionado.texto || questionarioSelecionado.titulo || "Questionário"}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div style={{ marginLeft: "auto" }}>
                  <Button
                    color="primary"
                    variant="solid"
                    startContent={isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    onPress={handleDownloadPdf}
                    isLoading={isDownloadingPdf}
                    isDisabled={estatisticas.aprovadas === 0}
                  >
                    Baixar PDF Aprovados ({estatisticas.aprovadas})
                  </Button>
                </div>
              </div>

              {/* Estatísticas resumidas */}
              {inscricoes.length > 0 && (
                <div className="estatisticas-container">
                  <div className="estatistica-card estatistica-total">
                    <Users className="w-5 h-5" />
                    <div className="estatistica-info">
                      <span className="estatistica-valor">{estatisticas.total}</span>
                      <span className="estatistica-label">Total</span>
                    </div>
                  </div>
                  <div className="estatistica-card estatistica-aprovadas">
                    <CheckSquare className="w-5 h-5" />
                    <div className="estatistica-info">
                      <span className="estatistica-valor">{estatisticas.aprovadas}</span>
                      <span className="estatistica-label">Aprovadas</span>
                    </div>
                  </div>
                  <div className="estatistica-card estatistica-reprovadas">
                    <XSquare className="w-5 h-5" />
                    <div className="estatistica-info">
                      <span className="estatistica-valor">{estatisticas.reprovadas}</span>
                      <span className="estatistica-label">Reprovadas</span>
                    </div>
                  </div>
                  <div className="estatistica-card estatistica-analise">
                    <Clock className="w-5 h-5" />
                    <div className="estatistica-info">
                      <span className="estatistica-valor">{estatisticas.emAnalise}</span>
                      <span className="estatistica-label">Em Análise</span>
                    </div>
                  </div>
                  <div className="estatistica-card estatistica-pendentes">
                    <AlertCircle className="w-5 h-5" />
                    <div className="estatistica-info">
                      <span className="estatistica-valor">{estatisticas.pendentes}</span>
                      <span className="estatistica-label">Pendentes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtros */}
              {inscricoes.length > 0 && (
                <div className="filtros-container">
                  <div className="filtro-busca">
                    <Search className="w-4 h-4 filtro-icon" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, email, matrícula, curso ou campus..."
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      className="filtro-input"
                    />
                  </div>
                  <div className="filtro-status">
                    <Filter className="w-4 h-4 filtro-icon" />
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value as StatusFilter)}
                      className="filtro-select"
                    >
                      <option value="TODOS">Todos os status</option>
                      <option value="PENDENTE">Pendente</option>
                      <option value="EM_ANALISE">Em Análise</option>
                      <option value="APROVADA">Aprovada</option>
                      <option value="REPROVADA">Reprovada</option>
                    </select>
                  </div>
                  {(termoBusca || filtroStatus !== "TODOS") && (
                    <button onClick={limparFiltros} className="btn-limpar-filtros">
                      <XCircle className="w-4 h-4" />
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}

              <div className="lista-inscricoes-container">
                {isLoading ? (
                  <div className="lista-inscricoes-loading">
                    <div className="loading-spinner"></div>
                    <p>Carregando inscrições...</p>
                  </div>
                ) : !inscricoes || inscricoes.length === 0 ? (
                  <div className="empty-inscricoes">
                    <div className="empty-icon">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="empty-title">Nenhuma inscrição encontrada</h3>
                    <p className="empty-description">Não há inscrições para este edital no momento.</p>
                  </div>
                ) : inscricoesFiltradas.length === 0 ? (
                  <div className="empty-inscricoes">
                    <div className="empty-icon">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="empty-title">Nenhum resultado encontrado</h3>
                    <p className="empty-description">
                      Nenhuma inscrição corresponde aos filtros aplicados.
                    </p>
                    <button onClick={limparFiltros} className="btn-selecionar-edital" style={{ marginTop: "1rem" }}>
                      <XCircle className="w-5 h-5" />
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="inscricoes-content">
                      {/* Cabeçalho fixo da tabela */}
                      <div className="table-header-fixed">
                        <table className="inscricoes-table-header">
                          <thead>
                            <tr>
                              <th className="table-header-cell">Matrícula</th>
                              <th className="table-header-cell">Nome/Email</th>
                              <th className="table-header-cell">Curso</th>
                              <th className="table-header-cell">Campus</th>
                              <th className="table-header-cell">Data Inscrição</th>
                              <th className="table-header-cell">Status</th>
                            </tr>
                          </thead>
                        </table>
                      </div>

                      {/* Container scrollável com os dados */}
                      <div className="table-container">
                        <table className="inscricoes-table">
                          <tbody className="table-body">
                            {inscricoesFiltradas.map((aluno, index) => (
                              <tr
                                key={aluno.inscricao_id || aluno.aluno_id || index}
                                className="table-row"
                                onClick={() => {
                                  setSelectedAluno(aluno);
                                  setShowModalRespostas(true);
                                }}
                                tabIndex={0}
                              >
                                <td className="table-cell matricula-cell">
                                  <span className="matricula-badge">{aluno.matricula || "N/A"}</span>
                                </td>
                                <td className="table-cell email-cell">
                                  <div className="email-content">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <div className="email-info">
                                      <span className="email-nome">{aluno.nome || "N/A"}</span>
                                      <span className="email-text">{aluno.email || ""}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="table-cell curso-cell">
                                  <div className="curso-content">
                                    <BookOpen className="w-3 h-3 text-blue-400" />
                                    <span>{aluno.curso || "N/A"}</span>
                                  </div>
                                </td>
                                <td className="table-cell campus-cell">
                                  <div className="campus-content">
                                    <MapPin className="w-3 h-3 text-green-400" />
                                    <span>{aluno.campus || "N/A"}</span>
                                  </div>
                                </td>
                                <td className="table-cell data-cell">
                                  <div className="data-content">
                                    <Calendar className="w-3 h-3 text-orange-400" />
                                    <span>{aluno.data_inscricao ? new Date(aluno.data_inscricao).toLocaleDateString("pt-BR") : "N/A"}</span>
                                  </div>
                                </td>
                                <td className="table-cell status-cell">
                                  <div className={getStatusBadgeClass(aluno.status_inscricao || "PENDENTE")}>
                                    {getStatusIcon(aluno.status_inscricao || "PENDENTE")}
                                    <span>{getStatusLabel(aluno.status_inscricao || "PENDENTE")}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="inscricoes-footer">
                      <div className="footer-info">
                        <span className="total-count">
                          {inscricoesFiltradas.length === inscricoes.length
                            ? `${inscricoes.length} inscrição${inscricoes.length !== 1 ? "ões" : ""} total`
                            : `${inscricoesFiltradas.length} de ${inscricoes.length} inscrição${inscricoes.length !== 1 ? "ões" : ""}`}
                        </span>
                        <span className="last-updated">Atualizado agora</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modal de Seleção de Editais */}
      {showModalEditais && (
        <ModalSelecionarEdital
          editais={editais}
          onSelect={handleSelecionarEdital}
          onClose={() => setShowModalEditais(false)}
          editalAtual={editalSelecionado}
        />
      )}

      {/* Modal de Seleção de Questionários */}
      {showModalQuestionarios && editalSelecionado && (
        <ModalSelecionarQuestionario
          questionarios={questionarios}
          onSelect={handleSelecionarQuestionario}
          onClose={() => setShowModalQuestionarios(false)}
          questionarioAtual={questionarioSelecionado}
        />
      )}

      {/* Modal de Respostas por Aluno */}
      {showModalRespostas && selectedAluno && (
        <ModalRespostaAluno
          aluno={selectedAluno}
          onClose={() => {
            setShowModalRespostas(false);
            setSelectedAluno(null);
          }}
          onSaved={() => {
            // Recarregar inscrições após salvar validação
            if (editalSelecionado?.id && questionarioSelecionado?.id) {
              carregarInscricoes(editalSelecionado.id, questionarioSelecionado.id);
            }
          }}
        />
      )}
    </div>
  );
}
