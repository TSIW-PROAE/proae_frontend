// components/OpenSelections.tsx
import React from "react";

interface Selection {
  title: string;
  code: string;
  status: string;
}

interface OpenSelectionsProps {
  selections: Selection[];
}

const OpenSelectionCard: React.FC<Selection> = ({ title, code, status }) => {
  const statusLower = status.toLowerCase();
  const isOpen = statusLower.includes("open");
  const isClosed = statusLower.includes("closed");

  const bgColorClass =
    Math.random() % 2 === 0 ? "bg-[#27548A]" : "bg-[var(--cor-creme-escuro)]"; // Alternating color based on position

  return (
    <div
      className={`rounded-xl p-5 mb-6 shadow-sm border-2 border-black ${bgColorClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="processo-titulo  fonte-corpo">{title}</h3>
          <p className="fonte-corpo mt-1">Edital nº {code}</p>

          <span
            className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full ${
              isOpen
                ? "bg-green-500 fonte-corpo"
                : isClosed
                ? "bg-red-500 fonte-corpo"
                : "bg-blue-500 fonte-corpo"
            }`}
          >
            {status}
          </span>
        </div>

        <a href="#" className="text-sm underline font-medium fonte-corpo">
          ver infromações
        </a>
      </div>

      <div className="mt-4 flex justify-end">
        {isOpen ? (
          <button className="bg-[#183B4E] text-white font-bold px-6 py-2 flex items-center gap-2 hover:opacity-90 transition">
            REALIZAR INSCRIÇÃO
          </button>
        ) : (
          <button className="bg-[#183B4E] text-white font-bold px-6 py-2 flex items-center gap-2 cursor-default">
            INSCRIÇÃO REALIZADA
          </button>
        )}
      </div>
    </div>
  );
};

const OpenSelections: React.FC<OpenSelectionsProps> = ({ selections }) => {
  return (
    <div className="w-full max-w-3xl max-h-[calc(2*15rem)] overflow-y-auto">
      <h3 className="text-2xl font-bold mb-4 text-[#092E35]">Seleções abertas</h3>

      {selections.map((selection, idx) => (
        <OpenSelectionCard key={idx} {...selection} />
      ))}
    </div>
  );
};

export default OpenSelections;
