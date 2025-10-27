import React from "react";
import { AlertTriangle } from "lucide-react";

interface StatusErrorModalProps {
  isOpen: boolean;
  errorMessage: string;
  onClose: () => void;
}

const StatusErrorModal: React.FC<StatusErrorModalProps> = ({
  isOpen,
  errorMessage,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="status-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="confirm-title danger">
          <AlertTriangle size={18} className="icon-danger" />
          Não é possível alterar o status
        </h3>
        <p>{errorMessage}</p>
        <div className="confirm-buttons">
          <button onClick={onClose} className="btn-confirm">
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusErrorModal;
