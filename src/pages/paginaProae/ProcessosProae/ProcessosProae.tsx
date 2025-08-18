import { useState, useEffect } from "react";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
} from "../../../types/edital";
import { editalService } from "../../../services/EditalService/editalService";
import FormularioEdital from "../../../components/FormularioEdital/FormularioEdital";
import ListaEditais from "../../../components/ListaEditais/ListaEditais";
import {
  FileText,
  Plus,
  AlertCircle,
  BookOpen,
  X,
  Settings
} from "lucide-react";
import "./ProcessosProae.css";

export default function ProcessosProae() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEdital, setEditingEdital] = useState<Edital | undefined>();
  const [error, setError] = useState<string | null>(null);

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
    if (!window.confirm("Tem certeza que deseja deletar este edital?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await editalService.deletarEdital(id);
      await carregarEditais();
    } catch (err) {
      setError("Erro ao deletar edital. Tente novamente.");
      console.error("Erro ao deletar edital:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (edital: Edital) => {
    setEditingEdital(edital);
    setShowForm(true);
  };

  const handleNovoEdital = () => {
    setEditingEdital(undefined);
    setShowForm(true);
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
                <h1 className="welcome-title">
                  Gerenciamento de Editais
                </h1>
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
