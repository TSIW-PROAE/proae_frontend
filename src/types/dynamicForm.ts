import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export enum TipoInput {
  TEXT = 'text',
  NUMBER = 'number',
  PASSWORD = 'password',
  EMAIL = 'email',
  TEXT_AREA = 'textarea',
  SELECT = 'select',
  RADIO = 'radio',
  DATE = 'date',
  FILE = 'file',
  SELECT_GROUP = 'selectGroup',
  TEXT_INPUT_GROUP = 'textInputGroup',
}

export enum FormatacaoInput {
  PHONE = 'telefone',
  DATA_MES = 'dataMes',
  DATA_COMPLETA = 'dataCompleta',
  CPF = 'cpf',
  CEP = 'cep',
  CNPJ = 'cnpj',
  RG = 'rg',
  MOEDA = 'moeda',
  SINGLE_SELECT = 'single-select',
  MULTI_SELECT = 'multi-select',
  NONE = 'none',
  EMAIL = 'email'
}

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
  formatacao?: FormatacaoInput;
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
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
  initialData?: FormData;
  showProgress?: boolean;
}

export interface UseFormBuilderProps {
  editalId: number; // Obrigatório - sempre vem do backend
  onSubmit?: (data: FormData) => Promise<void> | void;
  titulo?: string;
  subtitulo?: string;
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
  // Propriedades específicas do modo backend
  isLoadingFromBackend?: boolean;
  backendError?: string | null;
}

export interface DynamicFieldProps {
  input: InputConfig;
  form: UseFormReturn<FormData>;
  formatValue?: (value: unknown) => unknown;
}

export type FormData = Record<string, unknown>;

export type ValidationRule = z.ZodType;
export type SchemaObject = Record<string, ValidationRule>;
