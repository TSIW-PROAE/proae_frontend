import React from "react";
import { Calendar, ChevronDown, Edit, Save, Trash2, Plus } from "lucide-react";
import { EditableEtapa } from "../types";

interface CronogramaSectionProps {
  etapas: EditableEtapa[];
  openCronograma: boolean;
  onEtapasChange: (etapas: EditableEtapa[]) => void;
  onToggleOpen: () => void;
}

const CronogramaSection: React.FC<CronogramaSectionProps> = ({
  etapas,
  openCronograma,
  onEtapasChange,
  onToggleOpen,
}) => {
  const updateEtapa = (
    index: number,
    field: keyof EditableEtapa["value"],
    value: any
  ) => {
    const newEtapas = [...etapas];
    newEtapas[index].value = { ...newEtapas[index].value, [field]: value };
    onEtapasChange(newEtapas);
  };

  const toggleEtapaEditing = (index: number, editing: boolean) => {
    const newEtapas = [...etapas];
    newEtapas[index].isEditing = editing;
    onEtapasChange(newEtapas);
  };

  const deleteEtapa = (index: number) => {
    const newEtapas = etapas.filter((_, i) => i !== index);
    onEtapasChange(newEtapas);
  };

  const addEtapa = () => {
    const newEtapa: EditableEtapa = {
      value: {
        etapa: "",
        ordem_elemento: etapas.length + 1,
        data_inicio: "",
        data_fim: "",
      },
      isEditing: true,
    };
    onEtapasChange([...etapas, newEtapa]);
  };

  const saveEtapa = (index: number) => {
    const etapa = etapas[index];
    if (etapa.value.etapa && etapa.value.data_inicio && etapa.value.data_fim) {
      toggleEtapaEditing(index, false);
    }
  };

  return (
    <section className="timeline-section-full section-card">
      <div className="section-header-modal" onClick={onToggleOpen}>
        <div className="section-title">
          <h3>
            <Calendar size={20} /> Cronograma
          </h3>
          <p className="section-subtitle">
            Defina as etapas e períodos do processo seletivo
          </p>
        </div>
        <button
          className={`section-toggle ${openCronograma ? "open" : ""}`}
          aria-label="Alternar cronograma"
          title="Alternar cronograma"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {openCronograma && (
        <div className="timeline-container section-body">
          {etapas.map((etapa, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              {etapa.isEditing ? (
                <div className="timeline-editing">
                  <input
                    type="text"
                    placeholder="Nome da etapa"
                    value={etapa.value.etapa}
                    onChange={(e) =>
                      updateEtapa(index, "etapa", e.target.value)
                    }
                    className="timeline-input"
                  />
                  <div className="timeline-dates">
                    <input
                      type="date"
                      value={etapa.value.data_inicio}
                      title="Data de início"
                      onChange={(e) =>
                        updateEtapa(index, "data_inicio", e.target.value)
                      }
                      className="date-input"
                    />
                    <span>até</span>
                    <input
                      type="date"
                      value={etapa.value.data_fim}
                      title="Data de término"
                      onChange={(e) =>
                        updateEtapa(index, "data_fim", e.target.value)
                      }
                      className="date-input"
                    />
                  </div>
                  <div className="timeline-actions">
                    <button
                      aria-label="Salvar etapa"
                      title="Salvar etapa"
                      onClick={() => saveEtapa(index)}
                      className="btn-save-timeline"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      aria-label="Excluir etapa"
                      title="Excluir etapa"
                      onClick={() => deleteEtapa(index)}
                      className="btn-delete-timeline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="timeline-display">
                  <div className="timeline-content">
                    <h4>{etapa.value.etapa}</h4>
                    <div className="timeline-period">
                      {new Date(etapa.value.data_inicio).toLocaleDateString(
                        "pt-BR"
                      )}{" "}
                      -{" "}
                      {new Date(etapa.value.data_fim).toLocaleDateString(
                        "pt-BR"
                      )}
                    </div>
                  </div>
                  <div className="timeline-actions">
                    <button
                      aria-label="Editar etapa"
                      title="Editar etapa"
                      onClick={() => toggleEtapaEditing(index, true)}
                      className="btn-edit-timeline"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      aria-label="Excluir etapa"
                      title="Excluir etapa"
                      onClick={() => deleteEtapa(index)}
                      className="btn-delete-timeline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button onClick={addEtapa} className="btn-add-timeline">
            <Plus size={16} />
            Adicionar Etapa
          </button>
        </div>
      )}
    </section>
  );
};

export default CronogramaSection;
