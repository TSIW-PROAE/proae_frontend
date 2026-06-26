import React from "react";
import { Calendar, ChevronDown, Edit, Save, Trash2, Plus, AlertTriangle } from "lucide-react";
import { EditableEtapa } from "../types";

interface CronogramaSectionProps {
  etapas: EditableEtapa[];
  openCronograma: boolean;
  onEtapasChange: (etapas: EditableEtapa[]) => void;
  onToggleOpen: () => void;
  onPersist?: (etapas: EditableEtapa[]) => void;
}

const ETAPA_TIPO_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Sem tipo (opcional)" },
  { value: "INSCRICAO", label: "Inscrição" },
  { value: "RESULTADO_PRELIMINAR", label: "Resultado preliminar" },
  { value: "RECURSO", label: "Recurso" },
  { value: "RESULTADO_FINAL", label: "Resultado final" },
  { value: "ACOMPANHAMENTO", label: "Acompanhamento" },
];

/**
 * Ordena as etapas por data_inicio e recalcula ordem_elemento automaticamente.
 */
const sortAndReindex = (etapas: EditableEtapa[]): EditableEtapa[] => {
  const sorted = [...etapas].sort((a, b) => {
    const dateA = a.value.data_inicio ? new Date(a.value.data_inicio).getTime() : Infinity;
    const dateB = b.value.data_inicio ? new Date(b.value.data_inicio).getTime() : Infinity;
    return dateA - dateB;
  });
  return sorted.map((etapa, idx) => ({
    ...etapa,
    value: { ...etapa.value, ordem_elemento: idx + 1 },
  }));
};

/**
 * Verifica se uma etapa com as datas informadas conflita (sobrepõe) com alguma outra etapa já existente.
 * Retorna true se houver conflito.
 *
 * Importante: usamos comparação **estrita** (`<`/`>`), de modo que duas
 * etapas adjacentes — uma terminando no mesmo dia em que a próxima começa,
 * ou em dias subsequentes — NÃO são consideradas em conflito. Antes, com
 * `<=`/`>=`, o sistema rejeitava esse encadeamento natural (por exemplo:
 * "Análise: 10–15/05" e "Resultado: 15/05–20/05") e impedia administradores
 * de editar etapas em dias subsequentes.
 *
 * Datas inválidas / vazias são ignoradas para não bloquear a digitação em
 * estados intermediários (o usuário pode estar prestes a corrigir o valor).
 */
const hasDateOverlap = (etapas: EditableEtapa[], currentIndex: number, dataInicio: string, dataFim: string): boolean => {
  if (!dataInicio || !dataFim) return false;
  const newStart = new Date(dataInicio).getTime();
  const newEnd = new Date(dataFim).getTime();
  if (Number.isNaN(newStart) || Number.isNaN(newEnd)) return false;
  // Inversão: ainda não validamos aqui, deixamos para o save final.
  if (newStart > newEnd) return false;

  return etapas.some((etapa, idx) => {
    if (idx === currentIndex) return false;
    if (!etapa.value.data_inicio || !etapa.value.data_fim) return false;
    const existStart = new Date(etapa.value.data_inicio).getTime();
    const existEnd = new Date(etapa.value.data_fim).getTime();
    if (Number.isNaN(existStart) || Number.isNaN(existEnd)) return false;
    // Sobreposição estrita: o novo intervalo começa **antes** do fim do
    // existente E termina **depois** do início do existente.
    return newStart < existEnd && newEnd > existStart;
  });
};

