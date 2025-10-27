import React from "react";
import {
  Edit,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { StatusEdital, statusLabelMap } from "../types";

interface ModalHeaderProps {
  titulo: string;
  tituloEditando: boolean;
  status: StatusEdital;
  showStatusDropdown: boolean;
  onTituloChange: (titulo: string) => void;
  onTituloEditToggle: (editing: boolean) => void;
  onTituloSave: () => void;
  onStatusDropdownToggle: () => void;
  onStatusChange: (status: StatusEdital) => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  titulo,
  tituloEditando,
  status,
  showStatusDropdown,
  onTituloChange,
  onTituloEditToggle,
  onTituloSave,
  onStatusDropdownToggle,
  onStatusChange,
}) => {
  const getStatusIcon = (statusValue: StatusEdital) => {
    switch (statusValue) {
      case "RASCUNHO":
        return <FileText size={16} />;
      case "ABERTO":
        return <CheckCircle size={16} />;
      case "EM_ANDAMENTO":
        return <Clock size={16} />;
      case "ENCERRADO":
        return <AlertTriangle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="modal-header-horizontal">
      <div className="header-container">
        {/* Título Editável */}
        <div className="titulo-section">
          {tituloEditando ? (
            <div className="titulo-editing">
              <input
                type="text"
                value={titulo}
                onChange={(e) => onTituloChange(e.target.value)}
                className="titulo-input"
                autoFocus
                onBlur={onTituloSave}
                onKeyPress={(e) => e.key === "Enter" && onTituloSave()}
                placeholder="Título do edital"
                title="Título do edital"
              />
            </div>
          ) : (
            <div
              className="titulo-display"
              onClick={() => onTituloEditToggle(true)}
            >
              <h1>{titulo}</h1>
              <Edit size={16} className="edit-icon" />
            </div>
          )}
        </div>

        {/* Status com Dropdown */}
        <div className="status-section">
          <div className="status-selector">
            <button
              className={`status-button status-${status.toLowerCase().replace("_", "-")}`}
              onClick={onStatusDropdownToggle}
            >
              {getStatusIcon(status)}
              <span>{statusLabelMap[status]}</span>
              <div className="status-indicator-active"></div>
              <ChevronDown size={16} />
            </button>
            {showStatusDropdown && (
              <div className="status-dropdown">
                {(
                  [
                    "RASCUNHO",
                    "ABERTO",
                    "EM_ANDAMENTO",
                    "ENCERRADO",
                  ] as StatusEdital[]
                ).map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => onStatusChange(statusOption)}
                    className={`status-option ${statusOption === status ? "active" : ""}`}
                    aria-current={statusOption === status ? "true" : undefined}
                  >
                    {getStatusIcon(statusOption)}
                    <span>{statusLabelMap[statusOption]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalHeader;
