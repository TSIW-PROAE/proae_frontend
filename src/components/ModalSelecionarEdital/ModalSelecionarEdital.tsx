import { X, FileText, Calendar } from "lucide-react";
import { Edital } from "../../types/edital";
import "./ModalSelecionarEdital.css";

interface ModalSelecionarEditalProps {
  editais: Edital[];
  onSelect: (edital: Edital) => void;
  onClose: () => void;
  editalAtual: Edital | null;
}

export default function ModalSelecionarEdital({ editais, onSelect, onClose, editalAtual }: ModalSelecionarEditalProps) {
  const getStatusBadge = (status: Edital["status_edital"]) => {
    const statusMap = {
      ABERTO: { label: "Aberto", class: "badge-aberto" },
      ENCERRADO: { label: "Encerrado", class: "badge-encerrado" },
      EM_ANDAMENTO: { label: "Em Andamento", class: "badge-andamento" },
      RASCUNHO: { label: "Rascunho", class: "badge-rascunho" },
    };

    const statusInfo = statusMap[status] || { label: status, class: "badge-default" };

    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="modal-title">Selecionar Edital</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Fechar modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {editais.length === 0 ? (
            <div className="empty-editais">
              <FileText className="w-12 h-12 text-gray-400" />
              <p>Nenhum edital disponível</p>
            </div>
          ) : (
            <div className="editais-list">
              {editais.map((edital) => (
                <div key={edital.id} className={`edital-item ${editalAtual?.id === edital.id ? "selected" : ""}`} onClick={() => onSelect(edital)}>
                  <div className="edital-item-content">
                    <div className="edital-item-header">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="edital-item-title">{edital.titulo_edital}</h3>
                    </div>

                    {edital.descricao && <p className="edital-item-description">{edital.descricao}</p>}

                    <div className="edital-item-footer">
                      {getStatusBadge(edital.status_edital)}

                      {edital.created_at && (
                        <div className="edital-item-date">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(edital.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {editalAtual?.id === edital.id && (
                    <div className="selected-indicator">
                      <div className="selected-checkmark">✓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
