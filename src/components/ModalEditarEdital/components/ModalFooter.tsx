import React from "react";
import { Check, Loader2, AlertCircle, X } from "lucide-react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface ModalFooterProps {
  autoSaveStatus: AutoSaveStatus;
  error: string | null;
  onClose: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ autoSaveStatus, error, onClose }) => {
  return (
    <div className="modal-footer-horizontal">
      <div className="auto-save-indicator">
        {autoSaveStatus === "saving" && (
          <span className="auto-save-status saving">
            <Loader2 size={14} className="spin-icon" />
            Salvando...
          </span>
        )}
        {autoSaveStatus === "saved" && (
          <span className="auto-save-status saved">
            <Check size={14} />
            Salvo
          </span>
        )}
        {autoSaveStatus === "error" && (
          <span className="auto-save-status error">
            <AlertCircle size={14} />
            Erro ao salvar
          </span>
        )}
        {error && <span className="auto-save-status error"><AlertCircle size={14} />{error}</span>}
      </div>
      <div className="footer-buttons">
        <button onClick={onClose} className="btn-close-footer">
          <X size={16} />
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ModalFooter;
