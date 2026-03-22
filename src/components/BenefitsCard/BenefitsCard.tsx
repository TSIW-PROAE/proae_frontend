import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react";
import { Award, CheckCircle2, FileCheck2 } from "lucide-react";

interface Benefit {
  titulo_beneficio: string;
  data_inicio: string;
  beneficio: string;
  /** Nome do processo seletivo */
  titulo_edital?: string;
  resumo_para_aluno?: string;
}

interface BenefitsCardProps {
  benefits: Benefit[];
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
}

const BenefitsCard: React.FC<BenefitsCardProps> = ({
  benefits,
  backgroundColor = "#ffffff",
  borderColor = "#e5e7eb",
  color = "#1f2937",
}) => {
  /** Backend envia "Benefício ativo"; aceita também variações (ex.: beneficiário homologado). */
  const activeBenefits = benefits.filter((b) => {
    const t = (b.beneficio ?? "").toLowerCase();
    return t.includes("ativo") || t.includes("beneficiário") || t.includes("beneficiario");
  });

  return (
    <Card
      className="w-full benefits-card"
      style={{
        backgroundColor,
        borderColor,
        color,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderRadius: "16px",
        border: "1px solid rgba(229, 231, 235, 0.8)",
      }}
    >
      <CardHeader className="pb-2 flex flex-col gap-2 items-stretch">
        <div className="flex gap-2 items-center">
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 m-0">
              Benefícios no edital
            </h3>
            <p className="text-sm text-gray-600 m-0 mt-1 font-normal leading-snug">
              Aqui aparecem processos em que você está{" "}
              <strong>inscrito</strong>, com <strong>inscrição aprovada</strong> na
              análise e <strong>homologado como beneficiário</strong> da vaga.
            </p>
          </div>
        </div>
      </CardHeader>

      {activeBenefits.length > 0 ? (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-6 py-3 border-b font-medium text-xs sm:text-sm bg-gray-50"
            style={{
              color: "#6b7280",
              borderColor: "#e5e7eb",
              backgroundColor: "#f8fafc",
            }}
          >
            <span className="sm:col-span-4">Processo / vaga</span>
            <span className="sm:col-span-3 hidden sm:inline">Inscrição e benefício</span>
            <span className="sm:col-span-2">Inscrito em</span>
            <span className="sm:col-span-3">Situação</span>
          </div>

          <CardBody className="p-0 flex-1 overflow-y-auto benefits-list">
            <ul className="divide-y divide-gray-200">
              {activeBenefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-6 py-4 text-sm items-start hover:bg-gray-50 transition-colors"
                  style={{ color }}
                >
                  <div className="sm:col-span-4 min-w-0">
                    <p className="font-semibold text-gray-900 truncate" title={benefit.titulo_edital || benefit.titulo_beneficio}>
                      {benefit.titulo_edital || "Edital"}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate" title={benefit.titulo_beneficio}>
                      Vaga: {benefit.titulo_beneficio}
                    </p>
                    {benefit.resumo_para_aluno && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed border-l-2 border-emerald-200 pl-2">
                        {benefit.resumo_para_aluno}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium px-2 py-0.5 w-fit">
                      <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                      Inscrição aprovada
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium px-2 py-0.5 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Beneficiário no edital
                    </span>
                  </div>
                  <div className="sm:col-span-2 text-gray-700">
                    {new Date(benefit.data_inicio).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="sm:col-span-3 flex flex-wrap gap-1 items-center">
                    <Chip
                      color="success"
                      size="sm"
                      variant="flat"
                      style={{
                        backgroundColor: "#dcfce7",
                        color: "#16a34a",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      Benefício ativo
                    </Chip>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>

          <CardFooter className="justify-between text-xs text-gray-500 pt-4 border-t">
            <span>
              Total: {activeBenefits.length} benefício
              {activeBenefits.length !== 1 ? "s" : ""}
            </span>
            <span>Atualizado agora</span>
          </CardFooter>
        </>
      ) : (
        <CardBody className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum benefício homologado ainda
            </h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Quando sua <strong>inscrição estiver aprovada</strong> na análise e
              você for <strong>homologado como beneficiário</strong> no edital,
              o processo aparecerá aqui. Acompanhe o status em{" "}
              <strong>Minhas inscrições</strong> abaixo.
            </p>
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default BenefitsCard;
