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
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderRadius: "16px",
        border: "1px solid rgba(229, 231, 235, 0.8)",
      }}
    >
      <CardHeader className="pb-3 pt-5 px-6 flex flex-col gap-2 items-stretch">
        <div className="flex gap-3 items-start">
          <Award className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 m-0 leading-tight">
              Benefícios no edital
            </h3>
            <p className="text-sm sm:text-base text-gray-600 m-0 mt-2 font-normal leading-relaxed max-w-2xl">
              Processos em que você está <strong>inscrito</strong>, com{" "}
              <strong>inscrição aprovada</strong> na análise e{" "}
              <strong>homologado como beneficiário</strong> da vaga.
            </p>
          </div>
        </div>
      </CardHeader>

      {activeBenefits.length > 0 ? (
        <>
          <div
            className="hidden lg:grid lg:grid-cols-12 gap-3 px-6 py-3 border-b font-semibold text-sm bg-gray-50"
            style={{
              color: "#475569",
              borderColor: "#e5e7eb",
              backgroundColor: "#f8fafc",
            }}
          >
            <span className="lg:col-span-5">Processo / vaga</span>
            <span className="lg:col-span-3">Inscrição e benefício</span>
            <span className="lg:col-span-2">Inscrito em</span>
            <span className="lg:col-span-2">Situação</span>
          </div>

          <CardBody className="p-0 flex-1 benefits-list lg:overflow-visible overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {activeBenefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="px-5 sm:px-6 py-5 sm:py-6 text-sm sm:text-base"
                  style={{ color }}
                >
                  {/* Mobile / tablet: blocos empilhados */}
                  <p className="lg:hidden text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    Benefício {idx + 1} de {activeBenefits.length}
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
                    <div className="lg:col-span-5 min-w-0 space-y-2">
                      <p
                        className="font-semibold text-gray-900 text-base sm:text-lg leading-snug break-words"
                        title={benefit.titulo_edital || benefit.titulo_beneficio}
                      >
                        {benefit.titulo_edital || "Edital"}
                      </p>
                      <p
                        className="text-sm sm:text-base text-gray-700 leading-relaxed break-words"
                        title={benefit.titulo_beneficio}
                      >
                        <span className="font-medium text-gray-800">Benefício: </span>
                        {benefit.titulo_beneficio}
                      </p>
                      {benefit.resumo_para_aluno && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed border-l-[3px] border-emerald-300 pl-3 bg-emerald-50/50 py-2 pr-2 rounded-r-md break-words">
                          {benefit.resumo_para_aluno}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-3 flex flex-col gap-2">
                      <span className="lg:hidden text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Inscrição e benefício
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-900 text-sm font-medium px-3 py-1 w-fit">
                        <FileCheck2 className="w-4 h-4 shrink-0" />
                        Inscrição aprovada
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-900 text-sm font-medium px-3 py-1 w-fit">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Beneficiário no edital
                      </span>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-1">
                      <span className="lg:hidden text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Inscrito em
                      </span>
                      <span className="text-gray-800 font-medium">
                        {new Date(benefit.data_inicio).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-1">
                      <span className="lg:hidden text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Situação
                      </span>
                      <Chip
                        color="success"
                        size="md"
                        variant="flat"
                        classNames={{ content: "font-medium text-sm" }}
                        style={{
                          backgroundColor: "#dcfce7",
                          color: "#15803d",
                        }}
                      >
                        Benefício ativo
                      </Chip>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>

          <CardFooter className="justify-between text-sm text-gray-500 px-6 py-4 border-t">
            <span>
              Total: {activeBenefits.length} benefício
              {activeBenefits.length !== 1 ? "s" : ""}
            </span>
            <span>Atualizado agora</span>
          </CardFooter>
        </>
      ) : (
        <CardBody className="flex-1 flex items-center justify-center py-16 px-6">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum benefício homologado ainda
            </h4>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed m-0">
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
