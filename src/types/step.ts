export interface Step {
  id?: number;
  // Alguns backends usam 'texto' como título do step
  titulo?: string;
  texto?: string;
  descricao?: string;
  ordem?: number;
  status?: boolean;
  edital_id: number;
  perguntas?: Pergunta[];
  created_at?: string;
  updated_at?: string;
}

export interface Pergunta {
  id?: number;
  // Variações de campos conforme backend
  texto_pergunta?: string;
  pergunta?: string;
  tipo_pergunta?:
    | "texto"
    | "texto_curto"
    | "numero"
    | "data"
    | "multipla_escolha"
    | "multipla_selecao"
    | "arquivo"
    | "email";
  tipo_Pergunta?: string;
  tipo_formatacao?: string;
  obrigatoria?: boolean;
  obrigatoriedade?: boolean;
  opcoes_resposta?: string[];
  opcoes?: string[];
  validacoes?: Record<string, unknown>;
  step_id: number;
  created_at?: string;
  updated_at?: string;
}
