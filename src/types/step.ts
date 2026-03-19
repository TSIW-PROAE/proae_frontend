import { TipoInput, FormatacaoInput } from "./dynamicForm";

export interface Step {
  id: string;
  texto: string;
  perguntas: Pergunta[];
}

export interface Pergunta {
  obrigatoria: any;
  tipo_pergunta: any;
  id: string;
  pergunta: string;
  tipo_Pergunta: TipoInput;
  obrigatoriedade: boolean;
  tipo_formatacao: FormatacaoInput;
  placeholder: string;
  opcoes: string[];
}

export interface StepResponseDto {
  titulo: string;
  id: string;
  texto: string;
  perguntas: PerguntaResponseDto[];
}

export interface PerguntaResponseDto {
  id: string;
  pergunta: string;
  tipo_Pergunta: TipoInput;
  obrigatoriedade: boolean;
  tipo_formatacao: FormatacaoInput;
  placeholder: string;
  opcoes: string[];
}

export interface CreateRespostaDto {
  pergunta_id: string;
  texto: string;
}

export interface UpdateRespostaDto {
  id: string;
  pergunta_id?: string;
  texto?: string;
}
