export interface RespostaStep {
  pergunta_id: number;
  pergunta_texto: string;
  resposta_texto: string;
  data_resposta: string;
}

export interface AlunoInscrito {
  aluno_id: number;
  usuario_id: number;
  email: string;
  nome: string;
  matricula: string;
  cpf: string;
  celular: string;
  curso: string;
  campus: string;
  data_nascimento: string;
  data_ingresso: string;
  inscricao_id: number;
  status_inscricao: "PENDENTE" | "APROVADA" | "REPROVADA" | "EM_ANALISE" | "Pendente" | "Aprovada" | "Reprovada" | "Em Análise";
  data_inscricao: string;
  respostas_step?: RespostaStep[];
}

export interface EditalInfo {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
}

export interface StepInfo {
  id: number;
  texto: string;
}

export interface ListaAlunosInscritosResponse {
  sucesso: boolean;
  dados: {
    edital: EditalInfo;
    step: StepInfo;
    total_alunos: number;
    alunos: AlunoInscrito[];
  };
}

// Mantendo compatibilidade com código existente
export interface Inscricao {
  inscricao_id?: number;
  edital_id?: number;
  aluno_id: number;
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
