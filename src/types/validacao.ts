export interface ValidacaoCreateDto {
  parecer: string;
  status?: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string; // formato YYYY-MM-DD
  responsavel_id: string;
  questionario_id?: string | null;
  documento_id?: string | null;
}

export interface Validacao {
  id: string;
  parecer: string;
  status: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel: {
    usuario_id: number;
    nome: string;
    email: string;
  };
  questionario?: {
    id: string;
    texto: string;
  } | null;
  created_at: string;
  updated_at: string;
}
