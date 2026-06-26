import React from "react";
import { Check, Loader2, AlertCircle, X, Save } from "lucide-react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface ModalFooterProps {
  autoSaveStatus: AutoSaveStatus;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ autoSaveStatus, error, onClose, onSave, isSaving = false }) => {
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
        <button onClick={onSave} className="btn-save-footer" disabled={isSaving || autoSaveStatus === "saving"}>
          <Save size={16} />
          {isSaving || autoSaveStatus === "saving" ? "Salvando..." : "Salvar alterações"}
        </button>
        <button onClick={onClose} className="btn-close-footer">
          <X size={16} />
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ModalFooter;
