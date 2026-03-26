import { useEffect, useState } from "react";
import { FileText, X, Download } from "lucide-react";
import {
  resolveStorageKeyForApi,
  extrairNomeArquivo,
  getExtensaoArquivo,
  isPdfExtensao,
  isImagemExtensao,
  fetchPresignedDocumentUrl,
} from "@/utils/documentPresigned";

export interface DocumentViewerModalProps {
  open: boolean;
  /** Valor bruto salvo (object key ou URL). */
  fileRef: string | null | undefined;
  onClose: () => void;
}

/**
 * Modal com iframe para PDF / imagem usando URL presigned do backend.
 * Evita 404 do SPA ao abrir chaves de storage como href.
 */
export default function DocumentViewerModal({
  open,
  fileRef,
  onClose,
}: DocumentViewerModalProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (!open || !fileRef?.trim()) {
      setUrl(null);
      setErro(null);
      setNome("");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setErro(null);
      setUrl(null);
      const key = resolveStorageKeyForApi(fileRef);
      const nomeArq = extrairNomeArquivo(fileRef);
      setNome(nomeArq);
      const result = await fetchPresignedDocumentUrl(key);
      if (cancelled) return;
      if (result?.url) {
        setUrl(result.url);
      } else {
        setErro("Não foi possível carregar o documento. Tente novamente.");
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, fileRef]);

  if (!open) return null;

  const ext = getExtensaoArquivo(nome);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualizar documento"
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-sky-500" />
            <span className="truncate text-[15px] font-semibold text-slate-800">{nome || "Documento"}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {url && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = nome;
                  a.target = "_blank";
                  a.rel = "noreferrer";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                <Download className="h-4 w-4" /> Baixar
              </button>
            )}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[50vh] flex-1 items-center justify-center overflow-auto bg-slate-50">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-sky-500" />
              <p className="text-sm text-slate-600">Carregando documento...</p>
            </div>
          ) : erro ? (
            <div className="max-w-md px-6 py-12 text-center">
              <p className="text-sm font-medium text-red-700">{erro}</p>
            </div>
          ) : url && isPdfExtensao(ext) ? (
            <iframe title={nome} src={url} className="h-[min(75vh,720px)] w-full border-0 bg-white" />
          ) : url && isImagemExtensao(ext) ? (
            <img src={url} alt={nome} className="max-h-[75vh] max-w-full object-contain p-4" />
          ) : url ? (
            <div className="px-8 py-12 text-center">
              <FileText className="mx-auto mb-4 h-14 w-14 text-slate-300" />
              <p className="mb-4 text-sm text-slate-600">Pré-visualização não disponível neste formato.</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
              >
                Abrir em nova aba
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
