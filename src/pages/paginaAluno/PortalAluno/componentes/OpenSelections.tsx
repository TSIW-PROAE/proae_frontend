import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ExternalLink,
  Clock,
  Users,
  ArrowRight,
  FileText,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface Edital {
  id: number;
  tipo_edital: string;
  descricao: string;
  edital_url: string[];
  titulo_edital: string;
  quantidade_bolsas: number;
  status_edital: string;
  etapas: any[];
}

interface OpenSelectionsProps {
  editais: Edital[];
}

const OpenSelectionCard: React.FC<Edital> = ({
  id,
  titulo_edital,
  status_edital,
  edital_url,
  descricao,
  quantidade_bolsas,
}) => {
  const navigate = useNavigate();
  const statusLower = status_edital ? status_edital.toLowerCase() : "";
  const isOpen = statusLower.includes("aberto");
  const isClosed = statusLower.includes("fechado");

  const getBadgeStyles = () => {
    if (isOpen) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    } else if (isClosed) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getStatusIcon = () => {
    if (isOpen) return <Clock className="w-3 h-3 text-emerald-600" />;
    if (isClosed) return <AlertCircle className="w-3 h-3 text-red-600" />;
    return <Clock className="w-3 h-3 text-blue-600" />;
  };

  /*const redirectToInscricao = (editalId: number): void => {
    navigate("/portal-aluno/candidatura", {
      state: {
        editalId: editalId,
        tituloEdital: titulo_edital,
        descricaoEdital: descricao,
      },
    });
  };*/

  return (
    <div className="selection-card">
      <div className="selection-card-header">
        <div className="card-status-indicator">
          {getStatusIcon()}
          <span className={`status-badge-small ${getBadgeStyles()}`}>
            {isOpen ? "Aberto" : isClosed ? "Fechado" : "Em Breve"}
          </span>
        </div>
        <a
          href={edital_url && edital_url[0] ? edital_url[0] : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link-icon"
          title="Ver Edital"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="selection-card-body">
        <div className="selection-card-meta">
          <div className="meta-item">
            <FileText className="w-3 h-3" />
            <span>Nº {id || 0}</span>
          </div>
          <div className="meta-item">
            <Users className="w-3 h-3" />
            <span>{quantidade_bolsas || 0} vagas</span>
          </div>
        </div>

        <h3 className="selection-card-title">{titulo_edital || "Título não informado"}</h3>
        <p className="selection-card-description">
          {descricao && descricao.length > 90
            ? `${descricao.substring(0, 90)}...`
            : descricao || "Descrição não disponível"}
        </p>
      </div>

      <div className="selection-card-footer">
        {isOpen ? (
          <button
            onClick={() => navigate(`/questionario/${id}`)}
            className="selection-action-button primary"
            title="Realizar Inscrição"
          >
            <span>Inscrever-se</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            className="selection-action-button disabled"
            disabled
            title="Inscrições não disponíveis"
          >
            <span>Indisponível</span>
          </button>
        )}
      </div>
    </div>
  );
};

const OpenSelections: React.FC<OpenSelectionsProps> = ({ editais }) => {
  const openEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase().includes("aberto")
  ) || [];

  const closedEditais = editais?.filter((edital) =>
    edital.status_edital?.toLowerCase().includes("fechado")
  ) || [];

  return (
    <div className="bg-white border-2 p-[1.25rem] shadow-md border-solid rounded-[1.25rem] flex flex-col h-full overflow-hidden overflow-y-auto">
      <div className="selections-header">
        <div className="flex justify-start items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 m-0">Seleções Abertas</h2>
        </div>
        <div className="selections-stats">
          <div className="stat-item">
            <div className="stat-dot open"></div>
            <span>{openEditais.length} Abertos</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot closed"></div>
            <span>{closedEditais.length} Fechados</span>
          </div>
        </div>
      </div>

      {(editais && editais.length === 0) || !editais ? (
        <div className="empty-selections">
          <div className="empty-icon">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="empty-title">Nenhum edital disponível</h3>
          <p className="empty-description">Aguarde novas oportunidades</p>
        </div>
      ) : (
        <div className="selections-grid">
          {/* Primeiro mostrar os editais abertos */}
          {openEditais.map((edital) => (
            <OpenSelectionCard key={`open-${edital.id}`} {...edital} />
          ))}

          {/* Depois mostrar os editais fechados */}
          {closedEditais.map((edital) => (
            <OpenSelectionCard key={`closed-${edital.id}`} {...edital} />
          ))}
        </div>
      )}

      {editais && editais.length > 0 && (
        <div className="selections-footer">
          <div className="footer-info">
            <span className="total-count">
              {editais?.length || 0} edital{(editais?.length || 0) !== 1 ? "s" : ""} total
            </span>
            <span className="last-updated">Atualizado agora</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenSelections;
