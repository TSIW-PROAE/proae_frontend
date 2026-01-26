import { useState, useEffect } from "react";
import { FileText, Search, Filter, Calendar, User, Mail, BookOpen, MapPin, ChevronRight } from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { Edital } from "@/types/edital";
import { inscricaoServiceManager } from "@/services/InscricaoService/inscricaoService";
import { stepService } from "@/services/StepService/stepService";
import { AlunoInscrito } from "@/types/inscricao";
import { StepResponseDto } from "@/types/step";
import "./InscricoesProae.css";

interface PerguntaPayload {
  id: number;
  pergunta: string;
  tipo_Pergunta: string;
  obrigatoriedade: boolean;
  opcoes?: string[] | null;
  tipo_formatacao?: string | null;
  placeholder?: string | null;
}

interface RespostaPayload {
  id: number;
  texto: string | null;
  valorTexto: string | null;
  valorOpcoes: string[] | null;
  urlArquivo: string | null;
  dataResposta: string | null;
}

interface PerguntaComResposta {
  pergunta: PerguntaPayload;
  resposta: RespostaPayload | null;
}

interface StepRespostas {
  edital: {
    id: number;
    titulo?: string;
    titulo_edital?: string;
    descricao?: string;
    status?: string;
  };
  step: {
    id: number;
    texto: string;
  };
  aluno: {
    aluno_id: number;
    nome: string;
    email: string;
    matricula: string;
  };
  perguntas: PerguntaComResposta[];
}

