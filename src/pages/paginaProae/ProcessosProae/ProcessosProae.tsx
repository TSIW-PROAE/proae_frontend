import { useState, useEffect, useContext, useRef, type RefObject } from "react";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
} from "../../../types/edital";
import { editalService } from "../../../services/EditalService/editalService";
import { stepService } from "../../../services/StepService/stepService";
import FormularioEdital from "../../../components/FormularioEdital/FormularioEdital";
import ListaEditais from "../../../components/ListaEditais/ListaEditais";
import ModalEditarEdital from "../../../components/ModalEditarEdital/ModalEditarEdital";
import {
  FileText,
  Plus,
  AlertCircle,
  BookOpen,
  Lock,
  X,
  Settings,
  Trash2,
} from "lucide-react";
import "./ProcessosProae.css";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  NIVEL_GRADUACAO,
  NIVEL_POS_GRADUACAO,
} from "@/constants/nivelAcademico";
import { AuthContext } from "@/context/AuthContext";
import { canManageEditais } from "@/utils/authRoles";
import { getApiErrorMessage } from "@/utils/apiError";

export default function ProcessosProae() {
  const { userInfo } = useContext(AuthContext);
  const podeGerenciarEditais = canManageEditais(userInfo?.adminPerfil ?? null);
  const [searchParams] = useSearchParams();
  const tour = searchParams.get("tour");

  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editalToDelete, setEditalToDelete] = useState<Edital | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEdital, setEditingEdital] = useState<Edital | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [tituloEdital, setTituloEdital] = useState("");
  const [nivelNovoEdital, setNivelNovoEdital] = useState<string>(NIVEL_GRADUACAO);
  const [aplicarTemplateCadastro, setAplicarTemplateCadastro] = useState(false);
  const [isFormularioRenovacao, setIsFormularioRenovacao] = useState(false);
  const [inscricoesAbertas, setInscricoesAbertas] = useState(false);
  const [ajustesAbertos, setAjustesAbertos] = useState(false);
  const [isCreatingEdital, setIsCreatingEdital] = useState(false);
  const [isDeletingEdital, setIsDeletingEdital] = useState(false);
  const [duplicatingEdital, setDuplicatingEdital] = useState<Edital | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const listaRef = useRef<HTMLElement>(null);
  const tourHandledRef = useRef<string | null>(null);

  useEffect(() => {
    carregarEditais();
  }, []);

  useEffect(() => {
    if (!tour) return;
    if (tourHandledRef.current === tour) return;
    const map: Record<string, { ref: RefObject<HTMLElement>; label: string }> = {
      novo: { ref: headerRef, label: "criação de edital" },
      lista: { ref: listaRef, label: "lista de editais" },
    };
    const target = map[tour];
    if (!target?.ref.current) return;
    target.ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    if (tour === "novo") {
      if (podeGerenciarEditais) {
        setShowCreateModal(true);
      } else {
        toast("Perfil atual em modo consulta: sem permissão para criar edital.");
      }
    } else {
      toast(`Tutorial: foco em "${target.label}".`);
    }
    tourHandledRef.current = tour;
  }, [tour, podeGerenciarEditais]);

  const carregarEditais = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await editalService.listarEditais();
      setEditais(data);
    } catch (err) {
      setError("Erro ao carregar editais. Tente novamente.");
      console.error("Erro ao carregar editais:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriarEdital = async (editalData: CreateEditalRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await editalService.criarEdital(editalData);
      await carregarEditais();
      setShowForm(false);
      setEditingEdital(undefined);
    } catch (err) {
      setError("Erro ao criar edital. Tente novamente.");
      console.error("Erro ao criar edital:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarEdital = async (editalData: UpdateEditalRequest) => {
    if (!editingEdital?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      await editalService.atualizarEdital(editingEdital.id, editalData);
      await carregarEditais();
      setShowForm(false);
      setEditingEdital(undefined);
    } catch (err) {
      setError("Erro ao atualizar edital. Tente novamente.");
      console.error("Erro ao atualizar edital:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletarEdital = async (id: string) => {
    const edital = editais.find((e) => e.id === id);
    if (!edital) return;

    setEditalToDelete(edital);
    setShowDeleteModal(true);
    setDeleteError(null);
    setError(null);
  };

  const handleConfirmarDelecao = async () => {
    if (!editalToDelete?.id) return;

    setIsDeletingEdital(true);
    setDeleteError(null);
    try {
      await editalService.deletarEdital(editalToDelete.id);
      await carregarEditais();
      setShowDeleteModal(false);
      setEditalToDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(
        getApiErrorMessage(err) || "Erro ao deletar edital. Tente novamente.",
      );
      console.error("Erro ao deletar edital:", err);
    } finally {
      setIsDeletingEdital(false);
    }
  };

  const handleCancelarDelecao = () => {
    setShowDeleteModal(false);
    setEditalToDelete(null);
    setDeleteError(null);
  };

  const handleCloseEditModal = async () => {
    await carregarEditais();
    setShowEditModal(false);
    setEditingEdital(undefined);
    setError(null);
  };

  const handleSaveEditModal = async () => {
    await carregarEditais();
    setShowEditModal(false);
    setEditingEdital(undefined);
  };

  const handleEditClick = (edital: Edital) => {
    setEditingEdital(edital);
    setShowEditModal(true);
    setError(null);
  };

  const handleNovoEdital = () => {
    setShowCreateModal(true);
    setTituloEdital("");
    setNivelNovoEdital(NIVEL_GRADUACAO);
    setAplicarTemplateCadastro(false);
    setIsFormularioRenovacao(false);
    setInscricoesAbertas(false);
    setAjustesAbertos(false);
    setError(null);
  };

  const handleCriarEditalSimples = async () => {
    if (!tituloEdital.trim()) {
      setError("Por favor, informe o título do edital");
      return;
    }

    setIsCreatingEdital(true);
    setError(null);
    try {
      const novoEdital = await editalService.criarEdital({
        titulo_edital: tituloEdital.trim(),
        nivel_academico: nivelNovoEdital,
        aplicar_template_cadastro: aplicarTemplateCadastro,
        is_formulario_renovacao: isFormularioRenovacao,
        inscricoes_abertas: inscricoesAbertas,
        ajustes_abertos: ajustesAbertos,
      });

      await carregarEditais();
      setShowCreateModal(false);
      setTituloEdital("");
      setNivelNovoEdital(NIVEL_GRADUACAO);
      setAplicarTemplateCadastro(false);
      setIsFormularioRenovacao(false);
      setInscricoesAbertas(false);
      setAjustesAbertos(false);
      if (novoEdital?.id) {
        setEditingEdital(novoEdital);
        setShowEditModal(true);
      }
    } catch (err) {
      setError("Não foi possível criar o edital. Tente novamente.");
      console.error("Erro ao criar edital:", err);
    } finally {
      setIsCreatingEdital(false);
    }
  };

  const handleCancelarCriacaoEdital = () => {
    setShowCreateModal(false);
    setTituloEdital("");
    setNivelNovoEdital(NIVEL_GRADUACAO);
    setAplicarTemplateCadastro(false);
    setIsFormularioRenovacao(false);
    setInscricoesAbertas(false);
    setAjustesAbertos(false);
    setError(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEdital(undefined);
    setError(null);
  };

  const handleSubmitForm = (
    editalData: CreateEditalRequest | UpdateEditalRequest
  ) => {
    if (editingEdital) {
      handleEditarEdital(editalData as UpdateEditalRequest);
    } else {
      handleCriarEdital(editalData as CreateEditalRequest);
    }
  };

  const abrirModalDuplicar = (edital: Edital) => {
    setDuplicatingEdital(edital);
  };

  const cancelarDuplicacao = () => {
    setDuplicatingEdital(null);
    setIsDuplicating(false);
  };

  const confirmarDuplicacao = async () => {
    if (!duplicatingEdital) return;
    setIsDuplicating(true);
    setError(null);
    try {
      // 1) Criar novo edital apenas com título
      const nivelCopia =
        duplicatingEdital.nivel_academico?.trim() || NIVEL_GRADUACAO;
      const novo = await editalService.criarEdital({
        titulo_edital: `${duplicatingEdital.titulo_edital} (cópia)`,
        nivel_academico: nivelCopia,
        aplicar_template_cadastro: false,
        is_formulario_renovacao:
          duplicatingEdital.is_formulario_renovacao ?? false,
        inscricoes_abertas: duplicatingEdital.inscricoes_abertas ?? false,
        ajustes_abertos: duplicatingEdital.ajustes_abertos ?? false,
      });

      // 2) Atualizar infos do novo (descricao, documentos, etapas básicas se existirem no payload)
      if (novo?.id) {
        await editalService.atualizarEdital(novo.id, {
          descricao: duplicatingEdital.descricao,
          edital_url: duplicatingEdital.edital_url,
          nivel_academico: nivelCopia,
          is_formulario_renovacao:
            duplicatingEdital.is_formulario_renovacao ?? false,
          inscricoes_abertas: duplicatingEdital.inscricoes_abertas ?? false,
          ajustes_abertos: duplicatingEdital.ajustes_abertos ?? false,
          // Cronograma (etapa_edital) é parte do edital; duplicamos aqui
          etapa_edital: Array.isArray(duplicatingEdital.etapa_edital)
            ? duplicatingEdital.etapa_edital
            : [],
        });
      }

      // 3) Clonar vagas
      if (novo?.id && duplicatingEdital.id) {
        const vagasOriginais = await editalService.buscarVagasDoEdital(
          duplicatingEdital.id
        );
        if (Array.isArray(vagasOriginais) && vagasOriginais.length) {
          await Promise.all(
            vagasOriginais.map((v) =>
              editalService.criarVaga({
                edital_id: Number(novo.id) || 0,
                beneficio: v.beneficio,
                descricao_beneficio: v.descricao_beneficio,
                numero_vagas: v.numero_vagas,
              })
            )
          );
        }
      }

      // 4) Clonar steps e perguntas em uma única chamada transacional no
      // backend, preservando opções, vínculos com dados, ordem manual e
      // condições de exibição. Substitui a clonagem múltipla em N chamadas.
      if (novo?.id && duplicatingEdital.id) {
        try {
          await stepService.clonarFormulario(novo.id, duplicatingEdital.id, false);
        } catch (err) {
          console.error("Falha ao clonar formulário do edital original", err);
        }
      }

      // Garantir status rascunho (se backend tiver rota específica)
      if (novo?.id) {
        try {
          await editalService.alterarStatusEdital(novo.id, "RASCUNHO");
        } catch {}
      }

      await carregarEditais();
      cancelarDuplicacao();
    } catch (err) {
      console.error("Erro ao duplicar edital:", err);
      setError("Erro ao duplicar edital. Tente novamente.");
      setIsDuplicating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
      <div className="processos-container">
        {/* Header Principal */}
        <header
          ref={headerRef}
          className="processos-header"
          style={tour === "novo" ? { outline: "2px solid #60a5fa", borderRadius: "12px" } : undefined}
        >
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-container">
                <div className="avatar">
                  <Settings className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">Gerenciamento de Editais</h1>
                <p className="welcome-subtitle">
                  Gerencie os editais e processos seletivos da PROAE
                </p>
              </div>
            </div>

            <div className="header-actions">
              {podeGerenciarEditais ? (
                <button
                  onClick={handleNovoEdital}
                  className="btn-novo-edital"
                  disabled={isLoading}
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Edital</span>
                </button>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                  title="Apenas perfis gerenciais podem criar editais."
                >
                  <Lock className="w-4 h-4" />
                  Somente consulta
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="btn-close-error"
              title="Fechar mensagem de erro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal de Criação Simples */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Novo Edital
                </h3>
                <button
                  onClick={handleCancelarCriacaoEdital}
                  className="modal-close-btn"
                  disabled={isCreatingEdital}
                  title="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="edital-renovacao" className="input-label">
                    Tipo de processo
                  </label>
                  <label
                    htmlFor="edital-renovacao"
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      id="edital-renovacao"
                      type="checkbox"
                      checked={isFormularioRenovacao}
                      onChange={(e) => setIsFormularioRenovacao(e.target.checked)}
                      disabled={isCreatingEdital}
                    />
                    Este edital é de renovação
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Use para o processo de renovação de benefícios.
                  </p>
                </div>
                <div className="input-group">
                  <label htmlFor="edital-inscricoes-abertas" className="input-label">
                    Permissão de novas inscrições
                  </label>
                  <label
                    htmlFor="edital-inscricoes-abertas"
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      id="edital-inscricoes-abertas"
                      type="checkbox"
                      checked={inscricoesAbertas}
                      onChange={(e) => setInscricoesAbertas(e.target.checked)}
                      disabled={isCreatingEdital}
                    />
                    Permitir novas inscrições agora
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Ativa o botão de inscrição para alunos (respeitando o período da etapa de inscrição no cronograma).
                  </p>
                </div>
                <div className="input-group">
                  <label htmlFor="edital-ajustes-abertos" className="input-label">
                    Permissão de ajustes
                  </label>
                  <label
                    htmlFor="edital-ajustes-abertos"
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      id="edital-ajustes-abertos"
                      type="checkbox"
                      checked={ajustesAbertos}
                      onChange={(e) => setAjustesAbertos(e.target.checked)}
                      disabled={isCreatingEdital}
                    />
                    Permitir envio de ajustes agora
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Libera correções de pendências pelos alunos (respeitando prazos e regras do edital).
                  </p>
                </div>
                <div className="input-group">
                  <label htmlFor="template-cadastro" className="input-label">
                    Template de cadastro
                  </label>
                  <label
                    htmlFor="template-cadastro"
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      id="template-cadastro"
                      type="checkbox"
                      checked={aplicarTemplateCadastro}
                      onChange={(e) => setAplicarTemplateCadastro(e.target.checked)}
                      disabled={isCreatingEdital}
                    />
                    Aplicar perguntas padrão com pesos
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Quando marcado, o edital já nasce com o template de cadastro.
                  </p>
                </div>
                <div className="input-group">
                  <label htmlFor="titulo-edital" className="input-label">
                    Título do Edital
                  </label>
                  <input
                    id="titulo-edital"
                    type="text"
                    value={tituloEdital}
                    onChange={(e) => setTituloEdital(e.target.value)}
                    placeholder="Digite o título do edital"
                    className="input-field"
                    disabled={isCreatingEdital}
                    autoFocus
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="nivel-novo-edital" className="input-label">
                    Nível acadêmico
                  </label>
                  <select
                    id="nivel-novo-edital"
                    value={nivelNovoEdital}
                    onChange={(e) => setNivelNovoEdital(e.target.value)}
                    className="input-field"
                    disabled={isCreatingEdital}
                  >
                    <option value={NIVEL_GRADUACAO}>Graduação</option>
                    <option value={NIVEL_POS_GRADUACAO}>Pós-graduação</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Editais e inscrições ficam separados entre Graduação e Pós-graduação.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={handleCancelarCriacaoEdital}
                  className="btn-cancel"
                  disabled={isCreatingEdital}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriarEditalSimples}
                  className="btn-create"
                  disabled={isCreatingEdital || !tituloEdital.trim()}
                >
                  {isCreatingEdital ? (
                    <>
                      <div className="spinner"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Criar Edital
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Deleção */}
        {showDeleteModal && editalToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  Confirmar Deleção
                </h3>
                <button
                  onClick={handleCancelarDelecao}
                  className="modal-close-btn"
                  disabled={isDeletingEdital}
                  title="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="modal-body">
                {deleteError && (
                  <div className="modal-error-message" role="alert">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span>{deleteError}</span>
                  </div>
                )}
                <div className="delete-warning">
                  <div className="warning-icon">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <div className="warning-content">
                    <h4 className="warning-title">
                      Tem certeza que deseja deletar este edital?
                    </h4>
                    <p className="warning-message">
                      Esta ação não pode ser desfeita. O edital{" "}
                      <strong>"{editalToDelete.titulo_edital}"</strong> será
                      permanentemente removido.
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={handleCancelarDelecao}
                  className="btn-cancel"
                  disabled={isDeletingEdital}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarDelecao}
                  className="btn-delete"
                  disabled={isDeletingEdital}
                >
                  {isDeletingEdital ? (
                    <>
                      <div className="spinner"></div>
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirmar Deleção
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showEditModal && editingEdital && (
          <ModalEditarEdital
            edital={editingEdital}
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            onSave={handleSaveEditModal}
            onStatusChanged={carregarEditais}
          />
        )}

        {/* Conteúdo Principal */}
        <main className="main-content">
          {showForm ? (
            <section className="form-section">
              <div className="section-header">
                <div className="header-info">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h2 className="section-title">
                    {editingEdital ? "Editar Edital" : "Novo Edital"}
                  </h2>
                </div>
              </div>
              <div className="form-container">
                <FormularioEdital
                  edital={editingEdital}
                  onSubmit={handleSubmitForm}
                  onCancel={handleCancelForm}
                  isLoading={isLoading}
                />
              </div>
            </section>
          ) : (
            <section
              ref={listaRef}
              className="editais-section"
              style={tour === "lista" ? { outline: "2px solid #34d399", borderRadius: "12px" } : undefined}
            >
              <div className="section-header">
                <div className="header-info">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="section-title">Lista de Editais</h2>
                </div>
              </div>
              <div className="lista-container">
                <ListaEditais
                  editais={editais}
                  onEdit={handleEditClick}
                  onDelete={handleDeletarEdital}
                  isLoading={isLoading}
                  onRequestDuplicate={abrirModalDuplicar}
                  canManage={podeGerenciarEditais}
                />
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modal de Duplicação */}
      {duplicatingEdital && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                <FileText className="w-5 h-5 text-purple-600" />
                Confirmar Duplicação
              </h3>
              <button
                onClick={cancelarDuplicacao}
                className="modal-close-btn"
                disabled={isDuplicating}
                title="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="warning-content">
                  <h4 className="warning-title">Duplicar edital como rascunho?</h4>
                  <p className="warning-message">
                    Será criada uma cópia de <strong>"{duplicatingEdital.titulo_edital}"</strong>
                    {" "}com status Rascunho, incluindo steps e perguntas (quando existirem).
                    {" "}
                    <span className="block mt-2 text-sm text-slate-600">
                      Nível da cópia:{" "}
                      <strong>
                        {duplicatingEdital.nivel_academico?.trim() || NIVEL_GRADUACAO}
                      </strong>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={cancelarDuplicacao}
                className="btn-cancel"
                disabled={isDuplicating}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDuplicacao}
                className="btn-create"
                disabled={isDuplicating}
              >
                {isDuplicating ? (
                  <>
                    <div className="spinner"></div>
                    Duplicando...
                  </>
                ) : (
                  <>
                    Duplicar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
