export interface Aluno {
  aluno_id: string;
  nome?: string;
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
  paginacao?: {
    pagina: number;
    limite: number;
    total_itens: number;
    total_paginas: number;
    tem_anterior: boolean;
    tem_proxima: boolean;
  };
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
}
