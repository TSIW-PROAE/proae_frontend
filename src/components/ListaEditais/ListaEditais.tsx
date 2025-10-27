import React, { useState, useEffect, useCallback } from "react";
import {
  Edit,
  Trash2,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
  Copy,
  Grid3X3,
  List,
} from "lucide-react";
import { Edital, Vaga } from "../../types/edital";
import { editalService } from "../../services/EditalService/editalService";
import "./ListaEditais.css";

interface ListaEditaisProps {
  editais: Edital[];
  onEdit: (edital: Edital) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  onRequestDuplicate?: (edital: Edital) => void;
}

type ViewMode = "grid" | "list";

const EditalTableRow: React.FC<{
  edital: Edital;
  onEdit: (edital: Edital) => void;
  onDelete: (id: number) => void;
  onRequestDuplicate?: (edital: Edital) => void;
}> = ({ edital, onEdit, onDelete, onRequestDuplicate }) => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);

  const statusLower = edital.status_edital
    ? edital.status_edital.toLowerCase()
    : "";
  const isOpen = statusLower === "edital em aberto";
  const isClosed = statusLower === "edital encerrado";
  const isInProgress = statusLower === "edital em andamento";
  const isDraft = statusLower === "rascunho";

  const loadVagas = useCallback(async () => {
    if (!edital.id || loadingVagas) return;

    setLoadingVagas(true);
    try {
      const vagasData = await editalService.buscarVagasDoEdital(edital.id);
      setVagas(vagasData || []);
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
      setVagas([]);
    } finally {
      setLoadingVagas(false);
    }
  }, [edital.id]);

  useEffect(() => {
    loadVagas();
  }, [loadVagas]);

  const getBadgeStyles = () => {
    if (isOpen) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    } else if (isClosed) {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (isInProgress) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (isDraft) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = () => {
    if (isOpen) return <CheckCircle className="w-3 h-3 text-emerald-600" />;
    if (isClosed) return <AlertCircle className="w-3 h-3 text-red-600" />;
    if (isInProgress) return <Clock className="w-3 h-3 text-blue-600" />;
    if (isDraft) return <FileText className="w-3 h-3 text-yellow-600" />;
    return <Clock className="w-3 h-3 text-gray-600" />;
  };

  const getStatusLabel = () => {
    if (isOpen) return "Aberto";
    if (isClosed) return "Encerrado";
    if (isInProgress) return "Em Andamento";
    if (isDraft) return "Rascunho";
    return "N/A";
  };

  const totalVagas =
    vagas?.reduce((total, vaga) => total + (vaga.numero_vagas || 0), 0) || 0;

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDuplicate && onRequestDuplicate(edital);
  };

  return (
    <tr className="table-row" onClick={() => onEdit(edital)}>
      <td className="table-cell id-cell">#{edital.id || 0}</td>
      <td className="table-cell title-cell">
        <div className="table-title">
          {edital.titulo_edital || "Título não informado"}
        </div>
        <div className="table-description">
          {edital.descricao && edital.descricao.length > 60
            ? `${edital.descricao.substring(0, 60)}...`
            : edital.descricao || "Descrição não disponível"}
        </div>
      </td>
      <td className="table-cell status-cell">
        <div className="table-status">
          {getStatusIcon()}
          <span className={`status-badge-small ${getBadgeStyles()}`}>
            {getStatusLabel()}
          </span>
        </div>
      </td>
      <td className="table-cell vagas-cell">
        <div className="vagas-info">
          <Users className="w-3 h-3" />
          <span>{totalVagas}</span>
        </div>
      </td>
      <td className="table-cell actions-cell">
        <div className="table-actions">
          <button
            onClick={handleDuplicate}
            className="action-btn duplicate-btn"
            title="Duplicar edital"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(edital);
            }}
            className="action-btn edit-btn"
            title="Editar edital"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              edital.id && onDelete(edital.id);
            }}
            className="action-btn delete-btn"
            title="Deletar edital"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const EditalCard: React.FC<{
  edital: Edital;
  onEdit: (edital: Edital) => void;
  onDelete: (id: number) => void;
  onRequestDuplicate?: (edital: Edital) => void;
}> = ({ edital, onEdit, onDelete, onRequestDuplicate }) => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);

  const statusLower = edital.status_edital
    ? edital.status_edital.toLowerCase()
    : "";
  const isOpen = statusLower === "edital em aberto";
  const isClosed = statusLower === "edital encerrado";
  const isInProgress = statusLower === "edital em andamento";
  const isDraft = statusLower === "rascunho";

  const loadVagas = useCallback(async () => {
    if (!edital.id || loadingVagas) return;

    setLoadingVagas(true);
    try {
      const vagasData = await editalService.buscarVagasDoEdital(edital.id);
      setVagas(vagasData || []);
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
      setVagas([]);
    } finally {
      setLoadingVagas(false);
    }
  }, [edital.id]);

  // Carregar vagas automaticamente quando o componente é montado
  useEffect(() => {
    loadVagas();
  }, [loadVagas]);

  const getBadgeStyles = () => {
    if (isOpen) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    } else if (isClosed) {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (isInProgress) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (isDraft) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = () => {
    if (isOpen) return <CheckCircle className="w-3 h-3 text-emerald-600" />;
    if (isClosed) return <AlertCircle className="w-3 h-3 text-red-600" />;
    if (isInProgress) return <Clock className="w-3 h-3 text-blue-600" />;
    if (isDraft) return <FileText className="w-3 h-3 text-yellow-600" />;
    return <Clock className="w-3 h-3 text-gray-600" />;
  };

  const getStatusLabel = () => {
    if (isOpen) return "Edital em aberto";
    if (isClosed) return "Edital encerrado";
    if (isInProgress) return "Edital em andamento";
    if (isDraft) return "Rascunho";
    return edital.status_edital || "Status não informado";
  };

  const totalVagas =
    vagas?.reduce((total, vaga) => total + (vaga.numero_vagas || 0), 0) || 0;

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDuplicate && onRequestDuplicate(edital);
  };

  return (
    <div className="selection-card" onClick={() => onEdit(edital)}>
      <div className="selection-card-header">
        <div className="card-status-indicator">
          {getStatusIcon()}
          <span className={`status-badge-small ${getBadgeStyles()}`}>
            {getStatusLabel()}
          </span>
        </div>
        <div className="card-actions">
          <button
            onClick={handleDuplicate}
            className="action-btn duplicate-btn"
            title="Duplicar edital"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(edital);
            }}
            className="action-btn edit-btn"
            title="Editar edital"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              edital.id && onDelete(edital.id);
            }}
            className="action-btn delete-btn"
            title="Deletar edital"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {/* {edital.edital_url && edital.edital_url[0] && (
            <a
              href={edital.edital_url[0].url_documento}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn external-link"
              title="Ver Edital"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )} */}
        </div>
      </div>

      <div className="selection-card-body">
        <div className="selection-card-meta">
          <div className="meta-item">
            <Tag className="w-3 h-3" />
            <span>#{edital.id || 0}</span>
          </div>
          <div className="meta-item">
            <Users className="w-3 h-3" />
            <span>{totalVagas} vagas total</span>
          </div>
        </div>

        <h3 className="selection-card-title">
          {edital.titulo_edital || "Título não informado"}
        </h3>
        <p className="selection-card-description">
          {edital.descricao && edital.descricao.length > 90
            ? `${edital.descricao.substring(0, 90)}...`
            : edital.descricao || "Descrição não disponível"}
        </p>

        {/* Chips de benefícios
        {!loadingVagas && vagas.length > 0 && (
          <div className="benefits-chips">
            {vagas.slice(0, 3).map((vaga) => (
              <div key={vaga.id} className="benefit-chip">
                <span className="benefit-chip-name">{vaga.beneficio}</span>
                <span className="benefit-chip-count">{vaga.numero_vagas}</span>
              </div>
            ))}
            {vagas.length > 3 && (
              <div className="benefit-chip more-benefits">
                +{vagas.length - 3}
              </div>
            )}
          </div>
        )} */}

        {/* {loadingVagas && (
          <div className="benefits-loading">
            <div className="loading-dot"></div>
            <span>Carregando benefícios...</span>
          </div>
        )} */}
      </div>

      <div className="selection-card-footer">
        <div className="card-type">
          <FileText className="w-3 h-3" />
          <span>Edital PROAE</span>
        </div>
      </div>
    </div>
  );
};

