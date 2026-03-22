/** GET /aluno/admin/:alunoId/resumo */
export interface AdminAlunoResumoInscricao {
  edital_id: number;
  vaga_id: number | null;
  inscricao_id: number;
  titulo_edital: string;
  status_edital: string;
  is_formulario_geral: boolean;
  is_formulario_renovacao: boolean;
  processo_tipo: "FORMULARIO_GERAL" | "RENOVACAO" | "EDITAL";
  data_inscricao: string;
  /** Análise da inscrição (documentos, parecer PROAE) */
  status_inscricao: string;
  /** Seleção / homologação do benefício no edital (independe da linha acima) */
  status_beneficio_edital: string;
  beneficio_nome: string | null;
  observacao_admin: string | null;
  possui_pendencias: boolean;
}

export interface AdminAlunoResumo {
  aluno: {
    aluno_id: number;
    nome: string | null;
    email: string | null;
    matricula: string;
    cpf: string | null;
    celular: string | null;
    curso: string;
    campus: string;
    data_nascimento: string | null;
    data_ingresso: string;
  };
  inscricoes: AdminAlunoResumoInscricao[];
}
