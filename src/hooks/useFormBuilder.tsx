import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useMemo, useEffect } from "react";
import { createDynamicSchema } from "@/components/FormularioDinamico/dynamicSchema";
import { UseFormBuilderProps, UseFormBuilderReturn, InputConfig, FormularioDinamicoProps, PaginaConfig, TipoInput } from "@/types/dynamicForm";
import { filtrarPaginasCondicionais } from "@/utils/conditionalLogic";
import { stepService } from "@/services/StepService/stepService";
import { InscricaoService } from "@/services/InscricaoService/inscricao.service";


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

  const defaultSchema = createDynamicSchema([]);
  const formSchema = backendConfig ? createDynamicSchema(backendConfig.paginas.flatMap((pagina: PaginaConfig) => pagina.inputs)) : defaultSchema;

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
            const respostas = Object.entries(data).map(([key, value]) => {


              const perguntaId = parseInt(key.replace('pergunta_', ''));
              const perguntaConfig = paginas
              .flatMap(p => p.inputs)
              .find(input => input.nome === key)

              const isMultiplaEscolha = perguntaConfig?.tipo === 'select';

              if(isMultiplaEscolha){
                return {
                  perguntaId: perguntaId,
                  valorTexto: Array.isArray(value) ? value.join(', ') : String(value || ''),
                  inscricaoId: Math.floor(Math.random() * 1000000),
                  valorOpcoes: [String(value)]
                };
              } else if(perguntaConfig?.tipo === 'file'){
                const fileName = typeof value === 'object' && value !== null && 'name' in value ? value.name : 'arquivo';
                const urlArquivo = `https://exemplo.com/uploads/${fileName}.pdf`;
                return {
                perguntaId: perguntaId,
                valorTexto: Array.isArray(value) ? value.join(', ') : String(value || ''),
                inscricaoId: Math.floor(Math.random() * 1000000),
                urlArquivo
              };
              }else{
                return {
                perguntaId: perguntaId,
                valorTexto: Array.isArray(value) ? value.join(', ') : String(value || ''),
                inscricaoId: Math.floor(Math.random() * 1000000)
              };
              }

            });
            
            await backendOnSubmit({ respostas });
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

    if (currentPage < paginasVisiveis.length) {
      setCurrentPage(prev => prev + 1);

      backendConfig?.onStepChange?.(currentPage + 1, totalPages);

      window.scrollTo(0, 0);
    }

    return isValid;
  }, [currentPage, paginasVisiveis.length, validateCurrentPage, backendConfig, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);

      backendConfig?.onStepChange?.(currentPage - 1, totalPages);

      window.scrollTo(0, 0);
    }
  }, [currentPage, backendConfig, totalPages]);

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
        const respostas = Object.entries(formData).map(([fieldId, value]) => {
          const perguntaId = parseInt(fieldId.replace('pergunta_', ''));
          return {
            perguntaId: perguntaId,
            valorTexto: Array.isArray(value) ? value.join(", ") : String(value || ''),
            inscricaoId: Math.floor(Math.random() * 1000000)
          };
        });

        await InscricaoService.getInstance().submeterRespostas({
          respostas
        });
      }
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
  }, [form, initialData]);

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
    backendError
  };
}
