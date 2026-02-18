export interface Aluno {
  aluno_id: string;
  email: string;
  matricula: string;
  data_nascimento: string;
  curso: string;
  campus: string;
  cpf: string;
  data_ingresso: string;
  celular: string;
  inscricoes: any[];
}

export interface ListaAlunosResponse {
  sucesso: boolean;
  dados: Aluno[];
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
}
