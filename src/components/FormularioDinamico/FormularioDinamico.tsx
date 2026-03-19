import React, { useState, useEffect, useRef } from 'react';
import { FormProvider } from 'react-hook-form';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { DynamicField } from './DynamicField';
import { Button } from '@heroui/react';
import toast, { Toaster } from 'react-hot-toast';
import { filtrarInputsCondicionais } from '@/utils/conditionalLogic';
import { VagasService } from '@/services/VagasService/vagas.service';
import { FetchAdapter } from '@/services/api';
import { useParams } from 'react-router-dom';
import { GradeBeneficios } from '@/components/GradeBeneficios/GradeBeneficios';
import { VagaResponse as Vaga } from '@/types/vaga';
import { InscricaoService } from "@/services/InscricaoService/inscricao.service.ts"
import { useNavigate } from "react-router-dom"
import BarraProgresso  from '@/components/BarraProgresso/BarraProgresso';
import type { PaginaConfig } from "@/types/dynamicForm";

interface FormularioDinamicoProps {
  editalId?: string;
  titulo?: string;
  subtitulo?: string;
  botaoFinal?: string;
  onSuccess?: (data: Record<string, any>) => void;
  onError?: (error: string) => void;
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
  onSubmit?: (data: Record<string, any>) => void;
  /** URL para redirecionar após envio com sucesso (default: /portal-aluno) */
  successRedirectUrl?: string;
  /** Páginas/perguntas já carregadas (ex.: steps do GET /formulario-geral). Quando informado, não busca steps na API. */
  initialPaginas?: PaginaConfig[];
  /** Vagas já carregadas (ex.: do GET /formulario-geral). Quando informado, não busca vagas na API — evita dessincronia. */
  initialVagas?: Array<{ id: number; beneficio?: string; descricao_beneficio?: string; numero_vagas?: number }>;
  loading?: React.ReactNode;
  className?: string;
  initialData?: Record<string, any>;
}