export default function InscricoesProae() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState<Edital | null>(null);
  const [inscricoes, setInscricoes] = useState<AlunoInscrito[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEditais, setIsLoadingEditais] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inscricaoSelecionada, setInscricaoSelecionada] = useState<AlunoInscrito | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<"questionarios" | "informacoes">("questionarios");
  const [questionarios, setQuestionarios] = useState<StepResponseDto[]>([]);
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState<number | null>(null);
  const [isLoadingQuestionarios, setIsLoadingQuestionarios] = useState(false);
  const [stepRespostas, setStepRespostas] = useState<StepRespostas | null>(null);
  const [isLoadingRespostas, setIsLoadingRespostas] = useState(false);

  useEffect(() => {
    carregarEditais();
  }, []);

  useEffect(() => {
    if (editalSelecionado?.id) {
      carregarInscricoes();
    }
  }, [editalSelecionado]);

  useEffect(() => {
    if (questionarioSelecionado && inscricaoSelecionada?.aluno_id && editalSelecionado?.id) {
      carregarRespostas();
    } else {
      setStepRespostas(null);
    }
  }, [questionarioSelecionado, inscricaoSelecionada, editalSelecionado]);

  const carregarEditais = async () => {
    try {
      setIsLoadingEditais(true);
      const dados = await editalService.listarEditais();
      setEditais(dados);
    } catch (err: any) {
      console.error("Erro ao carregar editais:", err);
    } finally {
      setIsLoadingEditais(false);
    }
  };

  const carregarInscricoes = async () => {
    if (!editalSelecionado?.id) return;

    try {
      setIsLoading(true);
      const steps = await stepService.listarStepsPorEdital(editalSelecionado.id.toString());
      if (steps && steps.length > 0) {
        const dados = await inscricaoServiceManager.listarAlunosPorQuestionario(editalSelecionado.id, steps[0].id);
        setInscricoes(dados);
      } else {
        setInscricoes([]);
      }
    } catch (err: any) {
      console.error("Erro ao carregar inscrições:", err);
      setInscricoes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const inscricoesFiltradas = inscricoes.filter((inscricao) => {
    const matchTermo =
      !termoBusca ||
      inscricao.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      inscricao.email?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      inscricao.matricula?.toLowerCase().includes(termoBusca.toLowerCase());

    const matchStatus = filtroStatus === "todos" || inscricao.status_inscricao?.toUpperCase() === filtroStatus.toUpperCase();

    return matchTermo && matchStatus;
  });

  const getStatusBadgeClass = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const handleVerDetalhes = async (inscricao: AlunoInscrito) => {
    setInscricaoSelecionada(inscricao);
    setIsModalOpen(true);
    await carregarQuestionarios();
  };

  const carregarQuestionarios = async () => {
    if (!editalSelecionado?.id) return;

    try {
      setIsLoadingQuestionarios(true);
      const dados = await stepService.listarStepsPorEdital(editalSelecionado.id.toString());
      setQuestionarios(dados);
      if (dados.length > 0) {
        setQuestionarioSelecionado(dados[0].id);
      }
    } catch (err: any) {
      console.error("Erro ao carregar questionários:", err);
      setQuestionarios([]);
    } finally {
      setIsLoadingQuestionarios(false);
    }
  };

  const carregarRespostas = async () => {
    if (!inscricaoSelecionada?.aluno_id || !editalSelecionado?.id || !questionarioSelecionado) return;

    try {
      setIsLoadingRespostas(true);
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/aluno/${inscricaoSelecionada.aluno_id}/edital/${editalSelecionado.id}/step/${questionarioSelecionado}/perguntas-com-respostas`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          setStepRespostas(null);
          return;
        }
        throw new Error(`Erro ao carregar respostas: ${response.statusText}`);
      }

      const payload = await response.json();
      const dados = (payload?.dados || payload) as StepRespostas | null;

      if (payload?.sucesso === false || !dados) {
        setStepRespostas(null);
        return;
      }

      setStepRespostas(dados);
    } catch (err: any) {
      console.error("Erro ao carregar respostas:", err);
      setStepRespostas(null);
    } finally {
      setIsLoadingRespostas(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInscricaoSelecionada(null);
    setAbaAtiva("questionarios");
    setQuestionarios([]);
    setQuestionarioSelecionado(null);
    setStepRespostas(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="inscricoes-proae-container">
        <header className="inscricoes-proae-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-container">
                <div className="avatar">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">Visualização de Inscrições</h1>
                <p className="welcome-subtitle">
                  {editalSelecionado
                    ? `Visualizando inscrições do edital: ${editalSelecionado.titulo_edital}`
                    : "Selecione um edital para visualizar as inscrições"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {/* Seletor de Edital */}
          <section className="edital-selector-section">
            <div className="selector-card">
              <label className="selector-label">Selecione um Edital</label>
              <select
                className="edital-select"
                value={editalSelecionado?.id || ""}
                onChange={(e) => {
                  const edital = editais.find((ed) => ed.id === Number(e.target.value));
                  setEditalSelecionado(edital || null);
                }}
                disabled={isLoadingEditais}
              >
                <option value="">Selecione um edital...</option>
                {editais.map((edital) => (
                  <option key={edital.id} value={edital.id}>
                    {edital.titulo_edital}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Filtros */}
          {editalSelecionado && (
            <section className="filters-section">
              <div className="filters-card">
                <div className="search-container">
                  <Search className="w-4 h-4 search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou matrícula..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filter-container">
                  <Filter className="w-4 h-4 filter-icon" />
                  <select className="status-filter" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                    <option value="todos">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="reprovada">Reprovada</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Lista de Inscrições */}
          {editalSelecionado && (
            <section className="inscricoes-list-section">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Carregando inscrições...</p>
                </div>
              ) : inscricoesFiltradas.length === 0 ? (
                <div className="empty-state">
                  <FileText className="w-12 h-12 text-gray-400" />
                  <h3>Nenhuma inscrição encontrada</h3>
                  <p>
                    {termoBusca || filtroStatus !== "todos"
                      ? "Nenhuma inscrição corresponde aos filtros aplicados."
                      : "Não há inscrições para este edital no momento."}
                  </p>
                </div>
              ) : (
                <div className="inscricoes-table-container">
                  <table className="inscricoes-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Matrícula</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Curso</th>
                        <th>Campus</th>
                        <th>Data Inscrição</th>
                        <th>Status</th>
                        <th style={{ width: "20px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscricoesFiltradas.map((inscricao, index) => (
                        <tr
                          key={inscricao.inscricao_id || index}
                          onClick={() => handleVerDetalhes(inscricao)}
                          style={{ cursor: "pointer" }}
                          className="table-row-clickable"
                        >
                          <td>{inscricao.aluno_id || "N/A"}</td>
                          <td>
                            <span className="matricula-badge">{inscricao.matricula || "N/A"}</span>
                          </td>
                          <td>
                            <div className="nome-cell">
                              <User className="w-4 h-4" />
                              <span>{inscricao.nome || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="email-cell">
                              <Mail className="w-4 h-4" />
                              <span>{inscricao.email || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="curso-cell">
                              <BookOpen className="w-4 h-4" />
                              <span>{inscricao.curso || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="campus-cell">
                              <MapPin className="w-4 h-4" />
                              <span>{inscricao.campus || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="data-cell">
                              <Calendar className="w-4 h-4" />
                              <span>{inscricao.data_inscricao ? new Date(inscricao.data_inscricao).toLocaleDateString("pt-BR") : "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className={getStatusBadgeClass(inscricao.status_inscricao || "PENDENTE")}>
                              {getStatusLabel(inscricao.status_inscricao || "PENDENTE")}
                            </div>
                          </td>
                          <td>
                            <ChevronRight className="w-5 h-5" style={{ color: "#64748b" }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    <span>
                      {inscricoesFiltradas.length} de {inscricoes.length} inscrição
                      {inscricoes.length !== 1 ? "ões" : ""}
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "1200px",
              height: "85vh",
              position: "relative",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#64748b",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ✕
            </button>

            {/* Conteúdo do Modal */}
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#1e293b" }}>Detalhes da Inscrição</h2>

              {/* Abas */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0" }}>
                <button
                  onClick={() => setAbaAtiva("questionarios")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: abaAtiva === "questionarios" ? "3px solid #3b82f6" : "3px solid transparent",
                    color: abaAtiva === "questionarios" ? "#3b82f6" : "#64748b",
                    fontWeight: abaAtiva === "questionarios" ? "600" : "400",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.2s",
                  }}
                >
                  Questionários
                </button>
                <button
                  onClick={() => setAbaAtiva("informacoes")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: abaAtiva === "informacoes" ? "3px solid #3b82f6" : "3px solid transparent",
                    color: abaAtiva === "informacoes" ? "#3b82f6" : "#64748b",
                    fontWeight: abaAtiva === "informacoes" ? "600" : "400",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.2s",
                  }}
                >
                  Informações Gerais
                </button>
              </div>

              {/* Conteúdo das Abas */}
              <div style={{ flex: 1, overflow: "auto", paddingRight: "8px" }}>
                {abaAtiva === "questionarios" ? (
                  <div>
                    {/* Grid de Questionários */}
                    {isLoadingQuestionarios ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        <div className="loading-spinner" style={{ margin: "0 auto 16px" }}></div>
                        <p>Carregando questionários...</p>
                      </div>
                    ) : questionarios.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        <FileText style={{ width: "48px", height: "48px", margin: "0 auto 16px", opacity: 0.5 }} />
                        <p>Nenhum questionário disponível.</p>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}
                        >
                          {questionarios.map((questionario, index) => (
                            <div
                              key={questionario.id}
                              onClick={() => setQuestionarioSelecionado(questionario.id)}
                              style={{
                                backgroundColor: "white",
                                border: questionarioSelecionado === questionario.id ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "16px",
                                cursor: "pointer",
                                boxShadow:
                                  questionarioSelecionado === questionario.id ? "0 4px 6px rgba(59, 130, 246, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                if (questionarioSelecionado !== questionario.id) {
                                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (questionarioSelecionado !== questionario.id) {
                                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                                }
                              }}
                            >
                              {/* Chip de Status */}
                              <div style={{ marginBottom: "12px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: index % 2 === 0 ? "#fef3c7" : "#dbeafe",
                                    color: index % 2 === 0 ? "#92400e" : "#1e40af",
                                  }}
                                >
                                  {index % 2 === 0 ? "Em Análise" : "Concluído"}
                                </span>
                              </div>

                              {/* Título do Questionário */}
                              <h4
                                style={{
                                  margin: "0 0 8px 0",
                                  color: "#1e293b",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  lineHeight: "1.4",
                                }}
                              >
                                {questionario.texto || `Questionário ${questionario.id}`}
                              </h4>

                              {/* Info */}
                              <div style={{ fontSize: "12px", color: "#64748b" }}>
                                {questionario.perguntas?.length || 0} pergunta{questionario.perguntas?.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Lista de Perguntas do Questionário Selecionado */}
                        {questionarioSelecionado && (
                          <div style={{ marginBottom: "32px" }}>
                            <h3 style={{ marginBottom: "16px", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>Perguntas</h3>

                            {isLoadingRespostas ? (
                              <div style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                                <div className="loading-spinner" style={{ margin: "0 auto 12px" }}></div>
                                <p>Carregando respostas...</p>
                              </div>
                            ) : stepRespostas?.perguntas?.length ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {stepRespostas.perguntas.map((item) => {
                                  const perguntaInfo = item.pergunta;
                                  const respostaInfo = item.resposta;
                                  const tipo = perguntaInfo?.tipo_Pergunta || "N/D";
                                  const obrigatoria = perguntaInfo?.obrigatoriedade ? "Sim" : "Não";
                                  const valorOpcoes = respostaInfo?.valorOpcoes?.length ? respostaInfo.valorOpcoes.join(", ") : null;
                                  const valorTexto =
                                    (respostaInfo?.valorTexto && respostaInfo.valorTexto.trim().length > 0 ? respostaInfo.valorTexto : null) ||
                                    (respostaInfo?.texto && respostaInfo.texto.trim().length > 0 ? respostaInfo.texto : null);
                                  const respostaConteudo = valorOpcoes || valorTexto;

                                  return (
                                    <div
                                      key={perguntaInfo?.id || `${perguntaInfo?.pergunta}-${perguntaInfo?.tipo_Pergunta}`}
                                      style={{
                                        backgroundColor: "white",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        padding: "16px",
                                      }}
                                    >
                                      <h4
                                        style={{
                                          margin: "0 0 8px 0",
                                          color: "#1e293b",
                                          fontSize: "15px",
                                          fontWeight: "600",
                                          lineHeight: "1.5",
                                        }}
                                      >
                                        {perguntaInfo?.pergunta || "Pergunta"}
                                      </h4>

                                      {/* Informações Adicionais */}
                                      <div style={{ fontSize: "13px", color: "#64748b", display: "flex", gap: "16px", marginBottom: "12px" }}>
                                        <span>Tipo: {tipo}</span>
                                        <span>•</span>
                                        <span>Obrigatória: {obrigatoria}</span>
                                      </div>

                                      {/* Resposta */}
                                      {respostaConteudo ? (
                                        <div
                                          style={{
                                            padding: "12px",
                                            backgroundColor: "#f0fdf4",
                                            border: "1px solid #bbf7d0",
                                            borderRadius: "6px",
                                            marginTop: "8px",
                                          }}
                                        >
                                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#166534", marginBottom: "4px" }}>Resposta:</div>
                                          <div style={{ fontSize: "14px", color: "#15803d" }}>{respostaConteudo}</div>
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            padding: "12px",
                                            backgroundColor: "#fef2f2",
                                            border: "1px solid #fecaca",
                                            borderRadius: "6px",
                                            marginTop: "8px",
                                          }}
                                        >
                                          <div style={{ fontSize: "13px", color: "#991b1b", fontStyle: "italic" }}>Usuário não respondeu</div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                <FileText style={{ width: "48px", height: "48px", margin: "0 auto 16px", opacity: 0.5 }} />
                                <p>Nenhuma pergunta encontrada neste questionário.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    <FileText style={{ width: "64px", height: "64px", margin: "0 auto 16px", opacity: 0.3 }} />
                    <h3 style={{ color: "#64748b", marginBottom: "8px" }}>Informações Gerais</h3>
                    <p>Seção em desenvolvimento. Informações adicionais serão exibidas aqui.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
