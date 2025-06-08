import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Chip } from "@heroui/react";

interface Benefit {
  name: string;
  date: string;
  active: boolean;
}

interface BenefitsCardProps {
  benefits: Benefit[];
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
}

const BenefitsCard: React.FC<BenefitsCardProps> = ({
  benefits,
  backgroundColor = "#EDF2F7", // fundo azul claro neutro
  borderColor = "#D1D5DB",     // borda cinza clara
  color = "#1B3A4B",           // texto azul petróleo
}) => {
  const activeBenefits = benefits.filter((b) => b.active);

  return (
    <Card
      className="w-full max-w-3xl p-10 border"
      style={{
        backgroundColor,
        borderColor,
        color,
      }}
    >
      <CardHeader>
        <h3 className="text-2xl font-medium mb-4" style={{ color }}>
          Benefícios
        </h3>
      </CardHeader>

      {activeBenefits.length > 0 ? (
        <>
          <div
            className="grid grid-cols-3 gap-4 px-6 py-2 border-b border-[#D1D5DB] font-medium text-sm"
            style={{ color }}
          >
            <span>Nome</span>
            <span>Data Início</span>
            <span>Status</span>
          </div>

          <CardBody className="p-0 max-h-64 overflow-y-auto">
            <ul className="divide-y divide-[#D1D5DB]">
              {activeBenefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="grid grid-cols-3 gap-4 px-6 py-3 text-sm items-center"
                  style={{ color }}
                >
                  <span>{benefit.name}</span>
                  <span>{benefit.date}</span>
                  <span className="flex items-center gap-1">
                    <Chip color="success" size="sm">
                      Ativo
                    </Chip>
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>

          <CardFooter className="justify-end text-xs text-gray-500">
            Total: {activeBenefits.length} benefício(s) ativo(s)
          </CardFooter>
        </>
      ) : (
        <CardBody className="text-center py-12 text-sm text-gray-500">
          Você ainda não possui nenhum benefício ativo.
        </CardBody>
      )}
    </Card>
  );
};

export default BenefitsCard;
