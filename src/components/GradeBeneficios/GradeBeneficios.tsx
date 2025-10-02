import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { VagaResponse } from '@/types/vaga';

interface GradeBeneficiosProps {
  vagas: VagaResponse[];
  onSelect: (vaga_id: number) => void;
  onCancel: () => void;
}

export const GradeBeneficios: React.FC<GradeBeneficiosProps> = ({
  vagas,
  onSelect,
  onCancel
}) => {

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center p-4">
      <div className="w-full flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Selecione o Benefício para Candidatura
          </h1>
          <p className="text-lg text-gray-600">
            Escolha qual benefício você deseja concorrer neste edital
          </p>
        </div>

        <div className="w-full flex flex-wrap gap-4 mb-8 justify-center">
          {vagas.map((vaga) => (
            <Card
              key={vaga.id}
              className="h-60 w-full flex flex-col max-w-96"
            >
              <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex flex-col w-full">
                  <h3 className="text-xl font-semibold line-clamp-2 min-h-[3rem]">{vaga.beneficio}</h3>
                  <div className="flex justify-center items-center mt-2">
                    <Chip
                      color="success"
                      variant="flat"
                      size="sm"
                    >
                      {vaga.numero_vagas} vaga(s)
                    </Chip>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pt-2 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {vaga.descricao_beneficio}
                  </p>

                  {vaga.requisitos && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">
                        Requisitos:
                      </span>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {vaga.requisitos}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  color="primary"
                  className="w-full mt-auto cursor-pointer"
                  onPress={() => onSelect(vaga.id)}
                >
                  Candidatar-se
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="flex justify-center w-full">
          <Button
            variant="ghost"
            onPress={onCancel}
            className="px-8"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GradeBeneficios;
