// PendenciaItem.tsx
import fileIcon from "@/assets/icons/arquivo-azul-pdf.svg";
import arrowDownIcon from "@/assets/icons/arrow-down-item.svg";
import uploadIcon from "@/assets/icons/upload.svg";
import React, { useState } from "react";
import { Pendencia } from "@/types/pendencias";
import DocumentViewerModal from "@/components/DocumentViewerModal/DocumentViewerModal";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import toast from "react-hot-toast";

interface PendenciaItemProps extends Omit<Pendencia, "inscricao_id"> {
  onUpdated?: () => Promise<void> | void;
  onGoToAjuste?: (stepId?: number | null, perguntaId?: number | null) => void;
}

const PendenciaItem: React.FC<PendenciaItemProps> = ({
  titulo_edital,
  vaga_beneficio,
  documentos: pendencias,
  ajustes_resposta,
  onUpdated,
  onGoToAjuste,
}) => {
  const totalAjustes = ajustes_resposta?.length ?? 0;
  const totalItensPendentes = pendencias.length + totalAjustes;

  const [expandido, setExpandido] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFileRef, setViewerFileRef] = useState<string | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const alternarExpansao = () => setExpandido(!expandido);

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes("REPROVADO")) {
      return "text-red-700 bg-red-50 border-red-200";
    } else if (statusUpper.includes("PENDENTE")) {
      return "text-amber-600 bg-amber-50 border-amber-200";
    } else if (statusUpper.includes("APROVADO")) {
      return "text-green-700 bg-green-50 border-green-200";
    }
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleOpenViewer = (fileRef?: string | null) => {
    if (!fileRef) {
      toast.error("Este documento ainda não possui arquivo enviado.");
      return;
    }
    setViewerFileRef(fileRef);
    setViewerOpen(true);
  };

  const handleResubmit = async (documentoId: string, tipoDocumento: string, file: File) => {
    setUploadingDocId(documentoId);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("tipo_documento", tipoDocumento);

      await axios.put(`${API_BASE_URL}/documentos/resubmissao/${documentoId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Documento reenviado com sucesso para nova análise.");
      await onUpdated?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Não foi possível reenviar o documento.";
      toast.error(message);
    } finally {
      setUploadingDocId(null);
    }
  };

  return (
    <div className="w-full mb-4 rounded-lg border border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 rounded-t-lg transition-colors duration-150"
        onClick={alternarExpansao}
      >
        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-[#183b4e] leading-tight">
            {titulo_edital}
          </h2>
          {vaga_beneficio && (
            <span className="text-sm text-gray-600 font-medium">
              Benefício: {vaga_beneficio}
            </span>
          )}
          <div className="inline-flex items-center gap-2 text-sm font-medium text-red-600">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {totalItensPendentes}{" "}
              {totalItensPendentes === 1 ? "pendência" : "pendências"}
            </span>
          </div>
        </div>

        <button
          className="ml-4 p-2.5 rounded-full hover:bg-gray-200 transition-colors duration-150 flex-shrink-0"
          aria-label={expandido ? "Recolher pendências" : "Expandir pendências"}
        >
          <img
            src={arrowDownIcon}
            className={`w-5 h-5 transition-transform duration-300 ${
              expandido ? "rotate-180" : ""
            }`}
            alt="Toggle"
          />
        </button>
      </div>

      {expandido && (
        <div className="border-t border-gray-200 bg-[#EDF2F7]">
          <div className="p-5">
            <ul className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
              {(ajustes_resposta ?? []).map((ajuste, index) => (
                <li
                  key={`ajuste-${ajuste.resposta_id}-${index}`}
                  className="bg-amber-50 rounded-lg border border-amber-200 p-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide min-w-[120px]">
                        Tipo:
                      </span>
                      <p className="text-sm font-medium text-amber-950">
                        {ajuste.tipo_ajuste === "NOVA_PERGUNTA"
                          ? "Nova pergunta de complemento"
                          : "Resposta para reenvio/correção"}
                      </p>
                    </div>
                    {ajuste.step_texto && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide min-w-[120px]">
                          Etapa:
                        </span>
                        <p className="text-sm text-amber-950">{ajuste.step_texto}</p>
                      </div>
                    )}
                    {ajuste.pergunta_texto && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                          Pergunta:
                        </span>
                        <p className="text-sm text-amber-950">{ajuste.pergunta_texto}</p>
                      </div>
                    )}
                    {ajuste.parecer && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                          Parecer da PROAE:
                        </span>
                        <p className="text-sm text-amber-950">{ajuste.parecer}</p>
                      </div>
                    )}
                    {ajuste.prazo_reenvio && (
                      <p className="text-xs text-amber-900 m-0">
                        Prazo para ajuste: {formatDate(ajuste.prazo_reenvio)}
                      </p>
                    )}
                    {ajuste.prazo_resposta_nova_pergunta && (
                      <p className="text-xs text-amber-900 m-0">
                        Prazo para responder: {formatDate(ajuste.prazo_resposta_nova_pergunta)}
                      </p>
                    )}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          onGoToAjuste?.(ajuste.step_id, ajuste.pergunta_id)
                        }
                        className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800"
                      >
                        Corrigir agora
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {pendencias.map((pendencia, index) => (
                <li
                  key={pendencia.documento_id || index}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#183b4e] hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide min-w-[100px]">
                          Documento:
                        </span>
                        <p className="text-sm font-medium text-gray-900">
                          {pendencia.tipo_documento}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide min-w-[100px]">
                          Status:
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            pendencia.status_documento
                          )}`}
                        >
                          {pendencia.status_documento}
                        </span>
                      </div>

                      {pendencia.validacoes &&
                        pendencia.validacoes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                              Pareceres:
                            </span>
                            <div className="space-y-2">
                              {pendencia.validacoes.map((validacao, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-50 rounded-md p-3 border border-gray-200"
                                >
                                  <p className="text-sm text-gray-800 mb-1">
                                    <span className="font-medium">
                                      Parecer:{" "}
                                    </span>
                                    {validacao.parecer}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">Data: </span>
                                    {formatDate(validacao.data_validacao)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {(!pendencia.validacoes ||
                        pendencia.validacoes.length === 0) && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 italic">
                            Nenhum parecer disponível.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col items-center gap-2 lg:gap-3 lg:flex-shrink-0">
                      <button
                        className="group flex items-center justify-center w-11 h-11 rounded-lg border-2 border-[#183b4e] bg-white hover:bg-[#183b4e] transition-all duration-200"
                        aria-label="Visualizar arquivo"
                        title="Visualizar documento"
                        onClick={() => handleOpenViewer(pendencia.documento_url)}
                      >
                        <img
                          src={fileIcon}
                          alt="Visualizar"
                          className="w-5 h-5 opacity-80 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert transition-all"
                        />
                      </button>

                      <label
                        className={`group flex items-center justify-center w-11 h-11 rounded-lg border-2 border-green-600 bg-white transition-all duration-200 ${
                          uploadingDocId === String(pendencia.documento_id)
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-green-600 cursor-pointer"
                        }`}
                        aria-label="Fazer upload"
                        title="Reenviar documento"
                      >
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          disabled={uploadingDocId === String(pendencia.documento_id)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void handleResubmit(
                              String(pendencia.documento_id),
                              pendencia.tipo_documento,
                              file,
                            );
                            e.currentTarget.value = "";
                          }}
                        />
                        <img
                          src={uploadIcon}
                          alt="Upload"
                          className="w-5 h-5 opacity-80 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert transition-all"
                        />
                      </label>
                    </div>
                  </div>
                </li>
              ))}
              {totalItensPendentes === 0 && (
                <li className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600 m-0">
                    Não há itens pendentes nesta inscrição.
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      <DocumentViewerModal
        open={viewerOpen}
        fileRef={viewerFileRef}
        onClose={() => {
          setViewerOpen(false);
          setViewerFileRef(null);
        }}
      />
    </div>
  );
};

export default PendenciaItem;
