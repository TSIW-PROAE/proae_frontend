import React from 'react';
import { FormProvider } from 'react-hook-form';
import { FormularioDinamicoProps } from '@/types/dynamicForm';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { DynamicField } from './DynamicField';
import { Button } from '@heroui/react';
import toast, { Toaster } from 'react-hot-toast';
import { filtrarInputsCondicionais } from '@/utils/conditionalLogic';

export const FormularioDinamico: React.FC<FormularioDinamicoProps> = (props) => {
  const {
    form,
    currentPage,
    isLastPage,
    isSubmitting,
    nextPage,
    pageErrors,
    prevPage,
    submitForm,
    paginasVisiveis
  } = useFormBuilder({config: props});

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

  if(currentPage === 0){
    return (
      <div className={`
      min-h-screen min-w-screen flex items-center flex-col justify-between p-4
      `}>
        <Toaster position="top-right" />
        {/* Header e conteúdo da página inicial */}
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
      min-h-screen min-w-screen flex items-center flex-col justify-between p-4
      `}>
      <section className={`flex flex-col w-full gap-10 justify-between items-start`}>
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
      </section>

        </div>
    </FormProvider>
  )
}

export default FormularioDinamico
