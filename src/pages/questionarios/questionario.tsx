import React, { useEffect, useState } from 'react';
import { FormularioDinamico } from '../../components/FormularioDinamico/FormularioDinamico';
import { useParams } from 'react-router-dom';
import {EditalService} from "@/services/EditalService/editalService"

export const Questionario: React.FC = () => {
  const { editalId } = useParams<{ editalId: string }>();
  const [editalData, setEditalData] = useState<any>(null);

  const editalService = new EditalService();

  const handleSuccess = (data: any) => {
    console.log("Dados do formulário enviados com sucesso:", data);
    
  }

  const handleError = (error: string) => {
    console.error("Erro ao enviar formulário:", error);
  }

  useEffect(() => {
    const edital = async () => {
      const response = await editalService.buscarEditalPorId(editalId!);
      setEditalData(response);
    }

    edital();
  }, [editalId])

  return (
    <FormularioDinamico
      editalId={editalId}
      titulo={`Formulário ${editalData ? editalData.titulo_edital : ""}`}
      subtitulo={`${editalData ? editalData.descricao : ""}`}
      botaoFinal="Enviar Formulário"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
};

export default Questionario;
