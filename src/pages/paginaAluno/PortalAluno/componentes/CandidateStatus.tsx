import React from "react";
import { useNavigate } from "react-router-dom";

// Tipos baseados no formato da API
interface Etapa {
  id: number;
  nome: string;
  ordem: number;
  data_inicio: string;
  data_fim: string;
}

interface EditalAPI {
  edital_id: number;
  titulo_edital: string;
  status_edital: string;
  status_inscricao: string;
  possui_pendencias: boolean;
  etapas_edital: Etapa[];
}

interface CandidateStatusProps {
  edital: EditalAPI | null;
}

const CandidateStatus: React.FC<CandidateStatusProps> = ({ edital }) => {
  const navigate = useNavigate();

  if (!edital) return null;

  const {
    titulo_edital,
    status_inscricao,
    possui_pendencias,
    etapas_edital,
  } = edital;

  const etapasOrdenadas = etapas_edital.sort((a, b) => a.ordem - b.ordem);
  const nomesEtapas = etapasOrdenadas.map((etapa) => etapa.nome);

  const hoje = new Date();
  const indiceEtapaAtual =
    etapasOrdenadas.findIndex((etapa) => new Date(etapa.data_fim) >= hoje) !== -1
      ? etapasOrdenadas.findIndex((etapa) => new Date(etapa.data_fim) >= hoje)
      : etapasOrdenadas.length - 1;

  const etapaAtualNome = nomesEtapas[indiceEtapaAtual];
  const progresso = ((indiceEtapaAtual + 1) / nomesEtapas.length) * 100;

  const corStatus = status_inscricao.toLowerCase().includes("aprovada")
    ? "text-green-600"
    : status_inscricao.toLowerCase().includes("reprovada")
    ? "text-red-600"
    : "text-yellow-600";

  const handleViewForm = () => {
    alert("Abrir ficha de inscrição");
  };

  const handleCheckPendingItems = () => {
    navigate("/portal-aluno/pendencias-aluno");
  };

  return (
    <section className="bg-[#EDF2F7] text-[#1B3A4B] p-6 rounded-xl border border-[#D1D5DB] w-full mx-auto">
      <h2 className="text-xl font-normal text-[#374151] mb-6">
        <span className="text-[#6B7280]">Status da Inscrição para:</span>{" "}
        {titulo_edital}
      </h2>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-4">
          <span className="font-semibold">Status:</span>
          <span className={corStatus}>{status_inscricao}</span>
        </div>

        {/* Pendências */}
        {possui_pendencias ? (
          <div className="text-red-700 font-medium">
            Você possui pendências de documentos.
          </div>
        ) : (
          <div className="text-green-700 font-medium">
            Nenhuma pendência de documentos
          </div>
        )}

        {/* Etapa atual */}
        <div>
          <span className="font-semibold">Etapa atual:</span>
          <div className="text-sm">{etapaAtualNome}</div>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-700 mt-1">
            {indiceEtapaAtual + 1} de {nomesEtapas.length} etapas
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleViewForm}
            className="bg-white text-black px-4 py-2 rounded-lg border border-black hover:bg-gray-100 transition"
          >
            Ver Ficha de Inscrição
          </button>

          {possui_pendencias && (
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
