import React from "react";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { EditableQuestionario } from "../types";

interface QuestionariosSectionProps {
  questionarios: EditableQuestionario[];
  openQuestionarios: boolean;
  onQuestionariosChange: (questionarios: EditableQuestionario[]) => void;
  onToggleOpen: () => void;
  onOpenQuestionario: (index: number) => void;
}

const QuestionariosSection: React.FC<QuestionariosSectionProps> = ({
  questionarios,
  openQuestionarios,
  onQuestionariosChange,
  onToggleOpen,
  onOpenQuestionario,
}) => {
  const updateQuestionario = (
    index: number,
    field: keyof EditableQuestionario["value"],
    value: any
  ) => {
    const list = [...questionarios];
    list[index].value = { ...list[index].value, [field]: value };
    onQuestionariosChange(list);
  };

  const toggleQuestionarioEditing = (index: number, editing: boolean) => {
    const list = [...questionarios];
    list[index].isEditing = editing;
    onQuestionariosChange(list);
  };

  const deleteQuestionario = (index: number) => {
    const newList = questionarios.filter((_, i) => i !== index);
    onQuestionariosChange(newList);
  };

  const addQuestionario = () => {
    const newQuestionario: EditableQuestionario = {
      value: { titulo: "", nome: "", previewPerguntas: [] },
      isEditing: true,
    };
    onQuestionariosChange([...questionarios, newQuestionario]);
  };

  const saveQuestionario = (index: number) => {
    const questionario = questionarios[index];
    if (questionario.value.titulo.trim().length > 0) {
      toggleQuestionarioEditing(index, false);
    }
  };

  return (
    <section className="questionarios-section-full section-card">
      <div className="section-header-modal" onClick={onToggleOpen}>
        <div className="section-title">
          <h3>
            <FileText size={20} /> Questionários
          </h3>
          <p className="section-subtitle">
            Organize formulários em seções com prévia de perguntas
          </p>
        </div>
        <button
          className={`section-toggle ${openQuestionarios ? "open" : ""}`}
          aria-label="Alternar questionários"
          title="Alternar questionários"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {openQuestionarios && (
        <div className="questionarios-grid section-body">
          {questionarios.map((q, index) => (
            <div key={index} className="questionario-item">
              {q.isEditing ? (
                <div className="questionario-editing">
                  <input
                    type="text"
                    placeholder="Título do questionário"
                    value={q.value.titulo}
                    onChange={(e) =>
                      updateQuestionario(index, "titulo", e.target.value)
                    }
                    className="questionario-input"
                  />
                  <div className="questionario-actions">
                    <button
                      aria-label="Salvar questionário"
                      title="Salvar questionário"
                      onClick={() => saveQuestionario(index)}
                      className="btn-save-questionario"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      aria-label="Excluir questionário"
                      title="Excluir questionário"
                      onClick={() => deleteQuestionario(index)}
                      className="btn-delete-questionario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="questionario-display"
                  onClick={() => onOpenQuestionario(index)}
                >
                  <div className="questionario-preview">
                    {q.value.previewPerguntas &&
                    q.value.previewPerguntas.length > 0 ? (
                      <div
                        className="preview-list"
                        title={q.value.previewPerguntas.join("\n")}
                      >
                        {q.value.previewPerguntas
                          .filter((t) => (t || "").trim().length > 0)
                          .slice(0, 4)
                          .map((t, i) => (
                            <p key={i} className="preview-line">
                              {t}
                            </p>
                          ))}
                      </div>
                    ) : (
                      <div className="preview-empty">Sem perguntas</div>
                    )}
                  </div>
                  <div className="questionario-header">
                    <h4 title={q.value.titulo}>
                      {q.value.titulo || "Sem título"}
                    </h4>
                    <div className="questionario-meta">
                      <span className="questionario-count">
                        {q.value.previewPerguntas?.length || 0}{" "}
                        {(q.value.previewPerguntas?.length || 0) === 1
                          ? "pergunta"
                          : "perguntas"}
                      </span>
                      <ChevronRight className="open-indicator" size={16} />
                      <div className="questionario-actions">
                        {/* Actions will be handled by the parent component */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {questionarios.length === 0 && (
            <div className="empty-state">Nenhum questionário adicionado.</div>
          )}
          <button onClick={addQuestionario} className="btn-add-questionario">
            <Plus size={16} />
            Adicionar Questionário
          </button>
        </div>
      )}
    </section>
  );
};

export default QuestionariosSection;
