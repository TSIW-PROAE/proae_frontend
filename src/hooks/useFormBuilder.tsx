import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { createDynamicSchema } from "@/components/FormularioDinamico/dynamicSchema";
import { UseFormBuilderProps, UseFormBuilderReturn, InputConfig, FormularioDinamicoProps, PaginaConfig, TipoInput } from "@/types/dynamicForm";
import { filtrarPaginasCondicionais } from "@/utils/conditionalLogic";
import { stepService } from "@/services/StepService/stepService";
import { InscricaoService } from "@/services/InscricaoService/inscricao.service";
import toast from "react-hot-toast";
import { MinioService } from "@/services/MinioService/minio.service";



export function useFormBuilder(props: UseFormBuilderProps): UseFormBuilderReturn {
  const {
    editalId,
    initialData,
    onSubmit: backendOnSubmit,
    titulo = "Formulário de Inscrição",
    subtitulo = "Preencha todas as etapas para concluir sua inscrição"
  } = props;

  const [backendConfig, setBackendConfig] = useState<FormularioDinamicoProps | null>(null);
  const [isLoadingFromBackend, setIsLoadingFromBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageErrors, setPageErrors] = useState<Record<number, string[]> | null>(null);
  const [isSavingCache, setIsSavingCache] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedVagaId, setSelectedVagaId] = useState<number | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");
  const inscricaoService = InscricaoService.getInstance();

  const defaultSchema = createDynamicSchema([]);
  const formSchema = backendConfig ? createDynamicSchema(backendConfig.paginas.flatMap((pagina: PaginaConfig) => pagina.inputs)) : defaultSchema;

  const minioService = new MinioService();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
    mode: "onChange",
    reValidateMode: "onChange"
  });

  const formData = form.watch();

  const paginasVisiveis = useMemo(() => {
    return backendConfig ? filtrarPaginasCondicionais(backendConfig.paginas, formData) : [];
  }, [backendConfig, formData]);

  const totalPages = paginasVisiveis.length;
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
  const isLastPage = currentPage === totalPages;


  const prepareRespostasForCache = useCallback((data: Record<string, any>) => {
    return Object.entries(data)
      .filter(([key]) => key.startsWith('pergunta_'))
      .map(([key, value]) => {
        const perguntaId = parseInt(key.replace('pergunta_', ''));
        
        if (value instanceof File) {
          return {
            perguntaId,
            valorTexto: value.name,
          };
        }
        
        if (Array.isArray(value)) {
          return {
            perguntaId,
            valorOpcoes: value,
            valorTexto: value.join(', ')
          };
        }
        
        return {
          perguntaId,
          valorTexto: String(value || '')
        };
      });
  }, []);


  const saveToCache = useCallback(async (showToast = false) => {
    if (!selectedVagaId || isSavingCache) return;

    const currentData = form.getValues();
    const respostas = prepareRespostasForCache(currentData);
    
    const currentDataString = JSON.stringify(respostas);
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    try {
      setIsSavingCache(true);
      
      await inscricaoService.salvarRespostas(selectedVagaId, respostas);
      
      lastSavedDataRef.current = currentDataString;
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      
      if (showToast) {
        toast.success('Progresso salvo!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
      if (showToast) {
        toast.error('Erro ao salvar progresso');
      }
    } finally {
      setIsSavingCache(false);
    }
  }, [selectedVagaId, form, prepareRespostasForCache, isSavingCache]);


  const loadFromCache = useCallback(async (vagaId: number) => {
    try {
      const response = await inscricaoService.buscarRespostas(vagaId);
      
      if (response?.respostas && response.respostas.length > 0) {
        const cachedData: Record<string, any> = {};
        
        response.respostas.forEach((resposta: any) => {
          const fieldName = `pergunta_${resposta.perguntaId}`;
          
          if (resposta.valorTexto.endsWith('.pdf')){
            cachedData[fieldName] = null;
          } else if (resposta.valorOpcoes && resposta.valorOpcoes.length > 0) {
            cachedData[fieldName] = resposta.valorOpcoes;
          } else {
            cachedData[fieldName] = resposta.valorTexto || '';
          }
        });
        
        Object.entries(cachedData).forEach(([key, value]) => {
          if (value !== null) {
            form.setValue(key, value);
          }
        });
        
        lastSavedDataRef.current = JSON.stringify(response.respostas);
        setLastSavedAt(new Date());
        
        toast.success('Progresso anterior restaurado!', { duration: 3000 });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao carregar cache:', error);
      return false;
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (selectedVagaId && currentPage > 0) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, selectedVagaId, currentPage]);
  


  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && selectedVagaId) {
        saveToCache(false);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, selectedVagaId, saveToCache]);


  useEffect(() => {
    loadFormConfiguration();
  }, [editalId]);

  const loadFormConfiguration = async () => {
    try {
      setIsLoadingFromBackend(true);
      setBackendError(null);

      const steps = await stepService.listarStepsPorEdital(editalId);

      const paginas: PaginaConfig[] = steps.map(step => ({
        titulo: step.texto,
        inputs: step.perguntas.map(pergunta => ({
          nome: `pergunta_${pergunta.id}`,
          titulo: pergunta.pergunta,
          tipo: pergunta.tipo_Pergunta as TipoInput,
          obrigatorio: pergunta.obrigatoriedade,
          formatacao: pergunta.tipo_formatacao,
          options: pergunta.opcoes?.map(opcao => ({
            value: opcao,
            label: opcao
          })) || [],
          placeholder: pergunta.placeholder
        }))
      }));

      const formConfig: FormularioDinamicoProps = {
        titulo,
        subtitulo,
        botaoFinal: 'Finalizar Inscrição',
        paginas,
        onSubmit: async (data) => {
          if (backendOnSubmit) {
            const dadosAdicionais = Object.entries(data)
              .filter(([key]) => !key.startsWith('pergunta_'))
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, any>);

            // Processar respostas com upload de arquivos
            const respostas = await Promise.all(
              Object.entries(data)
                .filter(([key]) => key.startsWith('pergunta_'))
                .map(async ([key, value]) => {
                  const perguntaId = parseInt(key.replace('pergunta_', ''));
                  const perguntaConfig = paginas
                    .flatMap(p => p.inputs)
                    .find(input => input.nome === key);

                  const isMultiplaEscolha = perguntaConfig?.tipo === 'select';
                  const isFile = perguntaConfig?.tipo === 'file';

                  if (isMultiplaEscolha) {
                    return {
                      perguntaId: perguntaId,
                      valorTexto: Array.isArray(value) ? value.join(', ') : String(value || ''),
                      valorOpcoes: Array.isArray(value) ? value : [String(value)]
                    };
                  } else if (isFile && value instanceof File) {
                    // Upload do arquivo para o MinIO
                    try { 
                      const urlArquivo = await minioService.uploadDocument(value, selectedVagaId!);
                      return {
                        perguntaId: perguntaId,
                        urlArquivo: urlArquivo
                      };
                    } catch (uploadError) {
                      console.error('Erro no upload:', uploadError);
                      throw new Error(`Falha no upload do arquivo: ${value.name}`);
                    }
                  } else {
                    return {
                      perguntaId: perguntaId,
                      valorTexto: Array.isArray(value) ? value.join(', ') : String(value || '')
                    };
                  }
                })
            );

            await backendOnSubmit({ respostas, ...dadosAdicionais });
          }
        },
        showProgress: true
      };

      setBackendConfig(formConfig);
    } catch (err: any) {
      setBackendError(err.message || 'Erro ao carregar formulário');
    } finally {
      setIsLoadingFromBackend(false);
    }
  };

  const validateCurrentPage = useCallback(async (): Promise<boolean> => {
    if (currentPage === 0 || !backendConfig) {
      return true;
    }

    const currentPageConfig = paginasVisiveis[currentPage - 1];
    const fieldsToValidate = currentPageConfig.inputs.map((input: InputConfig) => input.nome);

    console.log(form.formState.errors);
    const isValid = await form.trigger(fieldsToValidate as any);
    

    if (!isValid) {
      const pageErrorList = fieldsToValidate
        .filter((field: string) => form.formState.errors[field])
        .map((field: string) => {
          const inputConfig = currentPageConfig.inputs.find((q: InputConfig) => q.nome === field);
          return inputConfig?.titulo || field;
        });

      setPageErrors(prev => ({ ...prev, [currentPage]: pageErrorList }));
      return false;
    }

    setPageErrors(prev => ({ ...prev, [currentPage]: [] }));
    return true;
  }, [currentPage, form, paginasVisiveis, backendConfig]);

  const nextPage = useCallback(async (): Promise<boolean> => {
    const isValid = await validateCurrentPage();

    if (!isValid) {
      return false;
    }

    // Salva no cache ao avançar de página
    if (selectedVagaId) {
      await saveToCache(true);
    }

    if (currentPage < paginasVisiveis.length) {
      setCurrentPage(prev => prev + 1);

      backendConfig?.onStepChange?.(currentPage + 1, totalPages);

      window.scrollTo(0, 0);
    }

    return isValid;
  }, [currentPage, paginasVisiveis.length, validateCurrentPage, backendConfig, totalPages, selectedVagaId, saveToCache]);

  const prevPage = useCallback(() => {
    // Salva no cache ao voltar de página
    if (selectedVagaId) {
      saveToCache(false);
    }

    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);

      backendConfig?.onStepChange?.(currentPage - 1, totalPages);

      window.scrollTo(0, 0);
    }
  }, [currentPage, backendConfig, totalPages, selectedVagaId, saveToCache]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < paginasVisiveis.length) {
      setCurrentPage(page);

      backendConfig?.onStepChange?.(page, totalPages);

      window.scrollTo(0, 0);
    }
  }, [paginasVisiveis.length, backendConfig, totalPages]);

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const isValid = await form.trigger();
      if (!isValid) throw new Error("Formulário contém erros");

      const formData = form.getValues();
      if (backendConfig?.onSubmit) {
        await backendConfig.onSubmit(formData);
      } else {
        // Extrair dados adicionais PRIMEIRO
        const dadosAdicionais = Object.entries(formData)
          .filter(([key]) => !key.startsWith('pergunta_'))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, any>);

        // Processar respostas e fazer upload de arquivos
        const respostas = await Promise.all(
          Object.entries(formData)
            .filter(([fieldId]) => fieldId.startsWith('pergunta_'))
            .map(async ([fieldId, value]) => {
              const perguntaId = parseInt(fieldId.replace('pergunta_', ''));

              // Se for arquivo, fazer upload e obter URL
              if (value instanceof File) {
                try {
                  const urlArquivo = await minioService.uploadDocument(value, selectedVagaId!);
                  return {
                    perguntaId: perguntaId,
                    urlArquivo: urlArquivo
                  };
                } catch (uploadError) {
                  console.error('Erro no upload:', uploadError);
                  throw new Error(`Falha no upload do arquivo`);
                }
              }

              // Para outros tipos de campo
              if (Array.isArray(value)) {
                return {
                  perguntaId: perguntaId,
                  valorOpcoes: value,
                  valorTexto: value.join(", ")
                };
              }

              return {
                perguntaId: perguntaId,
                valorTexto: String(value || '')
              };
            })
        );

        console.log(respostas);

        await InscricaoService.getInstance().submeterRespostas({
          respostas,
          ...dadosAdicionais
        });
      }
      
      // Limpa cache após submissão bem-sucedida
      setHasUnsavedChanges(false);
      lastSavedDataRef.current = "";
      
    } catch (error) {
      console.error('Erro ao enviar formulário', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, backendConfig, editalId]);

  const resetForm = useCallback(() => {
    form.reset(initialData || {});
    setCurrentPage(0);
    setPageErrors({});
    setHasUnsavedChanges(false);
    lastSavedDataRef.current = "";
  }, [form, initialData]);

  /**
   * Salvar progresso manualmente
   */
  const saveProgress = useCallback(async () => {
    await saveToCache(true);
  }, [saveToCache]);

  return {
    form,
    currentPage,
    totalPages,
    progress,
    isLastPage,
    nextPage,
    prevPage,
    goToPage,
    submitForm,
    resetForm,
    isSubmitting,
    pageErrors,
    paginasVisiveis,
    isLoadingFromBackend,
    backendError,
    // Cache functions
    saveProgress,
    loadFromCache,
    isSavingCache,
    lastSavedAt,
    hasUnsavedChanges,
    setSelectedVagaId
  };
}
