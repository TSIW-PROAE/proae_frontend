import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react";
import { Award } from "lucide-react";

interface Benefit {
  titulo_beneficio: string;
  data_inicio: string;
  beneficio: string; // Ex: "Benefício ativo"
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
  const activeBenefits = benefits.filter((b) =>
    b.beneficio.toLowerCase().includes("ativo")
  );

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
      <CardHeader className="pb-4 flex gap-2">
        <Award className="w-5 h-5 text-emerald-600" />
        <h3
          className="text-2xl font-semibold text-gray-900 m-0"
        >
          Meus Benefícios
        </h3>
      </CardHeader>

      {activeBenefits.length > 0 ? (
        <>
          <div
            className="grid grid-cols-3 gap-4 px-6 py-3 border-b font-medium text-sm bg-gray-50"
            style={{
              color: "#6b7280",
              borderColor: "#e5e7eb",
              backgroundColor: "#f8fafc",
            }}
          >
            <span>Benefício</span>
            <span>Data Início</span>
            <span>Status</span>
          </div>

          <CardBody className="p-0 flex-1 overflow-y-auto benefits-list">
            <ul className="divide-y divide-gray-200">
              {activeBenefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="grid grid-cols-3 gap-4 px-6 py-4 text-sm items-center hover:bg-gray-50 transition-colors"
                  style={{ color }}
                >
                  <span
                    className="font-medium truncate"
                    title={benefit.titulo_beneficio}
                  >
                    {benefit.titulo_beneficio}
                  </span>
                  <span className="text-gray-600">
                    {new Date(benefit.data_inicio).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
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
                      Ativo
                    </Chip>
                  </span>
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
              Nenhum benefício ativo
            </h4>
            <p className="text-sm text-gray-500">
              Você ainda não possui benefícios ativos. Explore as seleções
              abertas!
            </p>
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default BenefitsCard;
