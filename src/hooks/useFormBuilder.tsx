import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useMemo, useEffect } from "react";
import { createDynamicSchema } from "@/components/FormularioDinamico/dynamicSchema";
import { 
  UseFormBuilderProps, 
  UseFormBuilderReturn, 
  InputConfig, 
  PaginaConfig 
} from "@/types/dynamicForm";
import { filtrarPaginasCondicionais } from "@/utils/conditionalLogic";
import { mapStepsToPaginas } from "@/utils/formAdapter";
import { prepareRespostasForSubmit, extractDadosAdicionais } from "@/utils/formSubmitHelpers";
import { stepService } from "@/services/StepService/stepService";
import { InscricaoService } from "@/services/InscricaoService/inscricao.service";
import { MinioService } from "@/services/MinioService/minio.service";
import { useFormCache } from "./useFormCache";

export function useFormBuilder(props: UseFormBuilderProps): UseFormBuilderReturn {
  const { editalId, initialData, onSubmit: backendOnSubmit } = props;

  const [paginas, setPaginas] = useState<PaginaConfig[]>([]);
  const [isLoadingFromBackend, setIsLoadingFromBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageErrors, setPageErrors] = useState<Record<number, string[]> | null>(null);

  const [selectedVagaId, setSelectedVagaId] = useState<number | null>(null);

  const minioService = useMemo(() => new MinioService(), []);

  const formSchema = useMemo(() => {
    const allInputs = paginas.flatMap((pagina: PaginaConfig) => pagina.inputs);
    return createDynamicSchema(allInputs);
  }, [paginas]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
    mode: "onChange",
    reValidateMode: "onChange"
  });

  const formData = form.watch();

  const paginasVisiveis = useMemo(() => {
    return filtrarPaginasCondicionais(paginas, formData);
  }, [paginas, formData]);

  const totalPages = paginasVisiveis.length;
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
  const isLastPage = currentPage === totalPages;

  const {
    saveToCache,
    loadFromCache,
    isSavingCache,
    lastSavedAt,
    hasUnsavedChanges,
    clearCacheState
  } = useFormCache({ form, vagaId: selectedVagaId, currentPage });


  useEffect(() => {
    loadFormConfiguration();
  }, [editalId]);

  const loadFormConfiguration = async () => {
    try {
      setIsLoadingFromBackend(true);
      setBackendError(null);

      const steps = await stepService.listarStepsPorEdital(editalId);
      const paginasConfig = mapStepsToPaginas(steps);
      
      setPaginas(paginasConfig);
    } catch (err: any) {
      setBackendError(err.message || 'Erro ao carregar formulário');
    } finally {
      setIsLoadingFromBackend(false);
    }
  };


  const validateCurrentPage = useCallback(async (): Promise<boolean> => {
    if (currentPage === 0 || paginasVisiveis.length === 0) {
      return true;
    }

    const currentPageConfig = paginasVisiveis[currentPage - 1];
    const fieldsToValidate = currentPageConfig.inputs.map((input: InputConfig) => input.nome);

    const isValid = await form.trigger(fieldsToValidate as any);

    if (!isValid) {
      const errorFields = fieldsToValidate.filter(
        (field: string) => form.formState.errors[field]
      );
      const errorTitles = errorFields.map((field: string) => {
        const input = currentPageConfig.inputs.find((q: InputConfig) => q.nome === field);
        return input?.titulo || field;
      });

      setPageErrors(prev => ({ ...prev, [currentPage]: errorTitles }));
      return false;
    }

    setPageErrors(prev => ({ ...prev, [currentPage]: [] }));
    return true;
  }, [currentPage, form, paginasVisiveis]);


  const nextPage = useCallback(async (): Promise<boolean> => {
    const isValid = await validateCurrentPage();
    if (!isValid) return false;

    if (selectedVagaId) {
      await saveToCache(true);
    }

    if (currentPage < paginasVisiveis.length) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }

    return true;
  }, [currentPage, paginasVisiveis.length, validateCurrentPage, selectedVagaId, saveToCache]);

  const prevPage = useCallback(() => {
    if (selectedVagaId) {
      saveToCache(false);
    }

    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPage, selectedVagaId, saveToCache]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < paginasVisiveis.length) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  }, [paginasVisiveis.length]);


  const submitForm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const isValid = await form.trigger();
      if (!isValid) throw new Error("Formulário contém erros");

      const formData = form.getValues();
      const dadosAdicionais = extractDadosAdicionais(formData);

      const respostas = await prepareRespostasForSubmit(
        formData,
        paginasVisiveis,
        selectedVagaId!,
        minioService
      );

      if (backendOnSubmit) {
        await backendOnSubmit({ respostas, ...dadosAdicionais });
      } else {
        await InscricaoService.getInstance().submeterRespostas({
          respostas,
          ...dadosAdicionais
        });
      }

      clearCacheState();
    } catch (error) {
      console.error('Erro ao enviar formulário', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, paginasVisiveis, selectedVagaId, backendOnSubmit, minioService, clearCacheState]);


  const resetForm = useCallback(() => {
    form.reset(initialData || {});
    setCurrentPage(0);
    setPageErrors({});
    clearCacheState();
  }, [form, initialData, clearCacheState]);


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
    saveProgress,
    loadFromCache,
    isSavingCache,
    lastSavedAt,
    hasUnsavedChanges,
    setSelectedVagaId
  };
}
