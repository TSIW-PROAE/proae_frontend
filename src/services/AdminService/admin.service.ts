import { FetchAdapter } from "../api";
import { DefaultResponse, AdminPerfil } from "@/types/auth";
import {
  ListaAdminsResponse,
  UpdateAdminPerfilResponse,
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
  async listarEquipe(): Promise<ListaAdminsResponse> {
    return this.httpClient.get<ListaAdminsResponse>(`${ADMIN_BASE}/listar`);
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
}
