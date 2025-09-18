import React from "react";
import { Edit, ChevronDown } from "lucide-react";

interface DescricaoSectionProps {
  descricao: string;
  descricaoEditando: boolean;
  openDescricao: boolean;
  onDescricaoChange: (descricao: string) => void;
  onDescricaoEditToggle: (editing: boolean) => void;
  onDescricaoSave: () => void;
  onToggleOpen: () => void;
}

const DescricaoSection: React.FC<DescricaoSectionProps> = ({
  descricao,
  descricaoEditando,
  openDescricao,
  onDescricaoChange,
  onDescricaoEditToggle,
  onDescricaoSave,
  onToggleOpen,
}) => {
  return (
    <section className="section-card">
      <div className="section-header-modal" onClick={onToggleOpen}>
        <div className="section-title">
          <h3>Descrição</h3>
          <p className="section-subtitle">
            Resumo claro sobre o edital para orientar o aluno
          </p>
        </div>
        <button
          className={`section-toggle ${openDescricao ? "open" : ""}`}
          aria-label="Alternar descrição"
          title="Alternar descrição"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {openDescricao && (
        <div className="section-body">
          {descricaoEditando ? (
            <div className="descricao-editing">
              <textarea
                value={descricao}
                onChange={(e) => onDescricaoChange(e.target.value)}
                className="descricao-textarea"
                rows={4}
                autoFocus
                onBlur={onDescricaoSave}
                placeholder="Descrição do edital"
                title="Descrição do edital"
              />
            </div>
          ) : (
            <div
              className="descricao-display"
              onClick={() => onDescricaoEditToggle(true)}
            >
              <p>{descricao || "Clique para adicionar uma descrição"}</p>
              <Edit size={16} className="edit-icon" />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default DescricaoSection;
