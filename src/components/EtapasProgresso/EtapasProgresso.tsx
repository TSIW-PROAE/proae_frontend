import React, { useEffect, useState } from "react";
import "./EtapasProgresso.css";

interface Etapa {
  titulo: string;
  dataInicio: string;
  dataFim: string;
  tema?: "dourado" | "azul";
}

interface EtapasProgressoProps {
  etapas: Etapa[];
  tema?: "dourado" | "azul";
}

const EtapasProgresso: React.FC<EtapasProgressoProps> = ({
  etapas,
  tema = "dourado",
}) => {
  const [etapaAtual, setEtapaAtual] = useState<number | null>(null);

  useEffect(() => {
    const hoje = new Date();

    for (let i = 0; i < etapas.length; i++) {
      const dataInicio = new Date(etapas[i].dataInicio);
      const dataFim = new Date(etapas[i].dataFim);

      if (hoje >= dataInicio && hoje <= dataFim) {
        setEtapaAtual(i);
        return;
      }

      if (i === 0 && hoje < dataInicio) {
        setEtapaAtual(0);
        return;
      }

      if (i === etapas.length - 1 && hoje > dataFim) {
        setEtapaAtual(etapas.length - 1);
        return;
      }

      if (i < etapas.length - 1) {
        const proximaDataInicio = new Date(etapas[i + 1].dataInicio);
        if (hoje > dataFim && hoje < proximaDataInicio) {
          setEtapaAtual(i + 1);
          return;
        }
      }
    }
  }, [etapas]);

  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  const obterClasseEtapa = (index: number): string => {
    if (etapaAtual === null) return "";

    if (index < etapaAtual) {
      return "etapa-completada";
    } else if (index === etapaAtual) {
      return "etapa-atual";
    } else {
      return "etapa-futura";
    }
  };
  const cor =
    tema === "dourado" ? "var(--cor-azul-escuro)" : "var(--cor-creme-escuro)";

  return (
    <div className="etapas-progresso">
      <ul className="etapas-lista">
        {etapas.map((etapa, index) => (
          <li key={index} className={`etapa-item ${obterClasseEtapa(index)}`}>
            <div className={`etapa-marker`}></div>
            <div className="etapa-conteudo">
              <span className="etapa-titulo" style={{ color: cor }}>
                {etapa.titulo}
              </span>
              <span className="etapa-periodo" style={{ color: cor }}>
                {formatarData(etapa.dataInicio)} - {formatarData(etapa.dataFim)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EtapasProgresso;
