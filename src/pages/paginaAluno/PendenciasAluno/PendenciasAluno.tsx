// PendenciasAluno.tsx
import PendenciaItem from "@/components/PendenciaItem/PendenciaItem";
import SideBar from "@/components/SideBar/SideBar";
import React from "react";
import "./PendenciasAluno.css";

const PendenciasAluno: React.FC = () => {
  const pendenciasPorEdital = [
    {
      edital: "Edital 01/2025",
      tipo: "Auxílio Moradia",
      pendencias: [
        { descricao: "RG", dataEnvio: "10/05/2025", status: "Pendente" },
        { descricao: "Comprovante de residência", dataEnvio: "12/05/2025", status: "Pendente" },
      ],
    },
    {
      edital: "Edital 02/2025",
      tipo: "Auxílio Transporte",
      pendencias: [
        { descricao: "Foto 3x4", dataEnvio: "08/05/2025", status: "Não aceito" },
      ],
    },
  ];

  return (
    <div className="pendencias-aluno-container">
      <SideBar
        homeIconRedirect="/portal-aluno"
        processIconRedirect="/portal-aluno/processos"
        configIconRedirect="/portal-aluno/configuracao"
        docsIconRedirect="/portal-aluno/documentacao"
        shouldShowDocsIcon={true}
      />
      <div className="pendencias-container">
        <h1>Pendências</h1>
        <div className="pendencias-content">
          {pendenciasPorEdital.map((edital, index) => (
            <PendenciaItem
              key={index}
              edital={edital.edital}
              tipo={edital.tipo}
              pendencias={edital.pendencias}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendenciasAluno;
