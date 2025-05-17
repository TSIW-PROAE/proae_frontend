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
  backgroundColor = "#EDF2F7",        // fundo azul claro neutro
  borderColor = "#D1D5DB",            // borda cinza clara
  color = "#1B3A4B",                  // texto azul petróleo
}) => {
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
        <h3
          className="text-2xl font-medium mb-4"
          style={{ color }}
        >
          Benefícios
        </h3>
      </CardHeader>

      <div className="grid grid-cols-3 gap-4 px-6 py-2 border-b border-[#D1D5DB] font-medium text-sm" style={{ color }}>
        <span>Nome</span>
        <span>Data</span>
        <span>Status</span>
      </div>

      <CardBody className="p-0 max-h-64 overflow-y-auto">
        <ul className="divide-y divide-[#D1D5DB]">
          {benefits.map((benefit, idx) => (
            <li
              key={idx}
              className="grid grid-cols-3 gap-4 px-6 py-3 text-sm items-center"
              style={{ color }}
            >
              <span>{benefit.name}</span>
              <span>{benefit.date}</span>
              <span className="flex items-center gap-1">
                {benefit.active ? (
                  <Chip color="success" size="sm">
                    Ativo
                  </Chip>
                ) : (
                  <Chip color="danger" size="sm">
                    Inativo
                  </Chip>
                )}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>

      <CardFooter className="justify-end text-xs text-gray-500">
        Total: {benefits.length} benefício(s)
      </CardFooter>
    </Card>
  );
};

export default BenefitsCard;
