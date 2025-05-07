import React, { useState } from "react";
import { Button } from "@heroui/button";
import arrowDownIcon from "../../assets/icons/arrow-down-item.svg";
import EtapasProgresso from "../EtapasProgresso/EtapasProgresso";
import DocumentoItem from "../DocumentoItem/DocumentoItem";
import "./ProcessoSeletivo.css";

interface Etapa {
  titulo: string;
  dataInicio: string;
  dataFim: string;
}

interface Documento {
  titulo: string;
  url: string;
}

export interface ProcessoSeletivoProps {
  titulo: string;
  codigo: string;
  status: "aberto" | "fechado" | "concluido" | "default";
  inscricoesAbertas: boolean;
  etapas: Etapa[];
  documentos: Documento[];
  onInscrever?: () => void;
  tema?: "dourado" | "azul";
}

const ProcessoSeletivo: React.FC<ProcessoSeletivoProps> = ({
  titulo,
  codigo,
  status,
  inscricoesAbertas,
  etapas,
  documentos,
  onInscrever,
  tema = "dourado",
}) => {
  const [expandido, setExpandido] = useState(false);

  const alternarExpansao = () => {
    setExpandido(!expandido);
  };

  const obterCorChip = (): "success" | "primary" | "secondary" | undefined => {
    switch (status) {
      case "aberto":
        return "success";
      case "fechado":
        return "primary";
      case "concluido":
      case "default":
      default:
        return "secondary";
    }
  };

  const obterTextoStatus = (): string => {
    switch (status) {
      case "aberto":
        return "Inscrições Abertas";
      case "fechado":
        return "Inscrições Encerradas";
      case "concluido":
        return "Processo Concluído";
      default:
        return "Edital Aberto";
    }
  };

  const obterClasseTema = (): string => {
    return tema === "dourado" ? "tema-dourado" : "tema-azul";
  };
  const cor = tema === "dourado" ? "var(--cor-azul-escuro)" : "var(--cor-creme-escuro)";

  return (
    <div className={`processo-seletivo ${obterClasseTema()}`}>
      <div className="processo-header">
        <div
          className="processo-info"
          onClick={alternarExpansao}
          style={{ cursor: "pointer" }}
        >
          <div className="processo-titulo-container">
            <h3 className="processo-titulo fonte-corpo">{titulo}</h3>
          </div>
          <div className="processo-codigo-status">
            <p className="processo-codigo fonte-corpo">{codigo}</p>
            <Button
              color={obterCorChip()}
              variant="solid"
              size="sm"
              className="status-chip"
            >
              {obterTextoStatus()}
            </Button>
          </div>
        </div>
        <div className="expand-button-container">
          <button
            className="expand-button"
            onClick={alternarExpansao}
            aria-label={expandido ? "Recolher detalhes" : "Expandir detalhes"}
          >
            <span className={expandido ? "chevron-up" : "chevron-down"}>
              <img
                src={arrowDownIcon}
                className="arrow-down-icon"
                alt="Expandir detalhes"
              />
            </span>
          </button>
        </div>
      </div>

      {expandido && (
        <>
          <div className={`processo-conteudo-expandido ${obterClasseTema()}-conteudo`}>
            <div className="processo-etapas-coluna">
              <EtapasProgresso etapas={etapas} tema={tema} />
            </div>

            {documentos.length > 0 && (
              <div className="processo-documentos-coluna">
                <h4 style={{ color: cor }} className="documentos-titulo">Documentos:</h4>
                <div className="documentos-lista">
                  {documentos.map((doc, index) => (
                    <DocumentoItem
                      key={index}
                      titulo={doc.titulo}
                      url={doc.url}
                      tema={tema}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>


        </>
      )}
    </div>
  );
};

export default ProcessoSeletivo;
