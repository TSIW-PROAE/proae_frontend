enum StatusDocumento {
  Pendente = "PENDENTE",
  Aprovado = "APROVADO",
  Reprovado = "REPROVADO",
}

interface RPendenciasAluno {
  pendencias: Pendencia[];
}

interface Pendencia {
  inscricao_id: number;
  titulo_edital: string;
  documentos: Documento[];
}

interface Documento {
  documento_id: number;
  tipo_documento: string;
  documento_url: string;
  status_documento: StatusDocumento;
  validacooes: Validacao[];
}

interface Validacao {
  parecer: string;
  data_validacao: string;
}