export const FormularioDinamico: React.FC<FormularioDinamicoProps> = (props) => {
  const { editalId: editalIdParam } = useParams<{ editalId: string }>();
  const editalId = props.editalId != null ? String(props.editalId) : (editalIdParam ?? "");
  const vagasService = new VagasService(new FetchAdapter());

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [vagaSelecionada, setVagaSelecionada] = useState<string | null>(null);
  const [isLoadingVagas, setIsLoadingVagas] = useState(true);
  const [vagasError, setVagasError] = useState<string | null>(null);

  const inscricaoService = InscricaoService.getInstance();
  const navigate = useNavigate();

  const builderProps = {
    editalId: editalId || "",
    titulo: props.titulo,
    subtitulo: props.subtitulo,
    initialPaginas: props.initialPaginas,
    onSubmit: async (data: Record<string, any>) => {
      try {
        await inscricaoService.submeterRespostas(data);
        if (props.onSuccess) {
          props.onSuccess(data);
        } else {
          navigate(props.successRedirectUrl ?? "/portal-aluno");
        }
      } catch (err: any) {
        const msg =
          err?.message ||
          err?.mensagem ||
          (typeof err === "string" ? err : "Não foi possível enviar o formulário.");
        props.onError?.(msg);
        throw new Error(msg);
      }
    }
  };

  useEffect(() => {
    if (props.initialVagas?.length) {
      const vagasData: Vaga[] = (props.initialVagas as any[]).map((v) => ({
        ...(v as any),
        id: String((v as any).id),
      }));
      setVagas(vagasData);
      setVagasError(null);
      setIsLoadingVagas(false);
      if (vagasData.length === 1) {
        setVagaSelecionada(vagasData[0].id);
      }
      return;
    }

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
  }, [editalId, props.initialVagas]);

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
    backendError,
    saveProgress,
    loadFromCache,
    isSavingCache,
    lastSavedAt,
    hasUnsavedChanges,
    setSelectedVagaId
  } = useFormBuilder(builderProps);

  const totalSteps = paginasVisiveis ? paginasVisiveis.length + 1 : 1;
  const currentStep = currentPage + 1;

  useEffect(() => {
    props.onStepChange?.(currentStep, totalSteps);
  }, [currentStep, totalSteps, props]);

  useEffect(() => {
    if (form && vagaSelecionada !== null) {
      form.setValue('vaga_id', vagaSelecionada);
      setSelectedVagaId(vagaSelecionada);
      
      loadFromCache(vagaSelecionada).then((hasCache) => {
        if (hasCache) {
          console.log('Cache carregado com sucesso');
        }
      });
      
    }
  }, [form, vagaSelecionada, setSelectedVagaId, loadFromCache]);

  const navigatingRef = useRef(false);

  const handleNextPage = async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    try {
      const success = await nextPage();

      if (!success) {
        if (pageErrors !== null && pageErrors[currentPage] && pageErrors[currentPage].length > 0) {
          const errorMessage = `Corrija os seguintes campos: ${pageErrors[currentPage].join(", ")}`;
          toast.error(errorMessage);
        } else {
          toast.error("Por favor, preencha todos os campos obrigatórios");
        }
      }
    } finally {
      setTimeout(() => { navigatingRef.current = false; }, 300);
    }
  }

  const handleSubmit = async () => {
    try {
      await submitForm();
      toast.success("Formulário enviado com sucesso!");
    } catch (err: any) {
      const msg = err?.message || "Não foi possível enviar o formulário.";
      toast.error(msg, { duration: 6000 });
    }
  }

  const handleSelectVaga = (vaga_id: string) => {
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

        <div className="w-full mx-auto flex flex-col flex-1 justify-between max-w-3xl px-4">
          <div className="w-full">
            <BarraProgresso
              currentStep={currentStep}
              totalSteps={totalSteps}
              className="mb-6"
            />
          </div>

          <div className="formulario-conteudo text-center flex-1 flex flex-col justify-center">
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
  if (!currentPageConfig) {
    const safePageIdx = Math.min(currentPage, paginasVisiveis.length);
    if (safePageIdx !== currentPage) {
      setTimeout(() => prevPage(), 0);
    }
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  const formData = form.watch();
  const inputsDaPagina = currentPageConfig.inputs ?? [];
  const inputsVisiveis = filtrarInputsCondicionais(inputsDaPagina, formData);

  return (
    <FormProvider {...form}>
      <Toaster position="top-right" />
      <div className={`
        min-h-screen flex items-center flex-col justify-between p-4 ${props.className || ''}
      `}>

        <div className="w-full mx-auto flex flex-col flex-1 justify-between max-w-3xl px-4">
          <div className="w-full">
            <BarraProgresso
              currentStep={currentStep}
              totalSteps={totalSteps}
              className="mb-6"
            />
          </div>

          <section className="flex flex-col w-full gap-8 justify-start items-start flex-1">
          <section className='formulario-conteudo'>
            <h1>{currentPageConfig.titulo ?? 'Formulário'}</h1>
          </section>
          {inputsVisiveis.map((input) => (
            <DynamicField
              key={input.nome}
              input={input}
              form={form}
            />
          ))}
          </section>

          {/* Status de salvamento */}
          <div className="w-full flex items-center justify-center gap-4 py-3 text-sm">
            {isSavingCache && (
              <div className="flex items-center gap-2 text-blue-600">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Salvando progresso...</span>
              </div>
            )}
            {!isSavingCache && lastSavedAt && (
              <div className="flex items-center gap-2 text-green-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Salvo às {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {!isSavingCache && hasUnsavedChanges && !lastSavedAt && (
              <div className="flex items-center gap-2 text-amber-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>Alterações não salvas</span>
              </div>
            )}
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onPress={() => saveProgress()}
              disabled={isSavingCache || !hasUnsavedChanges}
              className="ml-2"
            >
              Salvar progresso
            </Button>
          </div>

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
                className="flex-1 max-w-64 whitespace-nowrap"
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
