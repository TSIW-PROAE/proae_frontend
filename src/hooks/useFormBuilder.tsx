import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useMemo } from "react";
import { createDynamicSchema } from "@/components/FormularioDinamico/dynamicSchema";
import { UseFormBuilderProps, UseFormBuilderReturn, InputConfig } from "@/types/dynamicForm";
import { filtrarPaginasCondicionais } from "@/utils/conditionalLogic";

export function useFormBuilder({
  config,
  initialData
}: UseFormBuilderProps): UseFormBuilderReturn {
  const formSchema = createDynamicSchema(config.paginas.flatMap(pagina => pagina.inputs));

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
    mode: "onChange",
    reValidateMode: "onChange"
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageErrors, setPageErrors] = useState<Record<number, string[]> | null>(null);

  const formData = form.watch();

  const paginasVisiveis = useMemo(() => {
    return filtrarPaginasCondicionais(config.paginas, formData);
  }, [config.paginas, formData]);

  const totalPages = paginasVisiveis.length;

  const progress = ((currentPage + 1) / totalPages) * 100;
  const isLastPage = currentPage === totalPages;

  const validateCurrentPage = useCallback(async (): Promise<boolean> => {

    if (currentPage === 0) {
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
  }, [currentPage, form, paginasVisiveis]);

  const nextPage = useCallback(async (): Promise<boolean> => {

    const isValid = await validateCurrentPage();


    if (!isValid) {
      return false;
    }

    if (currentPage < paginasVisiveis.length) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }

    return isValid;
  }, [currentPage, paginasVisiveis.length, validateCurrentPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

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

      if (config.onSubmit) {
        await config.onSubmit(formData);
      }
    } catch (error) {
      console.error('Erro ao enviar formulário', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, config.onSubmit]);

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
    paginasVisiveis
  };
}
