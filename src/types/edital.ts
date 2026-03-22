export interface EtapaEdital {
  etapa: string;
  ordem_elemento: number;
  data_inicio: string;
  data_fim: string;
}

export interface DocumentoEdital {
  titulo_documento: string;
  url_documento: string;
}

export interface Vaga {
  id?: string;
  edital_id: string;
  beneficio: string;
  descricao_beneficio: string;
  numero_vagas: number;
  created_at?: string;
  updated_at?: string;
}

export interface Edital {
  id?: string;
  titulo_edital: string;
  descricao?: string;
  edital_url?: DocumentoEdital[];
  status_edital: "RASCUNHO" | "ABERTO" | "ENCERRADO" | "EM_ANDAMENTO";
  etapa_edital?: EtapaEdital[];
  vagas?: Vaga[];
  possui_inscricoes?: boolean;
  total_inscricoes?: number;
  created_at?: string;
  updated_at?: string;
  is_formulario_geral?: boolean;
  is_formulario_renovacao?: boolean;
  /** Graduação | Pós-graduação */
  nivel_academico?: string;
  /** Fim da vigência no portal (YYYY-MM-DD ou ISO) */
  data_fim_vigencia?: string | null;
}

export interface CreateEditalRequest {
  titulo_edital: string;
  /** Graduação (padrão API) ou Pós-graduação */
  nivel_academico?: string;
  descricao?: string;
  edital_url?: DocumentoEdital[];
  etapa_edital?: EtapaEdital[];
}

export interface UpdateEditalRequest {
  titulo_edital?: string;
  descricao?: string;
  edital_url?: DocumentoEdital[];
  etapa_edital?: EtapaEdital[];
  data_fim_vigencia?: string | null;
  nivel_academico?: string;
}
