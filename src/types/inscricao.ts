export interface RespostaStep {
  resposta_id: string;
  pergunta_id: string;
  pergunta_texto: string;
  resposta_texto: string;
  data_resposta: string;
  validada?: boolean;
  data_validacao?: string;
  valor_texto?: string | null;
  valor_opcoes?: string[] | null;
  url_arquivo?: string | null;
}

export interface AlunoInscrito {
  aluno_id: string;
  /** UUID (backend) ou número legado */
  usuario_id: string | number;
  email: string;
  nome: string;
  matricula: string;
  cpf: string;
  celular: string;
  curso: string;
  campus: string;
  data_nascimento: string;
  data_ingresso: string;
  inscricao_id: string;
  status_inscricao: string;
  /** Categoria operacional do edital (selecionada/classificada/indeferida/desistente). */
  situacao_solicitacao?: "SELECIONADA" | "CLASSIFICADA" | "INDEFERIDA" | "DESISTENTE";
  /** Parecer / motivo visível ao aluno (quando aplicável) */
  observacao_admin?: string | null;
  /** Benefício no edital (homologação por vaga). */
  status_beneficio_edital?: string;
  /** Fase de publicação do resultado (não publicado/preliminar/final). */
  resultado_fase?: string;
  /** Situação de recurso administrativo. */
  recurso_status?: string;
  /** Parecer do recurso (quando houver). */
  recurso_observacao?: string | null;
  resultado_publicado_em?: string | null;
  beneficio_nome?: string | null;
  pontuacao_validada?: number;
  pontuacao_maxima?: number;
  data_inscricao: string;
  respostas_step?: RespostaStep[];
  /** Resposta antiga do GET /editais/:id/inscritos (achatar no service) */
  usuario?: {
    usuario_id?: string;
    email?: string;
    nome?: string;
    cpf?: string;
    celular?: string;
    data_nascimento?: string;
  };
}

export interface EditalInfo {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
}

export interface StepInfo {
  id: string;
  texto: string;
}

export interface PaginacaoPadrao {
  pagina: number;
  limite: number;
  total_itens: number;
  total_paginas: number;
  tem_anterior: boolean;
  tem_proxima: boolean;
}

export interface ListaAlunosInscritosResponse {
  sucesso: boolean;
  dados: {
    edital: EditalInfo;
    step: StepInfo;
    total_alunos: number;
    alunos: AlunoInscrito[];
    paginacao?: PaginacaoPadrao;
  };
}

export interface ListaInscritosEditalResponse {
  dados: AlunoInscrito[];
  paginacao: PaginacaoPadrao;
}

// Mantendo compatibilidade com código existente
export interface Inscricao {
  inscricao_id?: string;
  edital_id?: string;
  aluno_id: string;
  status_inscricao?: "PENDENTE" | "APROVADA" | "REPROVADA" | "EM_ANALISE";
  data_inscricao?: string;
  updated_at?: string;
  // Dados do aluno (vindos da rota de alunos)
  matricula?: string;
  email: string;
  cpf?: string;
  curso?: string;
  campus?: string;
  celular?: string;
  data_ingresso?: string;
  data_nascimento?: string;
  nome?: string;
  // Compatibilidade com possíveis formatos diferentes
  aluno_nome?: string;
  aluno_email?: string;
  aluno_matricula?: string;
  aluno_curso?: string;
  aluno_campus?: string;
  // Dados do edital
  edital_titulo?: string;
}

export interface ListaInscricoesResponse {
  sucesso: boolean;
  dados: Inscricao[];
  mensagem?: string;
}

export interface InscricaoErrorResponse {
  sucesso: boolean;
  mensagem: string;
}
