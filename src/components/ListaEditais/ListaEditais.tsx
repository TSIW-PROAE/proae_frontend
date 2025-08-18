import React from "react";
import {
  ExternalLink,
  Edit,
  Trash2,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
} from "lucide-react";
import { Edital } from "../../types/edital";
import "./ListaEditais.css";

interface ListaEditaisProps {
  editais: Edital[];
  onEdit: (edital: Edital) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

const EditalCard: React.FC<{ 
  edital: Edital; 
  onEdit: (edital: Edital) => void; 
  onDelete: (id: number) => void;
}> = ({ edital, onEdit, onDelete }) => {
  const statusLower = edital.status_edital ? edital.status_edital.toLowerCase() : "";
  const isOpen = statusLower.includes("aberto");
  const isClosed = statusLower.includes("encerrado");
  const isInProgress = statusLower.includes("andamento");

  const getBadgeStyles = () => {
    if (isOpen) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    } else if (isClosed) {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (isInProgress) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = () => {
    if (isOpen) return <CheckCircle className="w-3 h-3 text-emerald-600" />;
    if (isClosed) return <AlertCircle className="w-3 h-3 text-red-600" />;
    if (isInProgress) return <Clock className="w-3 h-3 text-blue-600" />;
    return <Clock className="w-3 h-3 text-gray-600" />;
  };

  const getStatusLabel = () => {
    if (isOpen) return "Aberto";
    if (isClosed) return "Encerrado";
    if (isInProgress) return "Em Andamento";
    return edital.status_edital || "Status não informado";
  };

  return (
    <div className="selection-card">
      <div className="selection-card-header">
        <div className="card-status-indicator">
          {getStatusIcon()}
          <span className={`status-badge-small ${getBadgeStyles()}`}>
            {getStatusLabel()}
          </span>
        </div>
        <div className="card-actions">
          <button
            onClick={() => onEdit(edital)}
            className="action-btn edit-btn"
            title="Editar edital"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => edital.id && onDelete(edital.id)}
            className="action-btn delete-btn"
            title="Deletar edital"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {edital.edital_url && edital.edital_url[0] && (
            <a
              href={edital.edital_url[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn external-link"
              title="Ver Edital"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
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
            <span>{edital.quantidade_bolsas || 0} bolsas</span>
          </div>
        </div>

        <h3 className="selection-card-title">{edital.titulo_edital || "Título não informado"}</h3>
        <p className="selection-card-description">
          {edital.descricao && edital.descricao.length > 90
            ? `${edital.descricao.substring(0, 90)}...`
            : edital.descricao || "Descrição não disponível"}
        </p>
      </div>

      <div className="selection-card-footer">
        <div className="card-type">
          <FileText className="w-3 h-3" />
          <span>{edital.tipo_edital || "Tipo não informado"}</span>
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
}: ListaEditaisProps) {
  if (isLoading) {
    return (
      <div className="lista-editais-loading">
        <div className="loading-spinner"></div>
        <p>Carregando editais...</p>
      </div>
    );
  }

  const openEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase().includes("aberto")
  ) || [];

  const closedEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase().includes("encerrado")
  ) || [];

  const inProgressEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase().includes("andamento")
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
            <div className="stat-dot closed"></div>
            <span>{closedEditais.length} Encerrados</span>
          </div>
        </div>
      </div>

      <div className="selections-grid">
        {/* Primeiro mostrar os editais abertos */}
        {openEditais.map((edital) => (
          <EditalCard
            key={`open-${edital.id}`}
            edital={edital}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {/* Depois mostrar os editais em andamento */}
        {inProgressEditais.map((edital) => (
          <EditalCard
            key={`progress-${edital.id}`}
            edital={edital}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {/* Por último mostrar os editais encerrados */}
        {closedEditais.map((edital) => (
          <EditalCard
            key={`closed-${edital.id}`}
            edital={edital}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

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
