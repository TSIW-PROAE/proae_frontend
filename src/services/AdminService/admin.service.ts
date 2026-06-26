import { FetchAdapter } from "../api";
import { DefaultResponse, AdminPerfil } from "@/types/auth";
import {
  ListaAdminsResponse,
  ListaNotificacoesAprovacaoResponse,
  UpdateAdminPerfilResponse,
  AprovarAdminResponse,
  AdminNotificacaoEmailItem,
} from "@/types/adminEquipe";
import { API_BASE_URL } from "@/config/api";

const AUTH_BASE = API_BASE_URL + "/auth";
const ADMIN_BASE = API_BASE_URL + "/admin";

export class AdminService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async approveAdmin(token: string): Promise<DefaultResponse> {
    const response = await this.httpClient.get<DefaultResponse>(
      `${AUTH_BASE}/approve-admin/${token}`
    );
    return response;
  }

  async rejectAdmin(token: string): Promise<DefaultResponse> {
    const response = await this.httpClient.get<DefaultResponse>(
      `${AUTH_BASE}/reject-admin/${token}`
    );
    return response;
  }

  /** GET /admin/listar — apenas perfis gerenciais. */
  async listarEquipe(opts?: {
    page?: number;
    limit?: number;
    busca?: string;
    perfil?: AdminPerfil;
    aprovado?: boolean;
  }): Promise<ListaAdminsResponse> {
    const params = new URLSearchParams();
    if (opts?.page != null) params.set("page", String(opts.page));
    if (opts?.limit != null) params.set("limit", String(opts.limit));
    if (opts?.busca && opts.busca.trim() !== "") {
      params.set("busca", opts.busca.trim());
    }
    if (opts?.perfil) params.set("perfil", opts.perfil);
    if (typeof opts?.aprovado === "boolean") {
      params.set("aprovado", String(opts.aprovado));
    }
    const query = params.toString();
    const url = query ? `${ADMIN_BASE}/listar?${query}` : `${ADMIN_BASE}/listar`;
    return this.httpClient.get<ListaAdminsResponse>(url);
  }

  /** PATCH /admin/:id/perfil — apenas perfis gerenciais. */
  async alterarPerfilDeAdmin(
    adminId: number,
    perfil: AdminPerfil,
  ): Promise<UpdateAdminPerfilResponse> {
    return this.httpClient.patch<UpdateAdminPerfilResponse>(
      `${ADMIN_BASE}/${adminId}/perfil`,
      { perfil },
    );
  }

  async aprovarAdmin(
    adminId: number,
    perfil?: AdminPerfil,
  ): Promise<AprovarAdminResponse> {
    return this.httpClient.patch<AprovarAdminResponse>(
      `${ADMIN_BASE}/${adminId}/aprovar`,
      perfil ? { perfil } : {},
    );
  }

  async rejeitarAdmin(adminId: number): Promise<{ sucesso: boolean; mensagem: string }> {
    return this.httpClient.delete<{ sucesso: boolean; mensagem: string }>(
      `${ADMIN_BASE}/${adminId}/rejeitar`,
    );
  }

  async excluirPerfilAdmin(
    adminId: number,
  ): Promise<{ sucesso: boolean; mensagem: string; dados?: { admin_id: number; perfil_removido: AdminPerfil } }> {
    return this.httpClient.delete<{ sucesso: boolean; mensagem: string; dados?: { admin_id: number; perfil_removido: AdminPerfil } }>(
      `${ADMIN_BASE}/${adminId}/perfil`,
    );
  }

  async listarNotificacoesAprovacao(): Promise<ListaNotificacoesAprovacaoResponse> {
    return this.httpClient.get<ListaNotificacoesAprovacaoResponse>(
      `${ADMIN_BASE}/notificacoes-aprovacao`,
    );
  }

  async adicionarNotificacaoAprovacao(
    email: string,
  ): Promise<{ sucesso: boolean; mensagem: string; dados: AdminNotificacaoEmailItem }> {
    const response =
      await this.httpClient.post<{ sucesso: boolean; mensagem: string; dados: AdminNotificacaoEmailItem }>(
      `${ADMIN_BASE}/notificacoes-aprovacao`,
      { email },
    );
    return response.data;
  }

  async removerNotificacaoAprovacao(emailId: number): Promise<{ sucesso: boolean; mensagem: string }> {
    return this.httpClient.delete<{ sucesso: boolean; mensagem: string }>(
      `${ADMIN_BASE}/notificacoes-aprovacao/${emailId}`,
    );
  }
}
