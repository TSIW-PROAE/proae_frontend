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
  pontuacao_validacao?: number;
}

export interface StepResponseDto {
  titulo: string;
  id: string;
  texto: string;
  /** Ordem do step dentro do edital. Quando ausente cai em 0 (legado). */
  ordem?: number;
  perguntas: PerguntaResponseDto[];
}

export interface PerguntaCondicaoApi {
  pergunta_id_origem: number;
  operador: 'equals' | 'notEquals' | 'includes' | 'notIncludes';
  valor: string | string[];
}

export interface PerguntaResponseDto {
  id: string;
  pergunta: string;
  tipo_Pergunta: TipoInput;
  obrigatoriedade: boolean;
  tipo_formatacao: FormatacaoInput;
  placeholder: string;
  opcoes: string[];
  /** Ordem da pergunta dentro do step. Default 0 = legado. */
  ordem?: number;
  /** Regra de exibição condicional (referencia outra pergunta). */
  condicao?: PerguntaCondicaoApi | null;
  /** Pontos atribuídos quando a resposta desta pergunta for validada. */
  pontuacao_validacao?: number;
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
