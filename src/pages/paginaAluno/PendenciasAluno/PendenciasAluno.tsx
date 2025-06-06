import PendenciaItem from "@/components/PendenciaItem/PendenciaItem";
import "@/pages/paginaAluno/PendenciasAluno/PendenciasAluno.css";
import PageLayout from "@/pages/PageLayout/PageLayout";
import { useNavigate } from "react-router-dom";
import React from "react";

function SetaEsquerda() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={3}
      stroke="currentColor"
      className="w-6 h-6 text-gray-700"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

const editalsMock = [
  {
    id: 1,
    title: "Auxílio Permanência - Campus Salvador",
    year: 2025,
    status: {
      title: "Aguardando Documentação",
      status: "pending",
      color: "yellow",
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
  {
    id: 3,
    title: "Bolsa Alimentação - Campus Salvador",
    year: 2025,
    status: {
      title: "Aguardando Documentação",
      status: "pending",
      color: "yellow",
    },
    pendingItems: [
      {
        name: "Comprovante de Matrícula",
        reason: "Documento desatualizado",
        requestDate: "2025-05-11T09:00:00Z",
      },
      {
        name: "Comprovante de Residência",
        reason: "Faltando assinatura",
        requestDate: "2025-05-11T09:10:00Z",
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
    currentStageIndex: 1,
  },
];

const PendenciasAluno: React.FC = () => {

  const navigate = useNavigate();
  // Adapta o mock para o formato esperado pelo PendenciaItem
  const pendenciasPorEdital = editalsMock
    .map((edital) => ({
      edital: edital.title,
      tipo: edital.title,
      pendencias: edital.pendingItems.map((item) => ({
        descricao: `${item.name}${item.reason ? ` - ${item.reason}` : ""}`,
        dataEnvio: new Date(item.requestDate).toLocaleDateString("pt-BR"),
        status: "Pendente",
      })),
    }))
    .filter((edital) => edital.pendencias.length > 0); // <-- Só mantém editais com pendências

  return (
    <PageLayout>
      <div className="titulo-pagina">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="flex items-center justify-center p-0 m-0 rounded-full border border-transparent hover:bg-gray-100 transition"
          style={{
            height: '100%',
          }}
        >
          <SetaEsquerda />
        </button>
        <h3 className="text-2xl font-medium mb-1 leading-none">Pendências</h3>
      </div>
      <div className="space-y-6">
        {pendenciasPorEdital.map((edital, index) => (
          <PendenciaItem
            key={index}
            edital={edital.edital}
            tipo={edital.tipo}
            pendencias={edital.pendencias}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default PendenciasAluno;
