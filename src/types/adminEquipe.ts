import type { AdminPerfil } from "./auth";

/** Item da listagem da equipe administrativa (GET /admin/listar). */
export interface AdminEquipeItem {
  id_admin: number;
  usuario_id: string | null;
  nome: string;
  email: string;
  cargo: string;
  perfil: AdminPerfil;
  aprovado: boolean;
  /** Sinaliza para o front que esta linha é o próprio usuário logado. */
  sou_eu: boolean;
}

export interface ListaAdminsResponse {
  sucesso: boolean;
  dados: AdminEquipeItem[];
  paginacao?: {
    pagina: number;
    limite: number;
    total_itens: number;
    total_paginas: number;
    tem_anterior: boolean;
    tem_proxima: boolean;
  };
  resumo?: {
    total_geral: number;
    total_aprovados: number;
    total_pendentes: number;
  };
}

export interface UpdateAdminPerfilResponse {
  sucesso: boolean;
  mensagem: string;
  dados: Omit<AdminEquipeItem, "sou_eu">;
}

export interface AdminNotificacaoEmailItem {
  id: number;
  email: string;
  criado_em: string;
}

export interface ListaNotificacoesAprovacaoResponse {
  sucesso: boolean;
  dados: {
    emails: AdminNotificacaoEmailItem[];
    usa_banco: boolean;
    emails_ambiente: string[];
  };
}

export interface AprovarAdminResponse {
  sucesso: boolean;
  mensagem: string;
  dados: {
    id_admin: number;
    perfil: AdminPerfil;
  };
}
