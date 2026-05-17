import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, X, FileDown, Loader2 } from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { stepService } from "@/services/StepService/stepService";
import type { Edital } from "@/types/edital";

interface ImportarFormularioModalProps {
  open: boolean;
  /** Edital alvo (cuja edição está aberta). */
  editalAlvoId: number | string;
  /** Quando true, oferece a opção de substituir o formulário existente. */
  podeSubstituir?: boolean;
  onClose: () => void;
  /** Callback chamado após clonagem bem sucedida. */
  onImportado: () => void | Promise<void>;
}

/**
 * Permite ao admin Gerencial importar um formulário (steps + perguntas)
 * já existente em outro edital, evitando precisar recriar do zero.
 *
 * No backend a clonagem roda em transação e mantém: ordem, opções,
 * vínculo com `dado` e regras de exibição condicional (`condicao`).
 */
const ImportarFormularioModal: React.FC<ImportarFormularioModalProps> = ({
  open,
  editalAlvoId,
  podeSubstituir,
  onClose,
  onImportado,
}) => {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [substituirExistente, setSubstituirExistente] = useState(false);
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    editalService
      .listarEditais()
      .then((lista) => setEditais(lista || []))
      .catch((err) => {
        console.error("Erro listando editais", err);
        toast.error("Não foi possível carregar a lista de editais.");
      })
      .finally(() => setLoading(false));
  }, [open]);

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

  const confirmar = async () => {
    if (!selecionado) {
      toast.error("Selecione um edital de origem.");
      return;
    }
    setImportando(true);
    try {
      const r = await stepService.clonarFormulario(
        editalAlvoId,
        selecionado,
        substituirExistente,
      );
      toast.success(
        `Formulário importado: ${r.stepsCriados} questionário(s), ${r.perguntasCriadas} pergunta(s).`,
      );
      await onImportado();
      onClose();
    } catch (e: any) {
      console.error("Erro ao clonar formulário", e);
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Falha ao importar formulário.",
      );
    } finally {
      setImportando(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        zIndex: 5000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(640px, 100%)",
          background: "white",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
          maxHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <FileDown size={20} />
            Importar formulário de outro edital
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 20, overflow: "auto" }}>
          <p style={{ marginTop: 0, color: "#475569", fontSize: 14 }}>
            Selecione o edital cujo formulário será copiado para este edital.
            Os questionários, perguntas, opções, vínculos com dados do aluno e
            regras condicionais são preservados.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #d4d4d8",
              borderRadius: 8,
              padding: "8px 10px",
              marginBottom: 12,
            }}
          >
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar edital pelo título ou id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 14,
              }}
              aria-label="Buscar edital"
            />
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              maxHeight: 320,
              overflow: "auto",
            }}
          >
            {loading ? (
              <div style={{ padding: 24, textAlign: "center" }}>
                <Loader2 className="animate-spin" /> Carregando editais...
              </div>
            ) : editaisFiltrados.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                Nenhum edital disponível para importar.
              </div>
            ) : (
              editaisFiltrados.map((e) => {
                const isSel = Number(selecionado) === Number(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelecionado(Number(e.id))}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      borderBottom: "1px solid #f1f5f9",
                      background: isSel ? "#eff6ff" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {e.titulo_edital || "(sem título)"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      ID #{e.id} · {e.status_edital || "—"}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {podeSubstituir && (
            <label
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 13,
                color: "#92400e",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <input
                type="checkbox"
                checked={substituirExistente}
                onChange={(e) => setSubstituirExistente(e.target.checked)}
              />
              <span>
                Substituir formulário existente. Esta ação remove os
                questionários atuais antes de copiar (em cascata, todas as
                respostas a essas perguntas são apagadas).
              </span>
            </label>
          )}
        </div>

        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={importando}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #d4d4d8",
              background: "white",
              cursor: importando ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={!selecionado || importando}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              background:
                !selecionado || importando ? "#94a3b8" : "#2563eb",
              color: "white",
              cursor: !selecionado || importando ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {importando ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            Importar formulário
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportarFormularioModal;
