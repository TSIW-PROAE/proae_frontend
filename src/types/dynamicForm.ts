import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export type TipoInput = 'text' | 'number' | 'password' | 'email' | 'textarea' | 'select' | 'radio' | 'date' | 'file' | 'selectGroup' | 'textInputGroup'

export interface SelectOption {
  value: string;
  label: string;
}

export interface CondicaoLogica {
  campo: string;
  valor: string | string[];
  operador?: 'equals' | 'notEquals' | 'includes' | 'notIncludes';
}

export interface InputConfig {
  nome: string;
  titulo: string;
  subtitulo?: string;
  tipo: TipoInput;
  obrigatorio?: boolean;
  formatacao?: 'cpf' | 'telefone' | 'email' | 'cep' | 'dataCompleta' | 'dataMes' | 'none';
  validacao?: string | (() => z.ZodType);
  mimeType?: string[];
  options?: SelectOption[];
  questions?: string[];
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  condicao?: CondicaoLogica;
  [key: string]: any;
}

export interface PaginaConfig {
  titulo?: string;
  subtitulo?: string;
  inputs: InputConfig[];
  condicao?: CondicaoLogica;
}

export interface FormularioDinamicoProps {
  titulo: string;
  subtitulo?: string;
  botaoFinal?: string;
  paginas: PaginaConfig[];
  onSubmit: (data: FormData) => Promise<void> | void;
  initialData?: FormData;
  showProgress?: boolean;
}

export interface UseFormBuilderProps {
  config: FormularioDinamicoProps;
  initialData?: FormData;
}

export interface UseFormBuilderReturn {
  form: UseFormReturn<FormData>;
  currentPage: number;
  totalPages: number;
  progress: number;
  isLastPage: boolean;
  nextPage: () => Promise<boolean>;
  prevPage: () => void;
  goToPage: (page: number) => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  isSubmitting: boolean;
  pageErrors: Record<number, string[]> | null;
  paginasVisiveis: PaginaConfig[];
}

export interface DynamicFieldProps {
  input: InputConfig;
  form: UseFormReturn<FormData>;
  formatValue?: (value: unknown) => unknown;
}

export type FormData = Record<string, unknown>;

export type ValidationRule = z.ZodType;
export type SchemaObject = Record<string, ValidationRule>;
