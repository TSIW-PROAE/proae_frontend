import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import {
  AlertCircle,
  ChevronRight,
  GraduationCap,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import { Aluno } from "@/types";
import { alunoService } from "@/services/AlunoService/alunoService";
import "./GerenciamentoAlunos.css";

interface ErrorState {
  message: string;
  retryLabel?: string;
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function GerenciamentoAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const closeModal = useCallback(() => {
    setSelectedAluno(null);
  }, []);

  const handleRowClick = (aluno: Aluno) => {
    setSelectedAluno(aluno);
  };

  const handleRowKeyDown = (
    event: ReactKeyboardEvent<HTMLTableRowElement>,
    aluno: Aluno
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRowClick(aluno);
    }
  };

  const handleOverlayClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      closeModal();
    }
  };

  const carregarAlunos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await alunoService.listarAlunos();
      if (Array.isArray(data)) {
        setAlunos(data);
      } else {
        setAlunos([]);
      }
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
      setError({
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os alunos. Tente novamente.",
        retryLabel: "Tentar novamente",
      });
      setAlunos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarAlunos();
  }, []);

  const filteredAlunos = useMemo(() => {
    if (!searchTerm) return alunos;

    const term = searchTerm.trim().toLowerCase();
    return alunos.filter((aluno) => {
      const values = [
        aluno.nome,
        aluno.matricula,
        aluno.email,
        aluno.curso,
        aluno.status,
        aluno.campus,
        aluno.cpf,
        aluno.celular,
        aluno.telefone,
        aluno.data_ingresso,
        aluno.data_nascimento,
      ]
        .filter(Boolean)
        .map((value) => value!.toLowerCase());

      return values.some((value) => value.includes(term));
    });
  }, [alunos, searchTerm]);

  const stats = useMemo(() => {
    const total = alunos.length;
    const campi = new Set(
      alunos
        .map((aluno) => aluno.campus?.trim())
        .filter((campus): campus is string => Boolean(campus))
    ).size;
    const cursos = new Set(
      alunos
        .map((aluno) => aluno.curso?.trim())
        .filter((curso): curso is string => Boolean(curso))
    ).size;

    return {
      total,
      campi,
      cursos,
    };
  }, [alunos]);

  useEffect(() => {
    if (!selectedAluno) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAluno, closeModal]);

  const modalSections = useMemo(() => {
    if (!selectedAluno) {
      return [] as Array<{
        title: string;
        items: Array<{ label: string; value: string }>;
      }>;
    }

    return [
      {
        title: "Informações pessoais",
        items: [
          { label: "CPF", value: selectedAluno.cpf ?? "-" },
          {
            label: "Data de nascimento",
            value: formatDate(selectedAluno.data_nascimento),
          },
          { label: "Status", value: selectedAluno.status ?? "Não informado" },
        ],
      },
      {
        title: "Contato",
        items: [
          { label: "E-mail", value: selectedAluno.email ?? "-" },
          {
            label: "Telefone",
            value: selectedAluno.celular ?? selectedAluno.telefone ?? "-",
          },
        ],
      },
      {
        title: "Dados acadêmicos",
        items: [
          { label: "Matrícula", value: selectedAluno.matricula ?? "-" },
          { label: "Curso", value: selectedAluno.curso ?? "-" },
          { label: "Campus", value: selectedAluno.campus ?? "-" },
          { label: "Ingresso", value: formatDate(selectedAluno.data_ingresso) },
        ],
      },
    ];
  }, [selectedAluno]);

  return (
    <div className="students-page">
      <div className="students-container">
        <header className="students-header">
          <div className="students-header-content">
            <div className="students-welcome">
              <div className="students-avatar">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="students-title">Gerenciamento de Alunos</h1>
                <p className="students-subtitle">
                  Acompanhe os alunos cadastrados e seus status de acesso
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="students-stats">
          <div className="stat-card">
            <div className="stat-icon bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="stat-label">Total de alunos</p>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-violet-50">
              <GraduationCap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="stat-label">Cursos distintos</p>
              <p className="stat-value">{stats.cursos}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-emerald-50">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="stat-label">Campi atendidos</p>
              <p className="stat-value">{stats.campi}</p>
            </div>
          </div>
        </section>

        <section className="students-table-section">
          <div className="students-table-card">
            <div className="students-table-toolbar">
              <div className="students-table-info">
                <h2>Alunos cadastrados</h2>
                <span>
                  {filteredAlunos.length} registro
                  {filteredAlunos.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="students-actions">
                <div className="search-input">
                  <Search className="search-icon" />
                  <input
                    type="search"
                    placeholder="Buscar por nome, matrícula, e-mail, CPF ou campus"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <button
                  className="refresh-button"
                  onClick={carregarAlunos}
                  disabled={isLoading}
                >
                  Atualizar
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="students-table-loading">
                <div className="loading-spinner" />
                <p>Carregando alunos...</p>
              </div>
            ) : error ? (
              <div className="students-table-error">
                <AlertCircle className="w-5 h-5" />
                <div className="error-text">
                  <p>{error.message}</p>
                  <button onClick={carregarAlunos}>
                    {error.retryLabel ?? "Tentar novamente"}
                  </button>
                </div>
              </div>
            ) : filteredAlunos.length === 0 ? (
              <div className="students-table-empty">
                <AlertCircle className="w-12 h-12 text-gray-400" />
                <h3>Nenhum aluno encontrado</h3>
                <p>
                  Ajuste a busca ou tente atualizar a lista para ver novos
                  registros.
                </p>
              </div>
            ) : (
              <div className="students-table-wrapper">
                <div className="students-table-header">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Aluno</th>
                        <th>Contato</th>
                        <th>Curso / Campus</th>
                        <th>CPF</th>
                        <th>Ingresso</th>
                        <th className="arrow-column" aria-label="Detalhes"></th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="students-table-body">
                  <table>
                    <tbody>
                      {filteredAlunos.map((aluno, index) => {
                        return (
                          <tr
                            key={aluno.id ?? aluno.email ?? index}
                            className="students-table-row"
                            onClick={() => handleRowClick(aluno)}
                            onKeyDown={(event) =>
                              handleRowKeyDown(event, aluno)
                            }
                            tabIndex={0}
                            role="button"
                            aria-label={`Ver detalhes do aluno ${aluno.nome ?? "sem nome"}`}
                          >
                            <td data-label="ID">
                              #{aluno.aluno_id ?? aluno.id ?? "-"}
                            </td>
                            <td data-label="Aluno">
                              <div className="cell-name">
                                {aluno.nome || "Nome não informado"}
                              </div>
                              <div className="cell-subtitle">
                                Matrícula: {aluno.matricula ?? "não informada"}
                              </div>
                            </td>
                            <td data-label="Contato" className="cell-email">
                              <div>{aluno.email ?? "E-mail não informado"}</div>
                              <div className="cell-subtitle">
                                {aluno.celular ??
                                  aluno.telefone ??
                                  "Sem telefone"}
                              </div>
                            </td>
                            <td data-label="Curso / Campus">
                              <div>{aluno.curso ?? "Curso não informado"}</div>
                              <div className="cell-subtitle">
                                {aluno.campus ?? "Campus não informado"}
                              </div>
                            </td>
                            <td data-label="CPF">{aluno.cpf ?? "-"}</td>
                            <td data-label="Ingresso">
                              {formatDate(aluno.data_ingresso)}
                            </td>
                            <td data-label="Detalhes" className="arrow-cell">
                              <ChevronRight className="arrow-icon" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedAluno && (
        <div
          className="student-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-modal-title"
          onClick={handleOverlayClick}
        >
          <div className="student-modal" role="document">
            <div className="student-modal-header">
              <div>
                <h3 id="student-modal-title">
                  {selectedAluno.nome || "Aluno sem identificação"}
                </h3>
                <p className="student-modal-subtitle">
                  Matrícula {selectedAluno.matricula ?? "—"} · CPF{" "}
                  {selectedAluno.cpf ?? "—"}
                </p>
              </div>
              <button
                type="button"
                className="student-modal-close"
                onClick={closeModal}
                aria-label="Fechar detalhes do aluno"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="student-modal-content">
              {modalSections.map((section) => (
                <div key={section.title} className="student-modal-section">
                  <h4>{section.title}</h4>
                  <dl>
                    {section.items.map((item) => (
                      <div key={item.label} className="student-modal-item">
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            <div className="student-modal-footer">
              <span>
                ID interno #{selectedAluno.aluno_id ?? selectedAluno.id ?? "-"}
              </span>
              <span>
                Cadastro {formatDate(selectedAluno.created_at)} · Atualização{" "}
                {formatDate(selectedAluno.updated_at)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
