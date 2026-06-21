import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Search, X, FileDown, Loader2, AlertTriangle } from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { stepService } from "@/services/StepService/stepService";
import type { Edital } from "@/types/edital";
import { getApiErrorMessage } from "@/utils/apiError";

interface ImportarFormularioModalProps {
  open: boolean;
  editalAlvoId: number | string;
  editalAlvoTitulo?: string;
  temFormularioExistente?: boolean;
  podeSubstituir?: boolean;
  onClose: () => void;
  onImportado: () => void | Promise<void>;
}

interface OrigemPreview {
  questionarios: number;
  perguntas: number;
  carregando: boolean;
}

type Passo = "selecao" | "confirmacao";

const ImportarFormularioModal: React.FC<ImportarFormularioModalProps> = ({
  open,
  editalAlvoId,
  editalAlvoTitulo,
  temFormularioExistente = false,
  podeSubstituir = false,
  onClose,
  onImportado,
}) => {
  const [passo, setPasso] = useState<Passo>("selecao");
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [substituirExistente, setSubstituirExistente] = useState(false);
  const [importando, setImportando] = useState(false);
  const [origemPreview, setOrigemPreview] = useState<OrigemPreview>({
    questionarios: 0,
    perguntas: 0,
    carregando: false,
  });

  useEffect(() => {
    if (!open) {
      setPasso("selecao");
      setSearch("");
      setSelecionado(null);
      setSubstituirExistente(false);
      setOrigemPreview({ questionarios: 0, perguntas: 0, carregando: false });
      return;
    }

    setLoading(true);
    editalService
      .listarEditais()
      .then((lista) => setEditais(lista || []))
      .catch((err) => {
        console.error("Erro listando editais", err);
        toast.error(getApiErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || !selecionado) {
      setOrigemPreview({ questionarios: 0, perguntas: 0, carregando: false });
      return;
    }

    let cancelled = false;
    setOrigemPreview((p) => ({ ...p, carregando: true }));

    stepService
      .listarStepsPorEdital(String(selecionado))
      .then((steps) => {
        if (cancelled) return;
        const comPerguntas = (steps ?? []).filter(
          (s) => (s.perguntas?.length ?? 0) > 0,
        );
        const perguntas = comPerguntas.reduce(
          (acc, s) => acc + (s.perguntas?.length ?? 0),
          0,
        );
        setOrigemPreview({
          questionarios: comPerguntas.length,
          perguntas,
          carregando: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setOrigemPreview({
            questionarios: 0,
            perguntas: 0,
            carregando: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, selecionado]);

  const editaisFiltrados = useMemo(() => {
    const alvoId = Number(editalAlvoId);
    const q = search.trim().toLowerCase();
    return (editais || [])
      .filter((e) => Number(e.id) !== alvoId)
      .filter((e) =>
        q
          ? (e.titulo_edital || "").toLowerCase().includes(q) ||
            String(e.id).includes(q)
          : true,
      );
  }, [editais, editalAlvoId, search]);

  const editalOrigem = editais.find(
    (e) => Number(e.id) === Number(selecionado),
  );

  const destinoLabel =
    editalAlvoTitulo?.trim() || `edital #${editalAlvoId}`;
  const origemLabel =
    editalOrigem?.titulo_edital?.trim() ||
    (selecionado != null ? `edital #${selecionado}` : "");

  const executarImportacao = async () => {
    if (!selecionado) return;
    setImportando(true);
    try {
      const r = await stepService.clonarFormulario(
        editalAlvoId,
        selecionado,
        substituirExistente,
      );
      const steps = r?.stepsCriados ?? 0;
      const perguntas = r?.perguntasCriadas ?? 0;
      if (steps === 0 && perguntas === 0) {
        toast.error(
          "Nenhum questionário foi importado. Verifique se o edital de origem tem formulário.",
        );
        return;
      }
      toast.success(
        `Formulário importado: ${steps} questionário(s), ${perguntas} pergunta(s).`,
      );
      await onImportado();
      onClose();
    } catch (e: unknown) {
      console.error("Erro ao clonar formulário", e);
      toast.error(getApiErrorMessage(e));
    } finally {
      setImportando(false);
    }
  };

  const irParaConfirmacao = () => {
    if (!selecionado || !editalOrigem) {
      toast.error("Selecione um edital de origem.");
      return;
    }
    if (origemPreview.carregando) {
      toast.error("Aguarde o carregamento do formulário de origem.");
      return;
    }
    if (origemPreview.perguntas === 0) {
      toast.error(
        "O edital selecionado não possui perguntas para importar.",
      );
      return;
    }
    setPasso("confirmacao");
  };

  const handleFechar = () => {
    if (importando) return;
    onClose();
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="mini-modal-overlay importar-formulario-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="importar-formulario-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget && !importando) handleFechar();
      }}
    >
      <div
        className="mini-modal-content"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mini-modal-header">
          <h3 id="importar-formulario-titulo">
            <FileDown
              size={20}
              style={{ verticalAlign: "middle", marginRight: 8 }}
            />
            {passo === "selecao"
              ? "Importar formulário de outro edital"
              : "Confirmar importação"}
          </h3>
          <button
            type="button"
            className="mini-modal-close"
            onClick={handleFechar}
            disabled={importando}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {passo === "confirmacao" ? (
          <>
            <div className="mini-modal-body">
              <div className="importar-formulario-confirm-box">
                <AlertTriangle
                  size={22}
                  className="importar-formulario-confirm-icon"
                  aria-hidden
                />
                <p>
                  Copiar o formulário de <strong>{origemLabel}</strong> (
                  {origemPreview.questionarios} questionário(s),{" "}
                  {origemPreview.perguntas} pergunta(s)) para{" "}
                  <strong>{destinoLabel}</strong>?
                </p>
                {substituirExistente && (
                  <p className="importar-formulario-confirm-warn">
                    O formulário atual será removido antes da cópia. Perguntas e
                    respostas vinculadas serão apagadas.
                  </p>
                )}
                {!substituirExistente && temFormularioExistente && (
                  <p className="importar-formulario-confirm-info">
                    Os questionários importados serão{" "}
                    <strong>acrescentados</strong> aos que já têm perguntas neste
                    edital. Questionários vazios (sem perguntas) serão removidos
                    automaticamente.
                  </p>
                )}
                {!substituirExistente && !temFormularioExistente && (
                  <p className="importar-formulario-confirm-info">
                    Questionários vazios deste edital (sem perguntas) serão
                    removidos automaticamente antes da cópia.
                  </p>
                )}
              </div>
            </div>
            <div className="mini-modal-footer">
              <button
                type="button"
                className="mini-modal-btn-cancel"
                onClick={() => setPasso("selecao")}
                disabled={importando}
              >
                Voltar
              </button>
              <button
                type="button"
                className="mini-modal-btn-save"
                onClick={executarImportacao}
                disabled={importando}
              >
                {importando ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importando…
                  </>
                ) : (
                  <>
                    <FileDown size={14} /> Importar formulário
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mini-modal-body">
              <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>
                Selecione o edital cujo formulário será copiado para{" "}
                <strong>{destinoLabel}</strong>. Questionários, perguntas, opções
                e regras condicionais são preservados.
              </p>

              <div className="importar-formulario-search">
                <Search size={16} aria-hidden />
                <input
                  type="text"
                  placeholder="Buscar edital pelo título ou id..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar edital"
                />
              </div>

              <div className="importar-formulario-lista">
                {loading ? (
                  <div className="importar-formulario-lista-empty">
                    <Loader2 className="animate-spin" aria-hidden /> Carregando
                    editais…
                  </div>
                ) : editaisFiltrados.length === 0 ? (
                  <div className="importar-formulario-lista-empty">
                    Nenhum edital disponível para importar.
                  </div>
                ) : (
                  editaisFiltrados.map((e) => {
                    const isSel = Number(selecionado) === Number(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        className={`importar-formulario-item${isSel ? " importar-formulario-item--selected" : ""}`}
                        onClick={() => setSelecionado(Number(e.id))}
                      >
                        <div className="importar-formulario-item-titulo">
                          {e.titulo_edital || "(sem título)"}
                        </div>
                        <div className="importar-formulario-item-meta">
                          ID #{e.id} · {e.status_edital || "—"}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selecionado != null && (
                <div className="importar-formulario-preview">
                  {origemPreview.carregando ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                        aria-hidden
                      />{" "}
                      Carregando formulário de origem…
                    </>
                  ) : origemPreview.perguntas === 0 ? (
                    <span className="importar-formulario-preview-warn">
                      <AlertTriangle size={14} aria-hidden /> Este edital não
                      possui perguntas para importar.
                    </span>
                  ) : (
                    <>
                      <strong>Prévia:</strong> {origemPreview.questionarios}{" "}
                      questionário(s), {origemPreview.perguntas} pergunta(s).
                    </>
                  )}
                </div>
              )}

              {temFormularioExistente && !podeSubstituir && (
                <div className="importar-formulario-aviso">
                  Este edital já tem questionários. A importação irá{" "}
                  <strong>acrescentar</strong> novos questionários (não substitui
                  os existentes enquanto houver inscrições).
                </div>
              )}

              {podeSubstituir && (
                <label className="mini-modal-checkbox">
                  <input
                    type="checkbox"
                    checked={substituirExistente}
                    onChange={(e) => setSubstituirExistente(e.target.checked)}
                    disabled={importando}
                  />
                  <span>
                    Substituir formulário existente. Remove os questionários atuais
                    antes de copiar (em cascata, respostas vinculadas são apagadas).
                  </span>
                </label>
              )}
            </div>

            <div className="mini-modal-footer">
              <button
                type="button"
                className="mini-modal-btn-cancel"
                onClick={handleFechar}
                disabled={importando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="mini-modal-btn-save"
                onClick={irParaConfirmacao}
                disabled={
                  !selecionado ||
                  importando ||
                  origemPreview.carregando ||
                  origemPreview.perguntas === 0
                }
              >
                <FileDown size={14} /> Revisar e importar
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ImportarFormularioModal;
