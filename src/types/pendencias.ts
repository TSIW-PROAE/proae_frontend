enum StatusDocumento {
  Pendente = "PENDENTE",
  Aprovado = "APROVADO",
  Reprovado = "REPROVADO",
}

export interface RPendenciasAluno {
  success: boolean;
  pendencias: Pendencia[];
}

export interface Pendencia {
  inscricao_id: number;
  titulo_edital: string;
  documentos: Documento[];
}

export interface Documento {
  documento_id: number;
  tipo_documento: string;
  documento_url: string;
  status_documento: StatusDocumento;
  validacooes: Validacao[];
}

export interface Validacao {
  parecer: string;
  data_validacao: string;
}
