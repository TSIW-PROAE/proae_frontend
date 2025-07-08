import { useState, useEffect } from "react";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
} from "../../../types/edital";
import { editalService } from "../../../services/EditalService/editalService";
import FormularioEdital from "../../../components/FormularioEdital/FormularioEdital";
import ListaEditais from "../../../components/ListaEditais/ListaEditais";
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
    <div className="processos-proae">
      <div className="processos-header">
        <div className="header-content">
          <h1>Gerenciamento de Editais</h1>
          <p>Gerencie os editais e processos seletivos da PROAE</p>
        </div>
        <button
          onClick={handleNovoEdital}
          className="btn-novo-edital"
          disabled={isLoading}
        >
          ➕ Novo Edital
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="btn-close-error">
            ✕
          </button>
        </div>
      )}

      {showForm ? (
        <div className="form-container">
          <FormularioEdital
            edital={editingEdital}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="lista-container">
          <ListaEditais
            editais={editais}
            onEdit={handleEditClick}
            onDelete={handleDeletarEdital}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
