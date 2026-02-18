import { useState, useEffect } from "react";
import { Users, Mail, BookOpen, MapPin, Calendar, Phone } from "lucide-react";
import { Aluno } from "../../../types/aluno";
import { alunoService } from "../../../services/AlunoService/alunoService";
import "./ListaAlunos.css";

export default function ListaAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dados = await alunoService.listarTodosAlunos();
      setAlunos(dados);
    } catch (err: any) {
      console.error("Erro ao carregar alunos:", err);
      setError(err.message || "Erro ao carregar alunos");
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
                <h1 className="welcome-title">Gerenciamento de Alunos</h1>
                <p className="welcome-subtitle">Visualize e gerencie todos os alunos cadastrados no sistema</p>
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
                                <span>{aluno.email || "N/A"}</span>
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
    </div>
  );
}
