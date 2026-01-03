import { useState, useEffect } from "react";
import { FileText, Search, Filter, Calendar, User, Mail, BookOpen, MapPin } from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { Edital } from "@/types/edital";
import { inscricaoServiceManager } from "@/services/InscricaoService/inscricaoService";
import { stepService } from "@/services/StepService/stepService";
import { AlunoInscrito } from "@/types/inscricao";
import "./InscricoesProae.css";

export default function InscricoesProae() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState<Edital | null>(null);
  const [inscricoes, setInscricoes] = useState<AlunoInscrito[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEditais, setIsLoadingEditais] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  useEffect(() => {
    carregarEditais();
  }, []);

  useEffect(() => {
    if (editalSelecionado?.id) {
      carregarInscricoes();
    }
  }, [editalSelecionado]);

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
      // Buscar inscrições do primeiro step/questionário do edital
      // Em uma implementação real, você pode querer listar todas as inscrições do edital
      const steps = await stepService.listarStepsPorEdital(editalSelecionado.id.toString());
      if (steps && steps.length > 0) {
        const dados = await inscricaoServiceManager.listarAlunosPorQuestionario(
          editalSelecionado.id,
          steps[0].id
        );
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

    const matchStatus =
      filtroStatus === "todos" ||
      inscricao.status_inscricao?.toUpperCase() === filtroStatus.toUpperCase();

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
                  <select
                    className="status-filter"
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
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
                      </tr>
                    </thead>
                    <tbody>
                      {inscricoesFiltradas.map((inscricao, index) => (
                        <tr key={inscricao.inscricao_id || index}>
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
                              <span>
                                {inscricao.data_inscricao
                                  ? new Date(inscricao.data_inscricao).toLocaleDateString("pt-BR")
                                  : "N/A"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className={getStatusBadgeClass(inscricao.status_inscricao || "PENDENTE")}>
                              {getStatusLabel(inscricao.status_inscricao || "PENDENTE")}
                            </div>
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
    </div>
  );
}
