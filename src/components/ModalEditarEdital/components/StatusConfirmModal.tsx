import React from "react";
import { AlertTriangle } from "lucide-react";
import { StatusEdital, statusLabelMap } from "../types";

interface StatusConfirmModalProps {
  isOpen: boolean;
  newStatus: StatusEdital | null;
  confirmText: string;
  isSaving: boolean;
  onConfirmTextChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const StatusConfirmModal: React.FC<StatusConfirmModalProps> = ({
  isOpen,
  newStatus,
  confirmText,
  isSaving,
  onConfirmTextChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="status-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="confirm-title warn">
          <AlertTriangle size={18} className="icon-warn" />
          Confirmar mudança de status
        </h3>
        <p>A mudança de status é imediata e não requer salvar o formulário.</p>
        <p>
          Novo status:{" "}
          <strong>{newStatus ? statusLabelMap[newStatus] : ""}</strong>
        </p>
        <div className="confirm-input-group">
          <label htmlFor="confirm-status-input">
            Para continuar, digite exatamente: TENHO CERTEZA
          </label>
          <input
            id="confirm-status-input"
            className="confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            placeholder="TENHO CERTEZA"
            autoFocus
          />
        </div>
        <div className="confirm-buttons">
          <button onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn-confirm"
            disabled={confirmText !== "TENHO CERTEZA" || isSaving}
            title={
              confirmText !== "TENHO CERTEZA"
                ? "Digite TENHO CERTEZA para confirmar"
                : "Confirmar mudança"
            }
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmModal;
