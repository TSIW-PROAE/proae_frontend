export interface ValidacaoCreateDto {
  parecer: string;
  status?: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string; // formato YYYY-MM-DD
  responsavel_id: number;
  questionario_id?: number | null;
  documento_id?: number | null;
}

export interface Validacao {
  id: number;
  parecer: string;
  status: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel: {
    usuario_id: number;
    nome: string;
    email: string;
  };
  questionario?: {
    id: number;
    texto: string;
  } | null;
  created_at: string;
  updated_at: string;
}
