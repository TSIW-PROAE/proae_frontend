import React, { useEffect, useRef } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import "./ConfirmDialog.css";

export type ConfirmDialogTone = "default" | "warning" | "danger";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  isLoading?: boolean;
  overlayClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = "Confirmar",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  isLoading = false,
  overlayClassName,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const titleClass =
    tone === "danger"
      ? "system-dialog-title system-dialog-title--danger"
      : tone === "warning"
        ? "system-dialog-title system-dialog-title--warning"
        : "system-dialog-title";

  const Icon = tone === "default" ? HelpCircle : AlertTriangle;

  const overlayClass = overlayClassName
    ? `system-dialog-overlay ${overlayClassName}`
    : "system-dialog-overlay";

  return (
    <div className={overlayClass} role="presentation" onClick={onCancel}>
      <div
        className="system-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="system-dialog-title"
        aria-describedby="system-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="system-dialog-title" className={titleClass}>
          <Icon className="w-5 h-5 shrink-0" aria-hidden />
          {title}
        </h2>
        <p id="system-dialog-message" className="system-dialog-message">
          {message}
        </p>
        <div className="system-dialog-actions">
          <button
            ref={cancelRef}
            type="button"
            className="system-dialog-btn system-dialog-btn--cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`system-dialog-btn system-dialog-btn--confirm${tone === "danger" ? " system-dialog-btn--danger" : ""}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Aguarde…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
