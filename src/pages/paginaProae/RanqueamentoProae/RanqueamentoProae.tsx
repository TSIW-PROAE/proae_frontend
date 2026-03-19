import { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  TrendingUp,
  FileText,
  Search,
  Download,
  BarChart3,
  User,
  Mail,
  Hash,
} from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { stepService } from "@/services/StepService/stepService";
import { Edital } from "@/types/edital";
import {
  calculoNotasService,
  NotaCalculada,
} from "@/services/CalculoNotasService/calculoNotas.service";
import "./RanqueamentoProae.css";

export default function RanqueamentoProae() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState<Edital | null>(null);
  const [notas, setNotas] = useState<NotaCalculada[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEditais, setIsLoadingEditais] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    carregarEditais();
  }, []);

  useEffect(() => {
    if (editalSelecionado?.id) {
      calcularNotas();
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

  const calcularNotas = async () => {
    if (!editalSelecionado?.id) return;

    try {
      setIsLoading(true);
      const steps = await stepService.listarStepsPorEdital(
        editalSelecionado.id.toString()
      );
      const stepId = steps && steps.length > 0 ? steps[0].id : undefined;
      const notasCalculadas = await calculoNotasService.calcularNotasEdital(
        editalSelecionado.id,
        stepId
      );
      setNotas(notasCalculadas);
    } catch (err: any) {
      console.error("Erro ao calcular notas:", err);
      setNotas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const notasFiltradas = notas.filter((nota) => {
    const termo = termoBusca.toLowerCase();
    return (
      !termoBusca ||
      nota.nome?.toLowerCase().includes(termo) ||
      nota.email?.toLowerCase().includes(termo) ||
      nota.matricula?.toLowerCase().includes(termo)
    );
  });

  const getRankingBadgeClass = (ranking: number) => {
    if (ranking === 1) return "ranking-badge gold";
    if (ranking === 2) return "ranking-badge silver";
    if (ranking === 3) return "ranking-badge bronze";
    return "ranking-badge default";
  };

  const getRankingIcon = (ranking: number) => {
    if (ranking <= 3) return <Trophy className="w-4 h-4" />;
    return <Hash className="w-4 h-4" />;
  };

  const exportarResultados = () => {
    const csv = [
      ["Ranking", "Nome", "Matrícula", "Email", "Nota Documentos", "Nota Respostas", "Nota Pareceres", "Nota Final"].join(","),
      ...notasFiltradas.map((n) =>
        [
          n.ranking,
          n.nome,
          n.matricula,
          n.email,
          n.nota_documentos,
          n.nota_respostas,
          n.nota_pareceres,
          n.nota_final,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultados_${editalSelecionado?.titulo_edital || "edital"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="ranqueamento-container">
        <header className="ranqueamento-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-container">
                <div className="avatar">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">Ranqueamento e Resultados</h1>
                <p className="welcome-subtitle">
                  {editalSelecionado
                    ? `Resultados do edital: ${editalSelecionado.titulo_edital}`
                    : "Selecione um edital para visualizar o ranqueamento"}
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
                value={editalSelecionado ? String(editalSelecionado.id) : ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const edital = editais.find((ed) => String(ed.id) === selectedId);
                  setEditalSelecionado(edital || null);
                }}
                disabled={isLoadingEditais}
              >
                <option value="">Selecione um edital...</option>
                {editais.map((edital) => (
                  <option key={String(edital.id)} value={String(edital.id)}>
                    {edital.titulo_edital}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Estatísticas */}
          {editalSelecionado && notas.length > 0 && (
            <section className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon bg-blue-100">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total de Candidatos</p>
                    <p className="stat-value">{notas.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon bg-green-100">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Média Geral</p>
                    <p className="stat-value">
                      {(
                        notas.reduce((sum, n) => sum + n.nota_final, 0) / notas.length
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon bg-yellow-100">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Maior Nota</p>
                    <p className="stat-value">
                      {Math.max(...notas.map((n) => n.nota_final)).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon bg-purple-100">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Menor Nota</p>
                    <p className="stat-value">
                      {Math.min(...notas.map((n) => n.nota_final)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Busca e Ações */}
          {editalSelecionado && notas.length > 0 && (
            <section className="actions-section">
              <div className="actions-card">
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
                <button onClick={exportarResultados} className="btn-export">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            </section>
          )}

          {/* Tabela de Ranqueamento */}
          {editalSelecionado && (
            <section className="ranking-section">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Calculando notas e ranqueamento...</p>
                </div>
              ) : notasFiltradas.length === 0 ? (
                <div className="empty-state">
                  <Trophy className="w-12 h-12 text-gray-400" />
                  <h3>Nenhum resultado encontrado</h3>
                  <p>
                    {termoBusca
                      ? "Nenhum candidato corresponde à busca."
                      : "Não há notas calculadas para este edital no momento."}
                  </p>
                </div>
              ) : (
                <div className="ranking-table-container">
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th>Ranking</th>
                        <th>Nome</th>
                        <th>Matrícula</th>
                        <th>Email</th>
                        <th>Nota Documentos</th>
                        <th>Nota Respostas</th>
                        <th>Nota Pareceres</th>
                        <th>Nota Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasFiltradas.map((nota) => (
                        <tr key={nota.inscricao_id}>
                          <td>
                            <div className={getRankingBadgeClass(nota.ranking)}>
                              {getRankingIcon(nota.ranking)}
                              <span>{nota.ranking}º</span>
                            </div>
                          </td>
                          <td>
                            <div className="nome-cell">
                              <User className="w-4 h-4" />
                              <span>{nota.nome}</span>
                            </div>
                          </td>
                          <td>
                            <span className="matricula-badge">{nota.matricula}</span>
                          </td>
                          <td>
                            <div className="email-cell">
                              <Mail className="w-4 h-4" />
                              <span>{nota.email}</span>
                            </div>
                          </td>
                          <td>
                            <div className="nota-cell">
                              <span className="nota-value">{nota.nota_documentos.toFixed(2)}</span>
                              <span className="nota-detail">
                                ({nota.detalhes.documentos_aprovados}/
                                {nota.detalhes.documentos_total})
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="nota-cell">
                              <span className="nota-value">{nota.nota_respostas.toFixed(2)}</span>
                              <span className="nota-detail">
                                ({nota.detalhes.respostas_completas}/
                                {nota.detalhes.respostas_total})
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="nota-cell">
                              <span className="nota-value">{nota.nota_pareceres.toFixed(2)}</span>
                              <span className="nota-detail">
                                ({nota.detalhes.pareceres_aprovados}/
                                {nota.detalhes.pareceres_total})
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="nota-final-cell">
                              <span className="nota-final-value">{nota.nota_final.toFixed(2)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    <span>
                      {notasFiltradas.length} de {notas.length} candidato
                      {notas.length !== 1 ? "s" : ""}
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

