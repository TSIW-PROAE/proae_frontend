import React, { useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { DynamicField } from './DynamicField';
import { Button } from '@heroui/react';
import toast, { Toaster } from 'react-hot-toast';
import { filtrarInputsCondicionais } from '@/utils/conditionalLogic';
import { VagasService } from '@/services/VagasService/vagas.service';
import { FetchAdapter } from '@/services/BaseRequestService/HttpClient';
import { useParams } from 'react-router-dom';
import { GradeBeneficios } from '@/components/GradeBeneficios/GradeBeneficios';
import { VagaResponse as Vaga } from '@/types/vaga';
import {InscricaoService} from "@/services/InscricaoService/inscricao.service.ts"
import { useNavigate } from "react-router-dom"

interface FormularioDinamicoProps {
  editalId?: string | number;
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
  const { editalId } = useParams<{ editalId: string }>();
  const vagasService = new VagasService(new FetchAdapter());

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [vagaSelecionada, setVagaSelecionada] = useState<number | null>(null);
  const [isLoadingVagas, setIsLoadingVagas] = useState(true);
  const [vagasError, setVagasError] = useState<string | null>(null);

  const inscricaoService = InscricaoService.getInstance();
  const navigate = useNavigate();

  const builderProps = {
    editalId: editalId || "",
    titulo: props.titulo,
    subtitulo: props.subtitulo,
    onSubmit: async (data: Record<string, any>) => {
      try {
        const dataWithVaga = { ...data, vaga_id: vagaSelecionada }
        await inscricaoService.submeterRespostas(dataWithVaga);
        props.onSuccess?.(dataWithVaga);
        navigate("/portal-aluno");
      } catch (err: any) {
        props.onError?.(err.message);
        throw err;
      }
    }
  };

  useEffect(() => {
    const carregarVagas = async () => {
      try {
        setIsLoadingVagas(true);
        setVagasError(null);

        const response = await vagasService.getVagasEdital(String(editalId));
        const vagasData: Vaga[] = (response as any)?.data || response as Vaga[];

        setVagas(vagasData);

        if (vagasData.length === 1) {
          setVagaSelecionada(vagasData[0].id);
        }
      } catch (error: any) {
        setVagasError(error.message || 'Erro ao carregar vagas');
        console.error('Erro ao carregar vagas:', error);
      } finally {
        setIsLoadingVagas(false);
      }
    };

    if (editalId) {
      carregarVagas();
    }
  }, [editalId]);  const {
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

  const handleSelectVaga = (vaga_id: number) => {
    setVagaSelecionada(vaga_id);
  };

  const handleCancelVagas = () => {
    window.history.back();
  };

  if (isLoadingVagas) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando benefícios disponíveis...</span>
      </div>
    );
  }

  if (vagasError) {
    return (
      <div className="text-center p-8 min-h-screen flex flex-col justify-center">
        <p className="text-red-500 mb-4">Erro ao carregar benefícios: {vagasError}</p>
        <Button
          onPress={() => window.location.reload()}
          color="primary"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!vagas || vagas.length === 0) {
    return (
      <div className="text-center p-8 min-h-screen flex flex-col justify-center">
        <p className="text-gray-600 mb-4">Nenhum benefício disponível para este edital.</p>
        <Button
          onPress={handleCancelVagas}
          variant="ghost"
        >
          Voltar
        </Button>
      </div>
    );
  }

  if (vagas.length > 1 && !vagaSelecionada) {
    return (
      <GradeBeneficios
        vagas={vagas}
        onSelect={handleSelectVaga}
        onCancel={handleCancelVagas}
      />
    );
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
    const vagaAtual = vagas.find(v => v.id === vagaSelecionada);

    return (
      <div className={`
      min-h-screen min-w-screen flex items-center flex-col justify-between p-4 ${props.className || ''}
      `}>
        <Toaster position="top-right" />
        <div className="formulario-conteudo text-center">
          <h1>{props.titulo}</h1>
          {props.subtitulo && <p className="mb-4">{props.subtitulo}</p>}

          {vagaAtual && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6 rounded-r-lg">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700 font-medium">
                    Benefício Selecionado:
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {vagaAtual.nome}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {vagaAtual.descricao}
                  </p>
                  {vagas.length > 1 && (
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => setVagaSelecionada(null)}
                      className="mt-2"
                    >
                      Alterar Benefício
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
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