const CronogramaSection: React.FC<CronogramaSectionProps> = ({ etapas, openCronograma, onEtapasChange, onToggleOpen, onPersist }) => {
  const [overlapWarning, setOverlapWarning] = React.useState<string | null>(null);

  const updateEtapa = (index: number, field: keyof EditableEtapa["value"], value: any) => {
    const newEtapas = [...etapas];
    newEtapas[index] = {
      ...newEtapas[index],
      value: { ...newEtapas[index].value, [field]: value },
    };

    // Verificar conflito de datas em tempo real apenas quando ambas as
    // datas estão preenchidas e formam um intervalo coerente — caso
    // contrário o aviso aparecia "tremendo" enquanto o usuário ainda
    // estava terminando de digitar a segunda data.
    if (field === "data_inicio" || field === "data_fim") {
      const di = field === "data_inicio" ? value : newEtapas[index].value.data_inicio;
      const df = field === "data_fim" ? value : newEtapas[index].value.data_fim;
      const tStart = di ? new Date(di).getTime() : NaN;
      const tEnd = df ? new Date(df).getTime() : NaN;
      const intervaloCoerente =
        !Number.isNaN(tStart) && !Number.isNaN(tEnd) && tStart <= tEnd;
      if (intervaloCoerente && hasDateOverlap(newEtapas, index, di, df)) {
        setOverlapWarning(`As datas da etapa "${newEtapas[index].value.etapa || "(sem nome)"}" conflitam com outra etapa existente.`);
      } else {
        setOverlapWarning(null);
      }
    }

    onEtapasChange(newEtapas);
  };

  const toggleEtapaEditing = (index: number, editing: boolean) => {
    const newEtapas = [...etapas];
    newEtapas[index] = { ...newEtapas[index], isEditing: editing };
    onEtapasChange(newEtapas);
  };

  const deleteEtapa = (index: number) => {
    const newEtapas = etapas.filter((_, i) => i !== index);
    // Reordenar automaticamente após exclusão
    const sorted = sortAndReindex(newEtapas);
    onEtapasChange(sorted);
    onPersist?.(sorted);
    setOverlapWarning(null);
  };

  const addEtapa = () => {
    const newEtapa: EditableEtapa = {
      value: {
        etapa: "",
        tipo_etapa: "",
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
    if (!etapa.value.etapa || !etapa.value.data_inicio || !etapa.value.data_fim) return;

    // Validação: data de início não pode ser posterior à data de fim.
    const ti = new Date(etapa.value.data_inicio).getTime();
    const tf = new Date(etapa.value.data_fim).getTime();
    if (!Number.isNaN(ti) && !Number.isNaN(tf) && ti > tf) {
      setOverlapWarning(
        `A data de início da etapa "${etapa.value.etapa}" é posterior à data de término. Ajuste para continuar.`,
      );
      return;
    }

    // Bloquear se houver conflito de datas
    if (hasDateOverlap(etapas, index, etapa.value.data_inicio, etapa.value.data_fim)) {
      setOverlapWarning(`Não é possível salvar: as datas da etapa "${etapa.value.etapa}" conflitam com outra etapa já existente. Altere as datas.`);
      return;
    }

    setOverlapWarning(null);

    // Salva (sai do modo edição) e reordena todas as etapas por data
    const newEtapas = [...etapas];
    newEtapas[index] = { ...newEtapas[index], isEditing: false };
    const sorted = sortAndReindex(newEtapas);
    onEtapasChange(sorted);
    onPersist?.(sorted);
  };

  return (
    <section className="timeline-section-full section-card">
      <div className="section-header-modal" onClick={onToggleOpen}>
        <div className="section-title">
          <h3>
            <Calendar size={20} /> Cronograma
          </h3>
          <p className="section-subtitle">Defina as etapas e períodos do processo seletivo</p>
        </div>
        <button className={`section-toggle ${openCronograma ? "open" : ""}`} aria-label="Alternar cronograma" title="Alternar cronograma">
          <ChevronDown size={18} />
        </button>
      </div>
      {openCronograma && (
        <div className="timeline-container section-body">
          {overlapWarning && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                marginBottom: "0.75rem",
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                color: "#856404",
                fontSize: "0.875rem",
              }}
            >
              <AlertTriangle size={16} />
              {overlapWarning}
            </div>
          )}
          {etapas.map((etapa, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              {etapa.isEditing ? (
                <div className="timeline-editing">
                  <input
                    type="text"
                    placeholder="Nome da etapa"
                    value={etapa.value.etapa}
                    onChange={(e) => updateEtapa(index, "etapa", e.target.value)}
                    className="timeline-input"
                  />
                  <select
                    value={etapa.value.tipo_etapa || ""}
                    onChange={(e) => updateEtapa(index, "tipo_etapa", e.target.value)}
                    className="date-input"
                    title="Tipo da etapa (opcional)"
                  >
                    {ETAPA_TIPO_OPTIONS.map((opt) => (
                      <option key={opt.value || "none"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="timeline-dates">
                    <input
                      type="date"
                      value={etapa.value.data_inicio}
                      title="Data de início"
                      onChange={(e) => updateEtapa(index, "data_inicio", e.target.value)}
                      className="date-input"
                    />
                    <span className="timeline-dates-separator">até</span>
                    <input
                      type="date"
                      value={etapa.value.data_fim}
                      title="Data de término"
                      onChange={(e) => updateEtapa(index, "data_fim", e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <div className="timeline-actions">
                    <button aria-label="Salvar etapa" title="Salvar etapa" onClick={() => saveEtapa(index)} className="btn-save-timeline">
                      <Save size={16} />
                    </button>
                    <button aria-label="Excluir etapa" title="Excluir etapa" onClick={() => deleteEtapa(index)} className="btn-delete-timeline">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="timeline-display">
                  <div className="timeline-content">
                    <h4>{etapa.value.etapa}</h4>
                    {etapa.value.tipo_etapa && (
                      <div className="timeline-period">
                        Tipo: {etapa.value.tipo_etapa}
                      </div>
                    )}
                    <div className="timeline-period">
                      {new Date(etapa.value.data_inicio).toLocaleDateString("pt-BR")} - {new Date(etapa.value.data_fim).toLocaleDateString("pt-BR")}
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
                    <button aria-label="Excluir etapa" title="Excluir etapa" onClick={() => deleteEtapa(index)} className="btn-delete-timeline">
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
