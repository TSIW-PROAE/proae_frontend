import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react";
import { ShieldCheck } from "lucide-react";

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
      <CardHeader className="pb-4 pt-5 px-6 flex flex-col gap-2 items-stretch">
        <div className="flex gap-3 items-start">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 m-0 leading-tight">
              Benefícios no edital
            </h3>
            <p className="text-sm text-gray-600 m-0 mt-1.5 font-normal leading-relaxed max-w-2xl">
              Processos em que sua inscrição foi homologada como beneficiário.
            </p>
          </div>
        </div>
      </CardHeader>

      {activeBenefits.length > 0 ? (
        <>
          <CardBody className="px-6 pt-0 pb-4 flex-1 benefits-list">
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {activeBenefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-4 sm:px-5 sm:py-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p
                        className="font-semibold text-gray-900 text-base leading-snug break-words m-0"
                        title={benefit.titulo_beneficio}
                      >
                        {benefit.titulo_beneficio}
                      </p>
                      <p
                        className="text-sm text-gray-600 leading-relaxed break-words m-0"
                        title={benefit.titulo_edital || benefit.titulo_beneficio}
                      >
                        {benefit.titulo_edital || "Edital"}
                      </p>
                      <p className="text-sm text-gray-500 m-0">
                        Inscrito em{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(benefit.data_inicio).toLocaleDateString("pt-BR")}
                        </span>
                      </p>
                    </div>

                    <Chip
                      color="success"
                      size="md"
                      variant="flat"
                      classNames={{
                        base: "shrink-0 self-start sm:self-center",
                        content: "font-medium text-sm",
                      }}
                      style={{
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                      }}
                    >
                      Benefício ativo
                    </Chip>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>

          <CardFooter className="text-sm text-gray-500 px-6 py-3 border-t">
            <span>
              {activeBenefits.length} benefício{activeBenefits.length !== 1 ? "s" : ""} homologado
              {activeBenefits.length !== 1 ? "s" : ""}
            </span>
          </CardFooter>
        </>
      ) : (
        <CardBody className="flex-1 flex items-center justify-center py-14 px-6">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-gray-400" />
            </div>
            <h4 className="text-base font-semibold text-gray-700 mb-2 m-0">
              Nenhum benefício homologado ainda
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed m-0">
              Quando você for homologado em um edital, o benefício aparecerá aqui. Acompanhe o
              andamento em <strong>Minhas inscrições</strong>.
            </p>
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default BenefitsCard;