export default function ListaEditais({
  editais,
  onEdit,
  onDelete,
  isLoading = false,
  onRequestDuplicate,
}: ListaEditaisProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  if (isLoading) {
    return (
      <div className="lista-editais-loading">
        <div className="loading-spinner"></div>
        <p>Carregando editais...</p>
      </div>
    );
  }

  const openEditais =
    editais?.filter(
      (edital) => edital.status_edital?.toLowerCase() === "edital em aberto"
    ) || [];

  const closedEditais =
    editais?.filter(
      (edital) => edital.status_edital?.toLowerCase() === "edital encerrado"
    ) || [];

  const inProgressEditais =
    editais?.filter(
      (edital) => edital.status_edital?.toLowerCase() === "edital em andamento"
    ) || [];

  const draftEditais =
    editais?.filter(
      (edital) => edital.status_edital?.toLowerCase() === "rascunho"
    ) || [];

  if (!editais || editais.length === 0) {
    return (
      <div className="open-selections-container">
        <div className="empty-selections">
          <div className="empty-icon">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="empty-title">Nenhum edital encontrado</h3>
          <p className="empty-description">
            Clique em "Novo Edital" para criar o primeiro edital.
          </p>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="selections-content">
      {/* Container scrollável com os cards */}
      <div className="cards-container">
        <div className="selections-grid">
          {/* Primeiro mostrar os editais abertos */}
          {openEditais.map((edital) => (
            <EditalCard
              key={`open-${edital.id}`}
              edital={edital}
              onEdit={onEdit}
              onDelete={onDelete}
              onRequestDuplicate={onRequestDuplicate}
            />
          ))}

          {/* Depois mostrar os editais em andamento */}
          {inProgressEditais.map((edital) => (
            <EditalCard
              key={`progress-${edital.id}`}
              edital={edital}
              onEdit={onEdit}
              onDelete={onDelete}
              onRequestDuplicate={onRequestDuplicate}
            />
          ))}

          {/* Mostrar os rascunhos */}
          {draftEditais.map((edital) => (
            <EditalCard
              key={`draft-${edital.id}`}
              edital={edital}
              onEdit={onEdit}
              onDelete={onDelete}
              onRequestDuplicate={onRequestDuplicate}
            />
          ))}

          {/* Por último mostrar os editais encerrados */}
          {closedEditais.map((edital) => (
            <EditalCard
              key={`closed-${edital.id}`}
              edital={edital}
              onEdit={onEdit}
              onDelete={onDelete}
              onRequestDuplicate={onRequestDuplicate}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="selections-content">
      {/* Cabeçalho fixo da tabela */}
      <div className="table-header-fixed">
        <table className="editais-table-header">
          <thead>
            <tr>
              <th className="table-header-cell">ID</th>
              <th className="table-header-cell">Título</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Vagas</th>
              <th className="table-header-cell">Ações</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Container scrollável com os dados */}
      <div className="table-container">
        <table className="editais-table">
          <tbody className="table-body">
            {/* Primeiro mostrar os editais abertos */}
            {openEditais.map((edital) => (
              <EditalTableRow
                key={`open-${edital.id}`}
                edital={edital}
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestDuplicate={onRequestDuplicate}
              />
            ))}

            {/* Depois mostrar os editais em andamento */}
            {inProgressEditais.map((edital) => (
              <EditalTableRow
                key={`progress-${edital.id}`}
                edital={edital}
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestDuplicate={onRequestDuplicate}
              />
            ))}

            {/* Mostrar os rascunhos */}
            {draftEditais.map((edital) => (
              <EditalTableRow
                key={`draft-${edital.id}`}
                edital={edital}
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestDuplicate={onRequestDuplicate}
              />
            ))}

            {/* Por último mostrar os editais encerrados */}
            {closedEditais.map((edital) => (
              <EditalTableRow
                key={`closed-${edital.id}`}
                edital={edital}
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestDuplicate={onRequestDuplicate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="open-selections-container">
      <div className="selections-header">
        <div className="selections-stats">
          <div className="stat-item">
            <div className="stat-dot open"></div>
            <span>{openEditais.length} Abertos</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot progress"></div>
            <span>{inProgressEditais.length} Em Andamento</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot draft"></div>
            <span>{draftEditais.length} Rascunhos</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot closed"></div>
            <span>{closedEditais.length} Encerrados</span>
          </div>
        </div>

        {/* Botão de alternância de visualização */}
        <div className="view-toggle-container">
          <div className="view-toggle-switch">
            <input
              type="checkbox"
              id="view-toggle"
              className="view-toggle-input"
              checked={viewMode === "list"}
              onChange={() =>
                setViewMode(viewMode === "grid" ? "list" : "grid")
              }
            />
            <label htmlFor="view-toggle" className="view-toggle-label">
              <div className="view-toggle-track">
                <div className="view-toggle-thumb">
                  {viewMode === "grid" ? (
                    <Grid3X3 className="w-3 h-3" />
                  ) : (
                    <List className="w-3 h-3" />
                  )}
                </div>
                <div className="view-toggle-icons">
                  <Grid3X3 className="w-3 h-3 icon-left" />
                  <List className="w-3 h-3 icon-right" />
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? renderGridView() : renderTableView()}

      {editais.length > 0 && (
        <div className="selections-footer">
          <div className="footer-info">
            <span className="total-count">
              {editais.length} edital{editais.length !== 1 ? "s" : ""} total
            </span>
            <span className="last-updated">Atualizado agora</span>
          </div>
        </div>
      )}
    </div>
  );
}
