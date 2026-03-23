export enum StatusDocumento {
  Pendente = "PENDENTE",
  Aprovado = "APROVADO",
  Reprovado = "REPROVADO",
}

export interface RPendenciasAluno {
  success: boolean;
  pendencias: Pendencia[];
}

export interface Pendencia {
  inscricao_id: string;
  vaga_id?: number | null;
  edital_id?: number | null;
  is_formulario_geral?: boolean;
  is_formulario_renovacao?: boolean;
  titulo_edital: string;
  vaga_beneficio?: string | null;
  documentos: Documento[];
  ajustes_resposta?: AjusteResposta[];
}

export interface Documento {
  documento_id: string;
  tipo_documento: string;
  documento_url: string;
  status_documento: StatusDocumento;
  validacoes: Validacao[];
}

export interface Validacao {
  parecer: string;
  data_validacao: string;
}

export interface AjusteResposta {
  resposta_id: number;
  pergunta_id?: number | null;
  step_id?: number | null;
  step_texto?: string | null;
  pergunta_texto?: string | null;
  parecer?: string | null;
  prazo_reenvio?: string | null;
  prazo_resposta_nova_pergunta?: string | null;
  tipo_ajuste: "REENVIO_RESPOSTA" | "NOVA_PERGUNTA";
}
