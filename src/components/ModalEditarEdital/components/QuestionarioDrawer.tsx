import React from "react";
import { ArrowLeft, Edit, Plus, Trash2, FileText } from "lucide-react";
import { PerguntaEditorItem, EditableQuestionario } from "../types";
import PerguntaItem from "./PerguntaItem";

interface QuestionarioDrawerProps {
  isOpen: boolean;
  loading: boolean;
  questionarios: EditableQuestionario[];
  activeQuestionarioIndex: number | null;
  titleEditing: boolean;
  perguntas: PerguntaEditorItem[];
  onClose: () => void;
  onQuestionarioSelect: (index: number) => void;
  onTitleChange: (title: string) => void;
  onTitleEditToggle: (editing: boolean) => void;
  onPerguntasChange: (perguntas: PerguntaEditorItem[]) => void;
  onSave: () => void;
  adicionarQuestionario: () => void;
  removerQuestionario: (index: number) => void;
}

const QuestionarioDrawer: React.FC<QuestionarioDrawerProps> = ({
  isOpen,
  questionarios,
  activeQuestionarioIndex,
  titleEditing,
  perguntas,
  onClose,
  onQuestionarioSelect,
  onTitleChange,
  onTitleEditToggle,
  onPerguntasChange,
  adicionarQuestionario,
  removerQuestionario,
}) => {
  const updatePergunta = (
    index: number,
    field: keyof PerguntaEditorItem | Record<string, any>,
    value?: any
  ) => {
    const list = [...perguntas];

    // Suporta atualização de múltiplos campos de uma vez
    if (typeof field === "object") {
      list[index] = { ...list[index], ...field };
    } else {
      list[index] = { ...list[index], [field]: value };
    }

    // Se o tipo mudar para múltipla escolha/seleção, garante opcoes
    const updatedTipo =
      typeof field === "object"
        ? field.tipo
        : field === "tipo"
          ? value
          : list[index].tipo;
    if (
      updatedTipo === "multipla_escolha" ||
      updatedTipo === "multipla_selecao"
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
      isEditing: true,
    };
    onPerguntasChange([...perguntas, newPergunta]);
  };

  const togglePerguntaEditing = (index: number) => {
    const list = [...perguntas];
    list[index].isEditing = !list[index].isEditing;
    onPerguntasChange(list);
  };

  const savePergunta = (index: number) => {
    const list = [...perguntas];
    if (list[index].texto.trim()) {
      list[index].isEditing = false;
      onPerguntasChange(list);
    }
  };

  if (!isOpen) return null;

  const activeQuestionario =
    activeQuestionarioIndex !== null
      ? questionarios[activeQuestionarioIndex]
      : null;

  return (
    <div className="questionario-expanded-sidebar">
      {/* Header com botão voltar */}
      <div className="questionario-expanded-header">
        <button onClick={onClose} className="questionario-back-button">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h2>Editor de Questionários</h2>
      </div>

      <div className="questionario-expanded-content">
        {/* Lista de questionários na lateral esquerda */}
        <div className="questionario-list-sidebar">
          <div className="questionario-list-header">
            <h3>Questionários</h3>
            <button
              onClick={adicionarQuestionario}
              className="add-questionario-button"
            >
              <Plus size={16} />
              Novo
            </button>
          </div>

          <div className="questionario-list">
            {questionarios.map((questionario, index) => {
              // Se é o questionário ativo, usa as perguntas reais, senão usa previewPerguntas
              const numPerguntas =
                activeQuestionarioIndex === index
                  ? perguntas.length
                  : questionario.value.previewPerguntas?.length || 0;

              return (
                <div
                  key={index}
                  className={`questionario-list-item ${
                    activeQuestionarioIndex === index ? "active" : ""
                  }`}
                >
                  <div
                    className="questionario-item-content"
                    onClick={() => onQuestionarioSelect(index)}
                  >
                    <FileText size={16} />
                    <span>
                      {questionario.value.nome || `Questionário ${index + 1}`}
                    </span>
                  </div>
                  <div className="questionario-item-actions">
                    <span
                      className="questionario-perguntas-badge"
                      title={`${numPerguntas} pergunta${numPerguntas !== 1 ? "s" : ""}`}
                    >
                      {numPerguntas}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removerQuestionario(index);
                      }}
                      className="remove-questionario-button"
                      title="Remover questionário"
                      aria-label="Remover questionário"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Área principal de edição */}
        <div className="questionario-editor-area">
          {activeQuestionario ? (
            <>
              {/* Header do questionário */}
              <div className="questionario-editor-header">
                <div className="questionario-title-section">
                  {titleEditing ? (
                    <input
                      type="text"
                      value={activeQuestionario.value.nome || ""}
                      onChange={(e) => onTitleChange(e.target.value)}
                      onBlur={() => onTitleEditToggle(false)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") onTitleEditToggle(false);
                      }}
                      placeholder="Nome do questionário"
                      autoFocus
                      className="questionario-title-input"
                    />
                  ) : (
                    <h3
                      onClick={() => onTitleEditToggle(true)}
                      className="questionario-title"
                    >
                      {activeQuestionario.value.nome || "Questionário sem nome"}
                      <Edit size={16} className="edit-icon" />
                    </h3>
                  )}
                </div>

                <div className="questionario-actions">
                  <button onClick={addPergunta} className="add-question-button">
                    <Plus size={16} />
                    Nova Pergunta
                  </button>
                </div>
              </div>

              {/* Lista de perguntas */}
              <div className="perguntas-list">
                {perguntas.map((pergunta, index) => (
                  <PerguntaItem
                    key={index}
                    pergunta={pergunta}
                    index={index}
                    onUpdate={(field, value) =>
                      updatePergunta(index, field, value)
                    }
                    onUpdateOpcao={(opcaoIndex, value) =>
                      updateOpcao(index, opcaoIndex, value)
                    }
                    onAddOpcao={() => addOpcao(index)}
                    onRemoveOpcao={(opcaoIndex) =>
                      removeOpcao(index, opcaoIndex)
                    }
                    onDelete={() => deletePergunta(index)}
                    onToggleEditing={() => togglePerguntaEditing(index)}
                    onSave={() => savePergunta(index)}
                  />
                ))}

                {perguntas.length === 0 && (
                  <div className="empty-perguntas">
                    <p>Nenhuma pergunta adicionada ainda.</p>
                    <button
                      onClick={addPergunta}
                      className="add-first-question"
                    >
                      <Plus size={16} />
                      Adicionar primeira pergunta
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-questionario-selected">
              <FileText size={48} />
              <p>Selecione um questionário para começar a editar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionarioDrawer;
