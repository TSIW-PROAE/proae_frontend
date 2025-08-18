import React, { useState, useEffect, useCallback } from "react";
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
import { Edital, Vaga } from "../../types/edital";
import { editalService } from "../../services/EditalService/editalService";
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
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);

  const statusLower = edital.status_edital ? edital.status_edital.toLowerCase() : "";
  const isOpen = statusLower === "aberto";
  const isClosed = statusLower === "encerrado";
  const isInProgress = statusLower === "em_andamento";
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
  }, [edital.id, loadingVagas]);

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
    if (isOpen) return "Aberto";
    if (isClosed) return "Encerrado";
    if (isInProgress) return "Em Andamento";
    if (isDraft) return "Rascunho";
    return edital.status_edital || "Status não informado";
  };

  const totalVagas = vagas?.reduce((total, vaga) => total + (vaga.numero_vagas || 0), 0) || 0;

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
              href={edital.edital_url[0].url_documento}
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
            <span>{totalVagas} vagas total</span>
          </div>
        </div>

        <h3 className="selection-card-title">{edital.titulo_edital || "Título não informado"}</h3>
        <p className="selection-card-description">
          {edital.descricao && edital.descricao.length > 90
            ? `${edital.descricao.substring(0, 90)}...`
            : edital.descricao || "Descrição não disponível"}
        </p>

        {/* Chips de benefícios */}
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
        )}

        {loadingVagas && (
          <div className="benefits-loading">
            <div className="loading-dot"></div>
            <span>Carregando benefícios...</span>
          </div>
        )}
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
    edital.status_edital?.toLowerCase() === "aberto"
  ) || [];

  const closedEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase() === "encerrado"
  ) || [];

  const inProgressEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase() === "em_andamento"
  ) || [];

  const draftEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase() === "rascunho"
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
            <div className="stat-dot draft"></div>
            <span>{draftEditais.length} Rascunhos</span>
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

        {/* Mostrar os rascunhos */}
        {draftEditais.map((edital) => (
          <EditalCard
            key={`draft-${edital.id}`}
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
