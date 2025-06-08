import React from "react";

interface Edital {
  id: number;
  tipo_edital: string;
  descricao: string;
  edital_url: string[];
  titulo_edital: string;
  quantidade_bolsas: number;
  status_edital: string;
  etapas: any[];
}

interface OpenSelectionsProps {
  editais: Edital[];
}

const OpenSelectionCard: React.FC<Edital> = ({
  id,
  titulo_edital,
  status_edital,
  edital_url,
}) => {
  const statusLower = status_edital.toLowerCase();
  const isOpen = statusLower.includes("aberto");
  const isClosed = statusLower.includes("fechado");

  const badgeClass = isOpen
    ? "bg-[#D1FAE5] text-[#065F46]"   // verde claro institucional
    : isClosed
    ? "bg-[#FEE2E2] text-[#991B1B]"   // vermelho claro discreto
    : "bg-[#DBEAFE] text-[#1E3A8A]";  // azul claro elegante

  const bgColorClass = "bg-[#EDF2F7] text-[#1B3A4B] border border-[#D1D5DB]";

  return (
    <div className={`rounded-xl p-5 mb-6 ${bgColorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="processo-titulo fonte-corpo">{titulo_edital}</h3>
          <p className="fonte-corpo mt-1">Edital nº {id}</p>

          <span
            className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full uppercase tracking-wide ${badgeClass} fonte-corpo`}
          >
            {status_edital}
          </span>
        </div>

        <a
          href={edital_url[0] || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline font-medium fonte-corpo"
        >
          Ver Edital
        </a>
      </div>

      <div className="mt-4 flex justify-end">
        {isOpen ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            REALIZAR INSCRIÇÃO
          </button>
        ) : (
          <button className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-default">
            INSCRIÇÃO REALIZADA
          </button>
        )}
      </div>
    </div>
  );
};

const OpenSelections: React.FC<OpenSelectionsProps> = ({ editais }) => {
  return (
    <div className="w-full rounded-xl max-w-3xl max-h-[calc(2*15rem)] bg-white border border-[#E5E7EB] shadow-md p-6 overflow-y-auto">
      <h3 className="text-2xl font-medium text-[#1B3A4B] mb-4">Seleções abertas</h3>

      {editais.length === 0 ? (
        <p className="text-sm text-gray-500">
          No momento, não há nenhum edital em andamento.
        </p>
      ) : (
        editais.map((edital) => (
          <OpenSelectionCard key={edital.id} {...edital} />
        ))
      )}
    </div>
  );
};

export default OpenSelections;
