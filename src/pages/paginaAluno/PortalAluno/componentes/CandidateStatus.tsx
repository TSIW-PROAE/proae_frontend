import React from "react";
import { useNavigate } from "react-router-dom";

interface Edital {
  title: string;
  status: {
    title: string;
    status: string;
    color: string;
  };
  pendingItems: {
    name: string;
    reason: string;
    requestDate: string;
  }[];
  stages: string[];
  currentStageIndex: number;
}

const CandidateStatus: React.FC<{ edital: Edital | null }> = ({ edital }) => {
  const navigate = useNavigate();

  if (!edital) return null;

  const { title, status, pendingItems, stages, currentStageIndex } = edital;

  const progressPercent = ((currentStageIndex + 1) / stages.length) * 100;
  const etapaAtual = stages[currentStageIndex];

  const handleViewForm = () => {
    alert("Abrir ficha de inscrição");
  };

  const handleCheckPendingItems = () => {
    navigate("/portal-aluno/pendencias-aluno"); 
  };

  return (
    <section className="bg-[#EDF2F7] text-[#1B3A4B] p-6 rounded-xl border border-[#D1D5DB] w-full mx-auto">
      <h2 className="text-xl font-normal text-[#374151] mb-6">
        <span className="text-[#6B7280]">Status da Inscrição para:</span> {title}
      </h2>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-4">
          <span className="font-semibold">Status:</span>
          <span className={status.color}>{status.title}</span>
        </div>

        {/* Pendências */}
        {(pendingItems?.length ?? 0) > 0 ? (
          <div className="text-red-700 font-medium">
            Você possui {pendingItems.length} pendência
            {pendingItems.length > 1 ? "s" : ""} de documentos.
          </div>
        ) : (
          <div className="text-green-700 font-medium">
            Nenhuma pendência de documentos
          </div>
        )}

        {/* Etapa atual */}
        <div>
          <span className="font-semibold">Etapa atual:</span>
          <div className="text-sm">{etapaAtual}</div>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-700 mt-1">
            {currentStageIndex + 1} de {stages.length} etapas
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleViewForm}
            className="bg-white text-black px-4 py-2 rounded-lg border border-black hover:bg-gray-100 transition"
          >
            Ver Ficha de Inscrição
          </button>

          {(pendingItems?.length ?? 0) > 0 && (
            <button
              onClick={handleCheckPendingItems}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Verificar Pendências
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CandidateStatus;
