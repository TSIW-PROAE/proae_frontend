import React from "react";

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
  if (!edital) return null;

  const { title, status, pendingItems, stages, currentStageIndex } = edital;

  const progressPercent = ((currentStageIndex + 1) / stages.length) * 100;
  const etapaAtual = stages[currentStageIndex];

  const handleViewForm = () => {
    // lógica para abrir a ficha de inscrição
    alert("Abrir ficha de inscrição");
  };

  const handleUploadDocuments = () => {
    // lógica para upload de documentos
    alert("Abrir upload de documentos");
  };

  return (
    <section className="bg-[#f5d087] p-6 rounded-xl shadow-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6">Status da Inscrição para: {title}</h2>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-4">
          <span className="font-semibold">Status:</span>
          <span className={status.color}>{status.title}</span>
        </div>

        {/* Pendências */}
        {(pendingItems?.length ?? 0) > 0 ? (
          <div className="flex items-start gap-4">
            <span className="font-semibold">Pendências:</span>
            <ul className="list-disc ml-6 text-sm text-red-700">
              {pendingItems.map((doc, i) => (
                <li key={i}>
                  {doc.name} - {doc.reason} -{" "}
                  {new Date(doc.requestDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
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
          <button
            onClick={handleUploadDocuments}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Enviar Documentos
          </button>
        </div>
      </div>
    </section>
  );
};

export default CandidateStatus;
