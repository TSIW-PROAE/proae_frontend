import React from 'react';
import { FormularioDinamico } from '../../components/FormularioDinamico/FormularioDinamico';
import { useParams } from 'react-router-dom';

export const Questionario: React.FC = () => {
  const { editalId } = useParams<{ editalId: string }>();

  const handleSuccess = (data: any) => {
    console.log("Dados do formulário enviados com sucesso:", data);
  }

  const handleError = (error: string) => {
    console.error("Erro ao enviar formulário:", error);
  }

  return (
    <FormularioDinamico
      editalId={Number(editalId)}
      titulo="Formulário de Cadastro Socioeconômico - PROAE"
      subtitulo="Preencha todas as informações para análise da sua situação socioeconômica"
      botaoFinal="Enviar Formulário"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
};

export default Questionario;
