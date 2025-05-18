// PortalAluno.tsx
import SideBar from "@/components/SideBar/SideBar";
import PageLayout from "@/pages/PageLayout/PageLayout";
import BenefitsCard from "@/components/BenefitsCard/BenefitsCard";
import OpenSelections from "@/pages/paginaAluno/PortalAluno/componentes/OpenSelections";
import "./PortalAluno.css";
import CandidateStatus from "./componentes/CandidateStatus";

export default function PortalAluno() {
  const benefits = [
    { name: "Plano de Saúde", date: "10/01/2025", active: true },
    { name: "Vale Refeição", date: "15/11/2024", active: false },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
    { name: "Auxílio Creche", date: "01/03/2025", active: true },
  ];

  const openSelections = [
    {
      title: "Bolsa Permanência 2025.2",
      code: "05/2023",
      status: {
        title: "Inscrições abertas",
        status: "open",
        color: "green",
      }
    },
    {
      title: "Auxílio Moradia 2025.1",
      code: "05/2023",
       status: {
        title: "Validação de domcumentos",
        status: "pending",
        color: "red", 
      }
    },
    {
      title: "Renovação de Benefícios 2025.1",
      code: "05/2023",
      status: {
        title: "Inscrição Fechada",
        status: "closed",
        color: "red", 
      }

    },
  ];

  const editalsMock = [
    {
      id: 1,
      title: "Auxílio Permanência - Campus Salvador",
      year: 2025,
      status: {
        title: "Aguardando Documentação",
        status: "pending",
        color: "yellow", // Apenas a cor
      },
      pendingItems: [
        {
          name: "RG",
          reason: "Imagem ilegível",
          requestDate: "2025-05-09T10:15:00Z",
        },
        {
          name: "CAD Único",
          reason: "Não enviado",
          requestDate: "2025-05-09T10:16:00Z",
        },
        {
          name: "Comprovante de Residência",
          reason: "Documento vencido",
          requestDate: "2025-05-10T08:00:00Z",
        },
        {
          name: "Histórico Escolar",
          reason: "Faltando assinatura",
          requestDate: "2025-05-10T08:10:00Z",
        },
        {
          name: "Declaração de Matrícula",
          reason: "Formato inválido",
          requestDate: "2025-05-10T08:20:00Z",
        },
        {
          name: "Foto 3x4",
          reason: "Não enviado",
          requestDate: "2025-05-10T08:30:00Z",
        },
        {
          name: "Título de Eleitor",
          reason: "Imagem cortada",
          requestDate: "2025-05-10T08:40:00Z",
        },
        {
          name: "Comprovante de Renda",
          reason: "Informação incompatível",
          requestDate: "2025-05-10T08:50:00Z",
        },
        {
          name: "CPF",
          reason: "Documento ilegível",
          requestDate: "2025-05-10T09:00:00Z",
        },
        {
          name: "Declaração de Imposto de Renda",
          reason: "Faltando página",
          requestDate: "2025-05-10T09:10:00Z",
        },
      ],
      stages: [
        "Inscrição",
        "Homologação das Inscrições",
        "Análise de Documentos",
        "Resultado Preliminar",
        "Interposição do Resultado Parcial",
        "Resultado do Recurso",
        "Resultado Final",
      ],
      currentStageIndex: 2,
    },
    {
      id: 2,
      title: "Auxílio Moradia - Campus Salvador",
      year: 2025,
      status: {
        title: "Aprovado",
        status: "approved",
        color: "green",
      },
      pendingItems: [],
      stages: [
        "Inscrição",
        "Homologação das Inscrições",
        "Interposição das Inscrições",
        "Resultado Preliminar",
        "Análise de Documentos",
        "Resultado do Recurso",
        "Resultado Final",
      ],
      currentStageIndex: 6,
    },
  ];

  return (
    <PageLayout
      sidebar={
        <SideBar
          homeIconRedirect="/home"
          processIconRedirect="/process"
          configIconRedirect="/config"
        />
      }
    >
      <div className="max-w-[1500px] mx-auto">
        <h1 className="text-2xl font-normal text-[#1B3A4B] mb-6">
          Olá Caio, bem vindo ao portal do aluno !
        </h1>

        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <div className="w-full lg:w-1/2">
            <BenefitsCard benefits={benefits} />
          </div>
          <div className="w-full lg:w-1/2">
            <OpenSelections selections={openSelections} />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-medium text-[#1B3A4B] mb-3">
            Minhas últimas inscrições{" "}
          </h2>
          <div className="flex  flex-col gap-6">
            {editalsMock.map((edital) => (
              <CandidateStatus key={edital.id} edital={edital} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
