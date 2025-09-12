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
import { InscricaoService } from "@/services/InscricaoService/inscricao.service.ts"
import { useNavigate } from "react-router-dom"
import BarraProgresso  from '@/components/BarraProgresso/BarraProgresso';
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
  }, [editalId]);

  const {
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

  // ✅ Calcular o progresso incluindo a página inicial
  const totalSteps = paginasVisiveis ? paginasVisiveis.length + 1 : 1; // +1 para página inicial
  const currentStep = currentPage + 1; // currentPage é 0-based

  // ✅ Callback para mudança de step (se necessário)
  useEffect(() => {
    props.onStepChange?.(currentStep, totalSteps);
  }, [currentStep, totalSteps, props]);

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

  const handleSubmit = async () => {
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

  if (currentPage === 0) {
    const vagaAtual = vagas.find(v => v.id === vagaSelecionada);

    return (
      <div className={`
        min-h-screen flex items-center flex-col justify-between p-4 ${props.className || ''}
      `}>
        <Toaster position="top-right" />

        <div className="w-full mx-auto flex flex-col flex-1 justify-between" style={{ width: '75%', maxWidth: '1200px' }}>
          <div className="w-full">
            <BarraProgresso
              currentStep={currentStep}
              totalSteps={totalSteps}
              className="mb-6"
            />
          </div>

          <div className="formulario-conteudo text-center px-8 flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-4">{props.titulo}</h1>
            {props.subtitulo && <p className="text-lg text-gray-600 mb-6">{props.subtitulo}</p>}

            {vagaAtual && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mt-8 rounded-r-lg text-left max-w-2xl mx-auto">
                <div className="flex flex-col">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    Benefício Selecionado:
                  </p>
                  <h2 className="text-xl font-bold text-blue-900 mb-3">
                    {vagaAtual.beneficio}
                  </h2>
                  <p className="text-sm text-blue-600 mb-4 leading-relaxed">
                    {vagaAtual.descricao_beneficio}
                  </p>
                  {vagas.length > 1 && (
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => setVagaSelecionada(null)}
                      className="mt-2 self-start"
                    >
                      Alterar Benefício
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg mt-6 max-w-2xl mx-auto">
              <p className="text-sm text-gray-600">
                Você está prestes a iniciar o preenchimento do formulário para o benefício selecionado.
                Certifique-se de ter todos os documentos necessários em mãos.
              </p>
            </div>
          </div>

          <div className="footer w-full flex justify-center gap-4 pt-6">
            <Button
              onPress={() => window.history.back()}
              variant="ghost"
              className="flex-1 max-w-32"
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleNextPage}
              className="flex-1 max-w-32"
            >
              Continuar
            </Button>
          </div>
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
        min-h-screen flex items-center flex-col justify-between p-4 ${props.className || ''}
      `}>

        <div className="w-full mx-auto flex flex-col flex-1 justify-between" style={{ width: '75%', maxWidth: '1200px' }}>
          <div className="w-full">
            <BarraProgresso
              currentStep={currentStep}
              totalSteps={totalSteps}
              className="mb-6"
            />
          </div>

          <section className={`flex flex-col w-full gap-8 justify-start items-start px-8 flex-1`}>
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

          <div className="footer w-full flex justify-center gap-4 pt-6">
            <Button
              onPress={prevPage}
              disabled={currentPage === 0}
              variant="ghost"
              className="flex-1 max-w-32"
            >
              Voltar
            </Button>

            {isLastPage ? (
              <Button
                color="success"
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 max-w-48"
              >
                {isSubmitting ? 'Enviando...' : (props.botaoFinal || 'Finalizar')}
              </Button>
            ) : (
              <Button
                color="primary"
                onPress={handleNextPage}
                className="flex-1 max-w-32"
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default FormularioDinamico
