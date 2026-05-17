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
}

export interface UpdateAdminPerfilResponse {
  sucesso: boolean;
  mensagem: string;
  dados: Omit<AdminEquipeItem, "sou_eu">;
}
