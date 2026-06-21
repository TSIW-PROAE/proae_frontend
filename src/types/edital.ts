export interface EtapaEdital {
  etapa: string;
  /** Tipo semântico opcional da etapa (ex.: INSCRICAO, RECURSO). */
  tipo_etapa?: string;
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
  edital_id: number;
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
  /** Controle manual de abertura/fechamento de inscrições no edital. */
  inscricoes_abertas?: boolean;
  /** Controle manual de abertura/fechamento de ajustes de pendências. */
  ajustes_abertos?: boolean;
  /** Quando true, representa o edital de renovação anual. */
  is_formulario_renovacao?: boolean;
  etapa_edital?: EtapaEdital[];
  vagas?: Vaga[];
  possui_inscricoes?: boolean;
  total_inscricoes?: number;
  created_at?: string;
  updated_at?: string;
  /** Graduação | Pós-graduação */
  nivel_academico?: string;
  /** Fim da vigência no portal (YYYY-MM-DD ou ISO) */
  data_fim_vigencia?: string | null;
}

export interface CreateEditalRequest {
  titulo_edital: string;
  /** Graduação (padrão API) ou Pós-graduação */
  nivel_academico?: string;
  /** Aplica o template padrão de perguntas com peso no novo edital. */
  aplicar_template_cadastro?: boolean;
  /** Marca o edital como processo de renovação anual. */
  is_formulario_renovacao?: boolean;
  /** Libera/fecha inscrições de alunos no edital. */
  inscricoes_abertas?: boolean;
  /** Libera/fecha ajustes/correções de pendências no edital. */
  ajustes_abertos?: boolean;
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
  is_formulario_renovacao?: boolean;
  inscricoes_abertas?: boolean;
  ajustes_abertos?: boolean;
}
