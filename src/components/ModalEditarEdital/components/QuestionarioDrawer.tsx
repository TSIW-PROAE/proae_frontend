import React from "react";
import { X, Edit, Save, Plus, Trash2 } from "lucide-react";
import { PerguntaEditorItem } from "../types";

interface QuestionarioDrawerProps {
  isOpen: boolean;
  loading: boolean;
  questionarioTitle: string;
  titleEditing: boolean;
  perguntas: PerguntaEditorItem[];
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onTitleEditToggle: (editing: boolean) => void;
  onPerguntasChange: (perguntas: PerguntaEditorItem[]) => void;
  onSave: () => void;
}

const QuestionarioDrawer: React.FC<QuestionarioDrawerProps> = ({
  isOpen,
  loading,
  questionarioTitle,
  titleEditing,
  perguntas,
  onClose,
  onTitleChange,
  onTitleEditToggle,
  onPerguntasChange,
  onSave,
}) => {
  const updatePergunta = (
    index: number,
    field: keyof PerguntaEditorItem,
    value: any
  ) => {
    const list = [...perguntas];
    list[index] = { ...list[index], [field]: value };

    // Se o tipo mudar para múltipla escolha/seleção, garante opcoes
    if (
      field === "tipo" &&
      (value === "multipla_escolha" || value === "multipla_selecao")
    ) {
      list[index].opcoes = list[index].opcoes || [""];
    }

    onPerguntasChange(list);
  };

  const updateOpcao = (
    perguntaIndex: number,
    opcaoIndex: number,
    value: string
  ) => {
    const list = [...perguntas];
    const opcoes = [...(list[perguntaIndex].opcoes || [])];
    opcoes[opcaoIndex] = value;
    list[perguntaIndex].opcoes = opcoes;
    onPerguntasChange(list);
  };

  const addOpcao = (perguntaIndex: number) => {
    const list = [...perguntas];
    list[perguntaIndex].opcoes = [...(list[perguntaIndex].opcoes || []), ""];
    onPerguntasChange(list);
  };

  const removeOpcao = (perguntaIndex: number, opcaoIndex: number) => {
    const list = [...perguntas];
    const opcoes = [...(list[perguntaIndex].opcoes || [])];
    opcoes.splice(opcaoIndex, 1);
    list[perguntaIndex].opcoes = opcoes;
    onPerguntasChange(list);
  };

  const deletePergunta = (index: number) => {
    const list = perguntas.filter((_, i) => i !== index);
    onPerguntasChange(list);
  };

  const addPergunta = () => {
    const newPergunta: PerguntaEditorItem = {
      texto: "",
      tipo: "texto",
      obrigatoria: false,
      opcoes: [],
    };
    onPerguntasChange([...perguntas, newPergunta]);
  };

  return (
    <aside className={`drawer-panel ${isOpen ? "open" : ""}`}>
      <div className="drawer-header">
        <div className="drawer-title">
          {titleEditing ? (
            <input
              type="text"
              className="drawer-title-input"
              value={questionarioTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              autoFocus
              onBlur={() => onTitleEditToggle(false)}
              onKeyPress={(e) => e.key === "Enter" && onTitleEditToggle(false)}
              placeholder="Título do questionário"
              title="Título do questionário"
            />
          ) : (
            <button
              type="button"
              className="drawer-title-display"
              onClick={() => onTitleEditToggle(true)}
              title="Clique para editar o título do questionário"
            >
              <span>{questionarioTitle || "Questionário"}</span>
              <Edit size={16} className="edit-icon" />
            </button>
          )}
        </div>
        <button
          className="drawer-close"
          aria-label="Fechar editor de questionário"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {loading ? (
          <div className="drawer-loading">Carregando perguntas…</div>
        ) : (
          <>
            <div className="perguntas-list">
              {perguntas.length === 0 && (
                <div className="empty-state">Nenhuma pergunta adicionada.</div>
              )}
              {perguntas.map((p, i) => (
                <div key={i} className="pergunta-item">
                  <div className="field-row">
                    <input
                      type="text"
                      placeholder={`Pergunta #${i + 1}`}
                      value={p.texto}
                      onChange={(e) =>
                        updatePergunta(i, "texto", e.target.value)
                      }
                    />
                  </div>
                  <div className="field-row two">
                    <select
                      aria-label="Tipo da pergunta"
                      title="Tipo da pergunta"
                      value={p.tipo}
                      onChange={(e) =>
                        updatePergunta(
                          i,
                          "tipo",
                          e.target.value as PerguntaEditorItem["tipo"]
                        )
                      }
                    >
                      <option value="texto">Texto</option>
                      <option value="texto_curto">Texto curto</option>
                      <option value="numero">Número</option>
                      <option value="data">Data</option>
                      <option value="email">Email</option>
                      <option value="arquivo">Arquivo</option>
                      <option value="multipla_escolha">Múltipla escolha</option>
                      <option value="multipla_selecao">Múltipla seleção</option>
                    </select>
                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={p.obrigatoria}
                        onChange={(e) =>
                          updatePergunta(i, "obrigatoria", e.target.checked)
                        }
                      />
                      Obrigatória
                    </label>
                  </div>

                  {(p.tipo === "multipla_escolha" ||
                    p.tipo === "multipla_selecao") && (
                    <div className="opcoes-list">
                      {(p.opcoes || []).map((opt, j) => (
                        <div key={j} className="field-row">
                          <input
                            type="text"
                            placeholder={`Opção ${j + 1}`}
                            value={opt}
                            onChange={(e) => updateOpcao(i, j, e.target.value)}
                          />
                          <button
                            className="btn-small danger"
                            onClick={() => removeOpcao(i, j)}
                            aria-label="Remover opção"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button className="btn-small" onClick={() => addOpcao(i)}>
                        <Plus size={14} /> Adicionar opção
                      </button>
                    </div>
                  )}

                  <div className="pergunta-actions">
                    <button
                      className="btn-delete-timeline"
                      title="Excluir pergunta"
                      aria-label="Excluir pergunta"
                      onClick={() => deletePergunta(i)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-actions">
              <button className="btn-primary-outline" onClick={addPergunta}>
                <Plus size={16} /> Adicionar pergunta
              </button>
            </div>
          </>
        )}
      </div>

      <div className="drawer-footer">
        <button className="btn-save-footer" onClick={onSave}>
          <Save size={16} /> Aplicar alterações
        </button>
      </div>
    </aside>
  );
};

export default QuestionarioDrawer;
