import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { DynamicField } from './DynamicField';
import { Button } from '@heroui/react';
import toast, { Toaster } from 'react-hot-toast';
import { filtrarInputsCondicionais } from '@/utils/conditionalLogic';

interface FormularioDinamicoProps {
  editalId: number;
  titulo?: string;
  subtitulo?: string;
  botaoFinal?: string;
  onSuccess?: (data: Record<string, any>) => void;
  onError?: (error: string) => void;
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
  onSubmit?: (data: Record<string, any>) => void;
  loading?: React.ReactNode;
  className?: string;
  initialData?: Record<string, any>;
}

export const FormularioDinamico: React.FC<FormularioDinamicoProps> = (props) => {
  const builderProps = {
    editalId: props.editalId,
    titulo: props.titulo,
    subtitulo: props.subtitulo,
    onSubmit: async (data: Record<string, any>) => {
      try {
        props.onSuccess?.(data);
      } catch (err: any) {
        props.onError?.(err.message);
        throw err;
      }
    }
  };  const {
    form,
    currentPage,
    isLastPage,
    isSubmitting,
    nextPage,
    pageErrors,
    prevPage,
    submitForm,
    paginasVisiveis,
    isLoadingFromBackend,
    backendError
  } = useFormBuilder(builderProps);

  const handleNextPage = async () => {
    const success = await nextPage();

    if (!success) {
      if (pageErrors !== null && pageErrors[currentPage] && pageErrors[currentPage].length > 0) {
        const errorMessage = `Corrija os seguintes campos: ${pageErrors[currentPage].join(", ")}`;
        toast.error(errorMessage);
      } else {
        toast.error("Por favor, preencha todos os campos obrigatórios");
      }
    }
  }

  const handleSubmit = async () =>{
    try {
      await submitForm();
      toast.success("Formulário enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar formulário");
    }
  }

  if (isLoadingFromBackend) {
    return props.loading || (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando formulário...</span>
      </div>
    );
  }
  console.log(backendError)
  if (backendError) {
    props.onError?.(backendError);
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">Erro ao carregar formulário: {backendError}</p>
        <Button
          onPress={() => window.location.reload()}
          color="primary"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!paginasVisiveis || paginasVisiveis.length === 0) {
    return (
      <div className="text-center p-8">
        <p>Nenhum formulário encontrado para este edital.</p>
      </div>
    );
  }

  if(currentPage === 0){
    return (
      <div className={`
      min-h-screen min-w-screen flex items-center flex-col justify-between p-4 ${props.className || ''}
      `}>
        <Toaster position="top-right" />
        <div className="formulario-conteudo">
          <h1>{props.titulo}</h1>
          {props.subtitulo && <p>{props.subtitulo}</p>}
        </div>

        

        <div className="footer w-full flex justify-around">
          <Button onPress={() => window.history.back()}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleNextPage}>
            Continuar
          </Button>
        </div>
      </div>
    )
  }

const currentPageConfig = paginasVisiveis[currentPage - 1];
const formData = form.watch();
const inputsVisiveis = filtrarInputsCondicionais(currentPageConfig.inputs, formData);

  return (
    <FormProvider {...form}>
      <Toaster position="top-right" />
       <div className={`
      min-h-screen min-w-screen flex items-center flex-col justify-between p-4 ${props.className || ''}
      `}>
      <section className={`flex flex-col w-full gap-10 justify-between items-start pl-16 pr-16`}>
        <section className='formulario-conteudo'>
          <h1>{currentPageConfig.titulo}</h1>
        </section>
        {inputsVisiveis.map((input) => (
        <DynamicField
        key={input.nome}
        input={input}
        form={form}
        />
      ))}

      </section>
<div className="footer w-full flex justify-around">
          <Button onPress={prevPage} disabled={currentPage === 0}>
            Voltar
          </Button>

          {isLastPage ? (
            <Button
              color="success"
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : (props.botaoFinal || 'Finalizar')}
            </Button>
          ) : (
            <Button color="primary" onPress={handleNextPage}>
              Continuar
            </Button>
          )}
        </div>
        </div>
    </FormProvider>
  )
}

export default FormularioDinamico
