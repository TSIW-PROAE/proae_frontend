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
  id?: number;
  edital_id: number;
  beneficio: string;
  descricao_beneficio: string;
  numero_vagas: number;
  created_at?: string;
  updated_at?: string;
}

export interface Edital {
  id?: number;
  titulo_edital: string;
  descricao?: string;
  edital_url?: DocumentoEdital[];
  status_edital: "RASCUNHO" | "ABERTO" | "ENCERRADO" | "EM_ANDAMENTO";
  etapa_edital?: EtapaEdital[];
  vagas?: Vaga[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateEditalRequest {
  titulo_edital: string;
  descricao?: string;
  edital_url?: DocumentoEdital[];
  etapa_edital?: EtapaEdital[];
}

export interface UpdateEditalRequest {
  titulo_edital?: string;
  descricao?: string;
  edital_url?: DocumentoEdital[];
  etapa_edital?: EtapaEdital[];
}
