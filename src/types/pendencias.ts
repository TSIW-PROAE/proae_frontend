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
  titulo_edital: string;
  documentos: Documento[];
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
