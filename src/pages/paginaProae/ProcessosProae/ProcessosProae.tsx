import { useState, useEffect } from "react";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
} from "../../../types/edital";
import { editalService } from "../../../services/EditalService/editalService";
import FormularioEdital from "../../../components/FormularioEdital/FormularioEdital";
import ListaEditais from "../../../components/ListaEditais/ListaEditais";
import ModalEditarEdital from "../../../components/ModalEditarEdital/ModalEditarEdital";
import {
  FileText,
  Plus,
  AlertCircle,
  BookOpen,
  X,
  Settings,
  Trash2,
} from "lucide-react";
import "./ProcessosProae.css";

export default function ProcessosProae() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editalToDelete, setEditalToDelete] = useState<Edital | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEdital, setEditingEdital] = useState<Edital | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [tituloEdital, setTituloEdital] = useState("");
  const [isCreatingEdital, setIsCreatingEdital] = useState(false);
  const [isDeletingEdital, setIsDeletingEdital] = useState(false);

  useEffect(() => {
    carregarEditais();
  }, []);

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

  const handleDeletarEdital = async (id: number) => {
    const edital = editais.find((e) => e.id === id);
    if (!edital) return;

    setEditalToDelete(edital);
    setShowDeleteModal(true);
    setError(null);
  };

  const handleConfirmarDelecao = async () => {
    if (!editalToDelete?.id) return;

    setIsDeletingEdital(true);
    setError(null);
    try {
      await editalService.deletarEdital(editalToDelete.id);
      await carregarEditais();
      setShowDeleteModal(false);
      setEditalToDelete(null);
    } catch (err) {
      setError("Erro ao deletar edital. Tente novamente.");
      console.error("Erro ao deletar edital:", err);
    } finally {
      setIsDeletingEdital(false);
    }
  };

  const handleCancelarDelecao = () => {
    setShowDeleteModal(false);
    setEditalToDelete(null);
    setError(null);
  };

  const handleCloseEditModal = () => {
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
      await editalService.criarEdital({
        titulo_edital: tituloEdital.trim(),
      });
      await carregarEditais();
      setShowCreateModal(false);
      setTituloEdital("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="processos-container">
        {/* Header Principal */}
        <header className="processos-header">
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
              <button
                onClick={handleNovoEdital}
                className="btn-novo-edital"
                disabled={isLoading}
              >
                <Plus className="w-5 h-5" />
                <span>Novo Edital</span>
              </button>
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
            <section className="editais-section">
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
                />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
