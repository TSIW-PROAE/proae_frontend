import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { VagaResponse } from '@/types/vaga';

interface GradeBeneficiosProps {
  vagas: VagaResponse[];
  onSelect: (vagaId: number) => void;
  onCancel: () => void;
}

export const GradeBeneficios: React.FC<GradeBeneficiosProps> = ({
  vagas,
  onSelect,
  onCancel
}) => {
  const formatarValor = (valor?: number) => {
    if (!valor) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Selecione o Benefício para Candidatura
          </h1>
          <p className="text-lg text-gray-600">
            Escolha qual benefício você deseja concorrer neste edital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vagas.map((vaga) => (
            <Card
              key={vaga.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              isPressable
              onPress={() => onSelect(vaga.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col w-full">
                  <h3 className="text-xl font-semibold">{vaga.beneficio}</h3>
                  <div className="flex justify-between items-center mt-2">
    
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

              <CardBody className="pt-2">
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {vaga.descricao_beneficio}
                </p>


                {vaga.requisitos && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Requisitos:
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {vaga.requisitos}
                    </p>
                  </div>
                )}

                <Button
                  color="primary"
                  className="w-full"
                  onPress={() => onSelect(vaga.id)}
                >
                  Candidatar-se
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="text-center">
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
