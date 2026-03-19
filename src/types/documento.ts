export type DocumentoStatus = "Não Enviado" | "Pendente" | "Aprovado" | "Reprovado" | "Em Análise";

export interface DocumentoValidacaoResumo {
  parecer: string;
  data_validacao?: string;
  status?: "pendente" | "aprovado" | "reprovado";
}

export interface DocumentoInscricao {
  documento_id: string;
  tipo_documento: string;
  documento_url?: string | null;
  status_documento: DocumentoStatus;
  validacoes?: DocumentoValidacaoResumo[];
}

// Aliases usados por serviços antigos
export type TipoDocumento = string;
export type RDocumento = DocumentoInscricao;
