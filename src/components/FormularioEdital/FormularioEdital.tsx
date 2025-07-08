import React, { useState, useEffect } from "react";
import {
  Edital,
  CreateEditalRequest,
  UpdateEditalRequest,
  Etapa,
} from "../../types/edital";
import "./FormularioEdital.css";

interface FormularioEditalProps {
  edital?: Edital;
  onSubmit: (edital: CreateEditalRequest | UpdateEditalRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function FormularioEdital({
  edital,
  onSubmit,
  onCancel,
  isLoading = false,
}: FormularioEditalProps) {
  const [formData, setFormData] = useState<CreateEditalRequest>({
    tipo_edital: "Auxilio Transporte",
    descricao: "",
    edital_url: [""],
    titulo_edital: "",
    quantidade_bolsas: 0,
    etapas: [],
  });

  const [etapas, setEtapas] = useState<Etapa[]>([]);

  useEffect(() => {
    if (edital) {
      setFormData({
        tipo_edital: edital.tipo_edital,
        descricao: edital.descricao,
        edital_url: Array.isArray(edital.edital_url) ? edital.edital_url : [],
        titulo_edital: edital.titulo_edital,
        quantidade_bolsas: edital.quantidade_bolsas,
        etapas: edital.etapas,
      });
      setEtapas(Array.isArray(edital.etapas) ? edital.etapas : []);
    }
  }, [edital]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantidade_bolsas" ? parseInt(value) || 0 : value,
    }));
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.edital_url];
    newUrls[index] = value;
    setFormData((prev) => ({
      ...prev,
      edital_url: newUrls,
    }));
  };

  const addUrl = () => {
    setFormData((prev) => ({
      ...prev,
      edital_url: [...prev.edital_url, ""],
    }));
  };

  const removeUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      edital_url: prev.edital_url.filter((_, i) => i !== index),
    }));
  };

  const addEtapa = () => {
    const novaEtapa: Etapa = {
      nome: "",
      ordem: etapas.length + 1,
      data_inicio: "",
      data_fim: "",
    };
    setEtapas([...etapas, novaEtapa]);
  };

  const updateEtapa = (
    index: number,
    field: keyof Etapa,
    value: string | number
  ) => {
    const novasEtapas = [...etapas];
    novasEtapas[index] = {
      ...novasEtapas[index],
      [field]: field === "ordem" ? parseInt(value as string) || 0 : value,
    };
    setEtapas(novasEtapas);
  };

  const removeEtapa = (index: number) => {
    setEtapas(etapas.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      etapas: etapas,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <div className="formulario-edital">
      <h2>{edital ? "Editar Edital" : "Novo Edital"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tipo_edital">Tipo de Edital *</label>
          <select
            id="tipo_edital"
            name="tipo_edital"
            value={formData.tipo_edital}
            onChange={handleInputChange}
            required
          >
            <option value="Auxilio Transporte">Auxílio Transporte</option>
            <option value="Auxilio Alimentação">Auxílio Alimentação</option>
            <option value="Auxilio Moradia">Auxílio Moradia</option>
            <option value="Apoio à Inclusão Digital">
              Apoio à Inclusão Digital
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="titulo_edital">Título do Edital *</label>
          <input
            type="text"
            id="titulo_edital"
            name="titulo_edital"
            value={formData.titulo_edital}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição *</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            required
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantidade_bolsas">Quantidade de Bolsas *</label>
          <input
            type="number"
            id="quantidade_bolsas"
            name="quantidade_bolsas"
            value={formData.quantidade_bolsas}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>URLs do Edital</label>
          {formData.edital_url.map((url, index) => (
            <div key={index} className="url-input-group">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://exemplo.com/edital.pdf"
              />
              <button
                type="button"
                onClick={() => removeUrl(index)}
                className="btn-remove"
              >
                Remover
              </button>
            </div>
          ))}
          <button type="button" onClick={addUrl} className="btn-add">
            Adicionar URL
          </button>
        </div>

        <div className="form-group">
          <label>Etapas do Processo</label>
          {etapas.map((etapa, index) => (
            <div key={index} className="etapa-card">
              <div className="etapa-header">
                <h4>Etapa {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeEtapa(index)}
                  className="btn-remove"
                >
                  Remover
                </button>
              </div>

              <div className="etapa-fields">
                <div className="form-group">
                  <label htmlFor={`etapa-nome-${index}`}>Nome da Etapa</label>
                  <input
                    id={`etapa-nome-${index}`}
                    type="text"
                    value={etapa.nome}
                    onChange={(e) => updateEtapa(index, "nome", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`etapa-ordem-${index}`}>Ordem</label>
                  <input
                    id={`etapa-ordem-${index}`}
                    type="number"
                    value={etapa.ordem}
                    onChange={(e) =>
                      updateEtapa(index, "ordem", e.target.value)
                    }
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`etapa-inicio-${index}`}>
                    Data de Início
                  </label>
                  <input
                    id={`etapa-inicio-${index}`}
                    type="datetime-local"
                    value={etapa.data_inicio.slice(0, 16)}
                    onChange={(e) =>
                      updateEtapa(
                        index,
                        "data_inicio",
                        e.target.value + ":00.000Z"
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`etapa-fim-${index}`}>Data de Fim</label>
                  <input
                    id={`etapa-fim-${index}`}
                    type="datetime-local"
                    value={etapa.data_fim.slice(0, 16)}
                    onChange={(e) =>
                      updateEtapa(
                        index,
                        "data_fim",
                        e.target.value + ":59.999Z"
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEtapa} className="btn-add">
            Adicionar Etapa
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : edital ? "Atualizar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}
