import React from "react";
import { Users, ChevronDown, Edit, Save, Trash2, Plus } from "lucide-react";
import { EditableVaga } from "../types";

interface VagasSectionProps {
  vagas: EditableVaga[];
  openVagas: boolean;
  editalId: number;
  onVagasChange: (vagas: EditableVaga[]) => void;
  onToggleOpen: () => void;
}

const VagasSection: React.FC<VagasSectionProps> = ({
  vagas,
  openVagas,
  editalId,
  onVagasChange,
  onToggleOpen,
}) => {
  const updateVaga = (
    index: number,
    field: keyof EditableVaga["value"],
    value: any
  ) => {
    const newVagas = [...vagas];
    newVagas[index].value = { ...newVagas[index].value, [field]: value };
    onVagasChange(newVagas);
  };

  const toggleVagaEditing = (index: number, editing: boolean) => {
    const newVagas = [...vagas];
    newVagas[index].isEditing = editing;
    onVagasChange(newVagas);
  };

  const deleteVaga = (index: number) => {
    const newVagas = vagas.filter((_, i) => i !== index);
    onVagasChange(newVagas);
  };

  const addVaga = () => {
    const newVaga: EditableVaga = {
      value: {
        edital_id: editalId,
        beneficio: "",
        descricao_beneficio: "",
        numero_vagas: 1,
      },
      isEditing: true,
    };
    onVagasChange([...vagas, newVaga]);
  };

  const saveVaga = (index: number) => {
    const vaga = vagas[index];
    if (vaga.value.beneficio && vaga.value.numero_vagas > 0) {
      toggleVagaEditing(index, false);
    }
  };

  return (
    <section className="vagas-section-full section-card">
      <div className="section-header-modal" onClick={onToggleOpen}>
        <div className="section-title">
          <h3>
            <Users size={20} /> Vagas
          </h3>
          <p className="section-subtitle">
            Gerencie benefícios, quantidades e descrições
          </p>
        </div>
        <button
          className={`section-toggle ${openVagas ? "open" : ""}`}
          aria-label="Alternar vagas"
          title="Alternar vagas"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {openVagas && (
        <div className="vagas-list section-body">
          {vagas.map((vaga, index) => (
            <div key={index} className="vaga-item">
              {vaga.isEditing ? (
                <div className="vaga-editing">
                  <input
                    type="text"
                    placeholder="Benefício"
                    value={vaga.value.beneficio}
                    onChange={(e) =>
                      updateVaga(index, "beneficio", e.target.value)
                    }
                    className="vaga-input"
                  />
                  <input
                    type="number"
                    placeholder="Número de vagas"
                    value={vaga.value.numero_vagas}
                    onChange={(e) =>
                      updateVaga(
                        index,
                        "numero_vagas",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="vaga-number"
                    min={0}
                  />
                  <textarea
                    placeholder="Descrição do benefício"
                    value={vaga.value.descricao_beneficio}
                    onChange={(e) =>
                      updateVaga(index, "descricao_beneficio", e.target.value)
                    }
                    className="vaga-textarea"
                    rows={2}
                  />
                  <div className="vaga-actions">
                    <button
                      aria-label="Salvar vaga"
                      title="Salvar vaga"
                      onClick={() => saveVaga(index)}
                      className="btn-save-vaga"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      aria-label="Excluir vaga"
                      title="Excluir vaga"
                      onClick={() => deleteVaga(index)}
                      className="btn-delete-vaga"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="vaga-display">
                  <div className="vaga-content">
                    <div className="vaga-header">
                      <h4>{vaga.value.beneficio}</h4>
                      <span className="vaga-count">
                        {vaga.value.numero_vagas} vagas
                      </span>
                    </div>
                    {vaga.value.descricao_beneficio && (
                      <p className="vaga-description">
                        {vaga.value.descricao_beneficio}
                      </p>
                    )}
                  </div>
                  <div className="vaga-actions">
                    <button
                      aria-label="Editar vaga"
                      title="Editar vaga"
                      onClick={() => toggleVagaEditing(index, true)}
                      className="btn-edit-vaga"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      aria-label="Excluir vaga"
                      title="Excluir vaga"
                      onClick={() => deleteVaga(index)}
                      className="btn-delete-vaga"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {vagas.length === 0 && (
            <div className="empty-state">Nenhuma vaga adicionada.</div>
          )}
          <button onClick={addVaga} className="btn-add-vaga">
            <Plus size={16} />
            Adicionar Vaga
          </button>
        </div>
      )}
    </section>
  );
};

export default VagasSection;
