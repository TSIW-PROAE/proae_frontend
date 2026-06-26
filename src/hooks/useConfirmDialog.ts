import { useCallback, useState } from "react";
import type { ConfirmDialogProps, ConfirmDialogTone } from "@/components/ConfirmDialog/ConfirmDialog";

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
}

type PendingConfirm = ConfirmDialogOptions & {
  resolve: (value: boolean) => void;
};

/**
 * Substitui `window.confirm` por modal do sistema.
 * Renderize `<ConfirmDialog {...dialogProps} />` no JSX da página (uma vez).
 */
export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const dialogProps: ConfirmDialogProps = {
    isOpen: pending != null,
    title: pending?.title,
    message: pending?.message ?? "",
    confirmLabel: pending?.confirmLabel,
    cancelLabel: pending?.cancelLabel,
    tone: pending?.tone,
    onCancel: () => close(false),
    onConfirm: () => close(true),
  };

  return { confirm, dialogProps };
}
