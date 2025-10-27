import React from "react";
import { Save } from "lucide-react";

interface ModalFooterProps {
  error: string | null;
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  error,
  isSaving,
  hasChanges,
  onSave,
  onCancel,
}) => {
  return (
    <div className="modal-footer-horizontal">
      {error && <div className="error-message">{error}</div>}
      <div className="footer-buttons">
        <button onClick={onCancel} className="btn-cancel-footer">
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className="btn-save-footer"
          title={!hasChanges ? "Nenhuma alteração para salvar" : undefined}
        >
          {isSaving ? (
            <span className="btn-save-content">
              <span className="spinner" aria-hidden="true" />
              Salvando...
            </span>
          ) : (
            <span className="btn-save-content">
              <Save size={16} />
              Salvar Alterações
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ModalFooter;
