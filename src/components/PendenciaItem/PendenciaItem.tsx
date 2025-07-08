// PendenciaItem.tsx
import fileIcon from "@/assets/icons/arquivo-azul-pdf.svg"; // Ícone para mostrar arquivo
import arrowDownIcon from "@/assets/icons/arrow-down-item.svg";
import uploadIcon from "@/assets/icons/upload.svg"; // Ícone para upload
import React, { useState } from "react";
import "./PendenciaItem.css"; // Estilo próprio

export interface Pendencia {
  descricao: string;
  status: string;
}

export interface PendenciaItemProps {
  titulo_edital: string;
  pendencias: Pendencia[]; // Lista de pendências
}

const PendenciaItem: React.FC<PendenciaItemProps> = ({
  titulo_edital,
  pendencias,
}) => {
  const [expandido, setExpandido] = useState(false);

  const alternarExpansao = () => setExpandido(!expandido);

  return (
    <div className="pendencia-item">
      <div className="pendencia-header" onClick={alternarExpansao}>
        <div className="pendencia-titulo">
          <div className="pendencia-titulo">
            <h2>
              {titulo_edital}
            </h2>
          </div>
          <span className="pendencia-status">
            {pendencias.length}{" "}
            {pendencias.length === 1 ? "pendência" : "pendências"}
          </span>
        </div>
        <button className="expand-button" aria-label="Expandir pendência">
          <span className={expandido ? "chevron-up" : "chevron-down"}>
            <img
              src={arrowDownIcon}
              className="arrow-down-icon"
              alt="Expandir detalhes"
            />
          </span>
        </button>
      </div>

      {expandido && (
        <div className="pendencia-detalhes">
          <ul>
            {pendencias.map((pendencia, index) => (
              <li key={index} className="pendencia-item-detalhe">
                <div className="pendencia-info">
                  <p>
                    <span>Tipo:</span> {pendencia.descricao}
                  </p>
                  <p>
                    <span>Status:</span> {pendencia.status}
                  </p>
                </div>
                <div className="pendencia-actions">
                  <button
                    className="action-button"
                    aria-label="Mostrar arquivo"
                  >
                    <img src={fileIcon} alt="Mostrar arquivo" />
                  </button>
                  <button className="action-button" aria-label="Fazer upload">
                    <img src={uploadIcon} alt="Fazer upload" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PendenciaItem;
