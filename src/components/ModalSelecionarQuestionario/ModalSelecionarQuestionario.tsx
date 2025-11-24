import { X, ClipboardList, FileText } from "lucide-react";
import { StepResponseDto } from "../../types/step";
import "./ModalSelecionarQuestionario.css";

interface ModalSelecionarQuestionarioProps {
  questionarios: StepResponseDto[];
  onSelect: (questionario: StepResponseDto) => void;
  onClose: () => void;
  questionarioAtual: StepResponseDto | null;
}

export default function ModalSelecionarQuestionario({ questionarios, onSelect, onClose, questionarioAtual }: ModalSelecionarQuestionarioProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <h2 className="modal-title">Selecionar Questionário</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Fechar modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {questionarios.length === 0 ? (
            <div className="empty-questionarios">
              <ClipboardList className="w-12 h-12 text-gray-400" />
              <p>Nenhum questionário disponível para este edital</p>
            </div>
          ) : (
            <div className="questionarios-list">
              {questionarios.map((questionario) => (
                <div
                  key={questionario.id}
                  className={`questionario-item ${questionarioAtual?.id === questionario.id ? "selected" : ""}`}
                  onClick={() => onSelect(questionario)}
                >
                  <div className="questionario-item-content">
                    <div className="questionario-item-header">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="questionario-item-title">{questionario.texto || questionario.titulo || `Questionário ${questionario.id}`}</h3>
                    </div>

                    {questionario.perguntas && questionario.perguntas.length > 0 && (
                      <div className="questionario-item-info">
                        <span className="perguntas-count">
                          {questionario.perguntas.length} pergunta{questionario.perguntas.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {questionarioAtual?.id === questionario.id && (
                    <div className="selected-indicator">
                      <div className="selected-checkmark">✓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
