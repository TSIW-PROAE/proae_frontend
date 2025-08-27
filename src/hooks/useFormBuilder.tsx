import {  useForm } from "react-hook-form";
import type { UseFormReturn, FieldValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback } from "react";
import { createDynamicSchema } from "./DynamicFormSchema";

interface FormularioDinamicoProps<T>{
  pages: Array<{
    title: string;
    subtitle?: string;
    questions: Array<{
      name: string;
      title: string;
      type: string;
      required?: boolean;
      formatting?: string;
      [key: string] : any;
    }>
  }>
  onSubmit: (data:T ) => Promise<T | void>;
  [key: string] : any
}

interface UseFormBuilderProps{
  config: FormularioDinamicoProps<any>;
  initialData?: Record<string, any>;
}

interface UseFormBuilderReturn<T>{
  form: UseFormReturn<T>;
  currentPage: number
  totalPages: number;
  progress: number;
  isLastPage: boolean;

  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;

  submitForm: () => Promise<void>;
  resetForm: () => void;

  isSubmitting: boolean;
  pageErrors: Record<number, string[]> | null;
}

export function useFormBuilder<T>({config, initialData}: UseFormBuilderProps): UseFormBuilderReturn<any> {
  const formSchema = createDynamicSchema(config.pages.flatMap(page => page.questions));

  const form = useForm<T>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onBlur",
    reValidateMode: "onChange"
  })

  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageErrors, setPageErrors] = useState<Record<number, string[]> | null>(null);

  const totalPages = config.pages.length;
  const progress = ((currentPage + 1) / totalPages) * 100;
  const isLastPage = currentPage === totalPages - 1;

  const validateCurrentPage = useCallback(async (): Promise<boolean> => {
    if(currentPage == 0) return true;

    const currentPageConfig = config.pages[currentPage - 1];
    const fieldsToValidate = currentPageConfig.questions.map(q => q.name);

    const isValid = await form.trigger(fieldsToValidate as any);

    if(!isValid) {
      const errors = form.formState.errors;
      const pageErroList = fieldsToValidate
        .filter(field => errors[field as keyof typeof errors])
        .map(field => {
          const inputConfig = currentPageConfig.questions.find(q => q.name === field);
          return inputConfig?.title || field;
        })
      setPageErrors(prev => ({ ...prev, [currentPage]: pageErroList }));
      return false;
    }

    setPageErrors(prev => ({ ...prev, [currentPage]: [] }));
    return true;

  }, [currentPage, form, config.pages]);

  const nextPage = useCallback(async (): Promise<boolean> => {
      const isValid = await validateCurrentPage();

      if(!isValid) return false;

      if(currentPage < config.pages.length){
        setCurrentPage(prev => prev + 1);
        window.scrollTo(0,0);
        return true;
      }

      return false;
  }, [currentPage, config.pages]);

  const prevPage = useCallback(() => {
    if(currentPage > 0){
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0,0);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) =>{
    if(page >= 0 && page < config.pages.length){
      setCurrentPage(page);
      window.scrollTo(0,0);
    }
  }, [config.pages.length]);

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const isValid = await form.trigger();
      if(!isValid) throw new Error("Formulário contém erros");

      const formData = form.getValues();

      if(config.onSubmit){
        await config.onSubmit(formData);
      }
    } catch (error) {
      console.error('Erro ao enviar formulário',error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, config.onSubmit]);

  const resetForm = useCallback(() => {
    form.reset(initialData as T);
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
    pageErrors
  }
}
