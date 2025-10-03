import { TipoInput, FormatacaoInput } from './dynamicForm';

export interface Step {
  id: number;
  texto: string;
  perguntas: Pergunta[];
}

export interface Pergunta {
  id: number;
  pergunta: string;
  tipo_Pergunta: TipoInput;
  obrigatoriedade: boolean;
  tipo_formatacao: FormatacaoInput;
  placeholder: string;
  opcoes: string[];
}

export interface StepResponseDto {
  id: number;
  texto: string;
  perguntas: PerguntaResponseDto[];
}

export interface PerguntaResponseDto {
  id: number;
  pergunta: string;
  tipo_Pergunta: TipoInput;
  obrigatoriedade: boolean;
  tipo_formatacao: FormatacaoInput;
  placeholder: string;
  opcoes: string[];
}

export interface CreateRespostaDto {
  pergunta_id: number;
  texto: string;
}

export interface UpdateRespostaDto {
  id: number;
  pergunta_id?: number;
  texto?: string;
}
