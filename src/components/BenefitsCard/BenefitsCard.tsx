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
     backgroundColor = "var(--cor-azul-escuro)",
    borderColor = "var(--cor-azul-escuro)",
    color = "var(--cor-dourado)"
    }) => {
  return (
    <Card className="w-full max-w-3xl p-10" style={{
        backgroundColor,
        borderColor,
        color,
      }}>
      <CardHeader>
        <h3 className="text-lg font-bold text-default-800 text-3xl" style={{color}}>Benefícios</h3>
      </CardHeader>
        <div className="grid grid-cols-3 gap-4 px-6 py-2 border-b border-[#DDA853] font-medium text-sm text-default-500">
            <span style={{color}}>Nome</span>
            <span style={{color}}>Data</span>
            <span style={{color}}>Status</span>
        </div>
      <CardBody className="p-0 max-h-64 overflow-y-auto">
        <ul className="divide-y divide-[#DDA853]">
          {benefits.map((benefit, idx) => (
            <li
              key={idx}
              className="grid grid-cols-3 gap-4 px-6 py-3 text-sm text-default-700 items-center"
              style={{color}}>
            
              <span>{benefit.name}</span>
              <span>{benefit.date}</span>
              <span className="flex items-center gap-1">
                {benefit.active ? (
                  <>
                    <Chip color="success" size="sm">
                      Ativo
                    </Chip>
                  </>
                ) : (
                  <>
                    <Chip color="danger" size="sm">
                      Inativo
                    </Chip>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>

      <CardFooter className="justify-end text-xs text-default-400">
        Total: {benefits.length} benefício(s)
      </CardFooter>
    </Card>
  );
};

export default BenefitsCard;
