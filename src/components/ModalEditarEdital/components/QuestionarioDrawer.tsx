import React from "react";
import { ArrowLeft, Edit, Save, Plus, Trash2, FileText } from "lucide-react";
import { PerguntaEditorItem, EditableQuestionario } from "../types";

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
  loading,
  questionarios,
  activeQuestionarioIndex,
  titleEditing,
  perguntas,
  onClose,
  onQuestionarioSelect,
  onTitleChange,
  onTitleEditToggle,
  onPerguntasChange,
  onSave,
  adicionarQuestionario,
  removerQuestionario,
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
            {questionarios.map((questionario, index) => (
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
            ))}
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
                  <button
                    onClick={onSave}
                    className="save-button"
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>

              {/* Lista de perguntas */}
              <div className="perguntas-list">
                {perguntas.map((pergunta, index) => (
                  <div
                    key={index}
                    className={`pergunta-item ${pergunta.isEditing ? "editing" : "saved"}`}
                  >
                    {pergunta.isEditing ? (
                      // Estado de edição
                      <>
                        <div className="pergunta-header">
                          <span className="pergunta-numero">
                            Pergunta {index + 1}
                          </span>
                          <div className="pergunta-actions">
                            <button
                              onClick={() => savePergunta(index)}
                              className="save-pergunta-button"
                              title="Salvar pergunta"
                              aria-label="Salvar pergunta"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => deletePergunta(index)}
                              className="delete-pergunta-button"
                              title="Excluir pergunta"
                              aria-label="Excluir pergunta"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="pergunta-content">
                          <div className="pergunta-field">
                            <label>Texto da pergunta:</label>
                            <textarea
                              value={pergunta.texto}
                              onChange={(e) =>
                                updatePergunta(index, "texto", e.target.value)
                              }
                              placeholder="Digite a pergunta..."
                              rows={2}
                            />
                          </div>

                          <div className="pergunta-field">
                            <label>Tipo de resposta:</label>
                            <select
                              value={pergunta.tipo}
                              onChange={(e) =>
                                updatePergunta(index, "tipo", e.target.value)
                              }
                              aria-label="Tipo de resposta"
                            >
                              <option value="texto">Texto</option>
                              <option value="numero">Número</option>
                              <option value="multipla_escolha">
                                Múltipla Escolha
                              </option>
                              <option value="multipla_selecao">
                                Múltipla Seleção
                              </option>
                              <option value="data">Data</option>
                              <option value="arquivo">Arquivo</option>
                            </select>
                          </div>

                          <div className="pergunta-field">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={pergunta.obrigatoria}
                                onChange={(e) =>
                                  updatePergunta(
                                    index,
                                    "obrigatoria",
                                    e.target.checked
                                  )
                                }
                              />
                              Pergunta obrigatória
                            </label>
                          </div>

                          {/* Opções para múltipla escolha/seleção */}
                          {(pergunta.tipo === "multipla_escolha" ||
                            pergunta.tipo === "multipla_selecao") && (
                            <div className="pergunta-opcoes">
                              <label>Opções:</label>
                              {pergunta.opcoes?.map((opcao, opcaoIndex) => (
                                <div key={opcaoIndex} className="opcao-item">
                                  <input
                                    type="text"
                                    value={opcao}
                                    onChange={(e) =>
                                      updateOpcao(
                                        index,
                                        opcaoIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Opção ${opcaoIndex + 1}`}
                                  />
                                  <button
                                    onClick={() =>
                                      removeOpcao(index, opcaoIndex)
                                    }
                                    className="remove-opcao-button"
                                    title="Remover opção"
                                    aria-label="Remover opção"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => addOpcao(index)}
                                className="add-opcao-button"
                              >
                                <Plus size={14} />
                                Adicionar opção
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // Estado salvo
                      <>
                        <div className="pergunta-header">
                          <div className="pergunta-info">
                            <span className="pergunta-numero">
                              Pergunta {index + 1}
                            </span>
                            <span className="pergunta-tipo-badge">
                              {pergunta.tipo === "multipla_escolha"
                                ? "Múltipla Escolha"
                                : pergunta.tipo === "multipla_selecao"
                                  ? "Múltipla Seleção"
                                  : pergunta.tipo === "texto"
                                    ? "Texto"
                                    : pergunta.tipo === "numero"
                                      ? "Número"
                                      : pergunta.tipo === "data"
                                        ? "Data"
                                        : pergunta.tipo === "arquivo"
                                          ? "Arquivo"
                                          : "Email"}
                            </span>
                            {pergunta.obrigatoria && (
                              <span className="obrigatoria-badge">
                                Obrigatória
                              </span>
                            )}
                          </div>
                          <div className="pergunta-actions">
                            <button
                              onClick={() => togglePerguntaEditing(index)}
                              className="edit-pergunta-button"
                              title="Editar pergunta"
                              aria-label="Editar pergunta"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deletePergunta(index)}
                              className="delete-pergunta-button"
                              title="Excluir pergunta"
                              aria-label="Excluir pergunta"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="pergunta-preview">
                          <p className="pergunta-texto">
                            {pergunta.texto || "Pergunta sem texto"}
                          </p>
                          {(pergunta.tipo === "multipla_escolha" ||
                            pergunta.tipo === "multipla_selecao") &&
                            pergunta.opcoes &&
                            pergunta.opcoes.length > 0 && (
                              <div className="opcoes-preview">
                                {pergunta.opcoes
                                  .filter((opcao) => opcao.trim())
                                  .map((opcao, opcaoIndex) => (
                                    <span
                                      key={opcaoIndex}
                                      className="opcao-preview"
                                    >
                                      {opcao}
                                    </span>
                                  ))}
                              </div>
                            )}
                        </div>
                      </>
                    )}
                  </div>
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
