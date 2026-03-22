import { useState, useEffect } from "react";
import { Users, Mail, BookOpen, MapPin, Calendar, Phone, LayoutList, Filter } from "lucide-react";
import { Aluno } from "../../../types/aluno";
import { alunoService } from "../../../services/AlunoService/alunoService";
import { editalService } from "../../../services/EditalService/editalService";
import type { Edital } from "../../../types/edital";
import { Toaster } from "react-hot-toast";
import CentralEstudanteDrawer from "./CentralEstudanteDrawer";
import "./ListaAlunos.css";

export default function ListaAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [editalFiltroId, setEditalFiltroId] = useState<string>("");
  const [apenasBeneficiariosEdital, setApenasBeneficiariosEdital] = useState(false);
  const [apenasInscricaoAprovada, setApenasInscricaoAprovada] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerAlunoId, setDrawerAlunoId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const lista = await editalService.listarEditais();
        setEditais(Array.isArray(lista) ? lista : []);
      } catch {
        setEditais([]);
      }
    })();
  }, []);

  useEffect(() => {
    void carregarAlunos();
  }, [editalFiltroId, apenasBeneficiariosEdital, apenasInscricaoAprovada]);

  const carregarAlunos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (editalFiltroId) {
        const resp = await alunoService.listarAlunosPorEditalComFiltros(editalFiltroId, {
          apenasBeneficiariosEdital: apenasBeneficiariosEdital,
          apenasInscricaoAprovada: apenasInscricaoAprovada,
        });
        const raw = resp?.dados ?? [];
        setAlunos(
          raw.map((a: Aluno & { aluno_id?: number | string }) => ({
            ...a,
            aluno_id: String(a.aluno_id),
          })),
        );
      } else {
        const dados = await alunoService.listarTodosAlunos();
        setAlunos(
          dados.map((a) => ({
            ...a,
            aluno_id: String(a.aluno_id),
          })),
        );
      }
    } catch (err: any) {
      console.error("Erro ao carregar alunos:", err);
      setError(err.message || "Erro ao carregar alunos");
      setAlunos([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="alunos-container">
          <div className="lista-alunos-loading">
            <div className="loading-spinner"></div>
            <p>Carregando alunos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="alunos-container">
        {/* Header Principal */}
        <header className="alunos-page-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-container">
                <div className="avatar">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">Central de estudantes</h1>
                <p className="welcome-subtitle">
                  Lista de cadastros e hub único. Filtre por edital para ver só quem tem inscrição ali — opcionalmente só{" "}
                  <strong>beneficiários homologados no edital</strong> e/ou só com <strong>inscrição aprovada na análise</strong> (são critérios diferentes).
                </p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <Users className="w-5 h-5 text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="btn-close-error" title="Fechar mensagem de erro">
              <Users className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conteúdo Principal */}
        <main className="main-content">
          {!alunos || alunos.length === 0 ? (
            <section className="alunos-section">
              <div className="lista-alunos-container">
                <div className="empty-alunos">
                  <div className="empty-icon">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="empty-title">Nenhum aluno encontrado</h3>
                  <p className="empty-description">Não há alunos cadastrados no sistema no momento.</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="alunos-section">
              <div className="lista-alunos-container">
                <div className="central-filtros-bar">
                  <div className="central-filtros-bar-title">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <span>Filtro por edital e benefício</span>
                  </div>
                  <div className="central-filtros-bar-controls">
                    <label className="central-filtros-label">
                      Edital
                      <select
                        className="central-filtros-select"
                        value={editalFiltroId}
                        onChange={(e) => {
                          setEditalFiltroId(e.target.value);
                          if (!e.target.value) {
                            setApenasBeneficiariosEdital(false);
                            setApenasInscricaoAprovada(false);
                          }
                        }}
                      >
                        <option value="">Todos os cadastros</option>
                        {editais.map((e) => (
                          <option key={String(e.id)} value={String(e.id)}>
                            {e.titulo_edital}
                            {e.is_formulario_geral ? " (Form. Geral)" : ""}
                            {e.is_formulario_renovacao ? " (Renovação)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={`central-filtros-check ${!editalFiltroId ? "central-filtros-check--disabled" : ""}`}>
                      <input
                        type="checkbox"
                        checked={apenasBeneficiariosEdital}
                        disabled={!editalFiltroId}
                        onChange={(e) => setApenasBeneficiariosEdital(e.target.checked)}
                      />
                      Só beneficiários no edital
                    </label>
                    <label className={`central-filtros-check ${!editalFiltroId ? "central-filtros-check--disabled" : ""}`}>
                      <input
                        type="checkbox"
                        checked={apenasInscricaoAprovada}
                        disabled={!editalFiltroId}
                        onChange={(e) => setApenasInscricaoAprovada(e.target.checked)}
                      />
                      Só inscrição aprovada (análise)
                    </label>
                  </div>
                  <p className="central-filtros-hint">
                    Beneficiário no edital = homologado na vaga. Inscrição aprovada = parecer/análise da inscrição — não confundir os dois.
                  </p>
                </div>

                <div className="alunos-content">
                  {/* Cabeçalho fixo da tabela */}
                  <div className="table-header-fixed">
                    <table className="alunos-table-header">
                      <thead>
                        <tr>
                          <th className="table-header-cell">Matrícula</th>
                          <th className="table-header-cell">Nome/Email</th>
                          <th className="table-header-cell">CPF</th>
                          <th className="table-header-cell">Curso</th>
                          <th className="table-header-cell">Campus</th>
                          <th className="table-header-cell">Contato</th>
                          <th className="table-header-cell">Data Ingresso</th>
                          <th className="table-header-cell">Central</th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  {/* Container scrollável com os dados */}
                  <div className="table-container">
                    <table className="alunos-table">
                      <tbody className="table-body">
                        {alunos.map((aluno) => (
                          <tr key={aluno.aluno_id} className="table-row">
                            <td className="table-cell matricula-cell">
                              <span className="matricula-badge">{aluno.matricula || "N/A"}</span>
                            </td>
                            <td className="table-cell email-cell">
                              <div className="email-content">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <div className="email-stack">
                                  {aluno.nome ? <span className="nome-sobre-email">{aluno.nome}</span> : null}
                                  <span>{aluno.email || "N/A"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="table-cell cpf-cell">
                              <span className="cpf-text">{aluno.cpf || "N/A"}</span>
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
                            <td className="table-cell contato-cell">
                              <div className="contato-content">
                                <Phone className="w-3 h-3 text-purple-400" />
                                <span>{aluno.celular || "N/A"}</span>
                              </div>
                            </td>
                            <td className="table-cell data-cell">
                              <div className="data-content">
                                <Calendar className="w-3 h-3 text-orange-400" />
                                <span>{aluno.data_ingresso ? new Date(aluno.data_ingresso).toLocaleDateString("pt-BR") : "N/A"}</span>
                              </div>
                            </td>
                            <td className="table-cell">
                              <button
                                type="button"
                                className="central-hub-btn"
                                title="Abrir histórico e status das inscrições"
                                onClick={() => {
                                  setDrawerAlunoId(String(aluno.aluno_id));
                                  setDrawerOpen(true);
                                }}
                              >
                                <LayoutList className="w-4 h-4" />
                                <span>Hub</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="alunos-footer">
                  <div className="footer-info">
                    <span className="total-count">
                      {alunos.length} aluno{alunos.length !== 1 ? "s" : ""} total
                    </span>
                    <span className="last-updated">Atualizado agora</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <CentralEstudanteDrawer
        isOpen={drawerOpen}
        alunoId={drawerAlunoId}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerAlunoId(null);
        }}
      />
      <Toaster position="top-right" />
    </div>
  );
}
