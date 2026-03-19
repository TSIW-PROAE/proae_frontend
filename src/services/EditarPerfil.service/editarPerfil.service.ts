// services/EditarPerfilService.ts
import IHttpClient from "../api";
import { API_BASE_URL } from "@/config/api";

export default class EditarPerfilService {
  /** GET /aluno/me — dados do aluno logado (backend retorna 404 se não houver perfil de aluno). */
  async getAlunoPerfil(httpClient: IHttpClient) {
    const url = API_BASE_URL + "/aluno/me";
    const response = await httpClient.get(url);
    return response;
  }

  async patchAlunoPerfil(httpClient: IHttpClient, data: Record<string, any>) {
    const url = API_BASE_URL + "/aluno/update";
    return await httpClient.patch(url, data);
  }

  async getAdminPerfil(httpClient: IHttpClient) {
    const url = API_BASE_URL + "/admin";
    const response = await httpClient.get(url);
    return response;
  }

  async patchAdminPerfil(httpClient: IHttpClient, data: Record<string, any>) {
    const url = API_BASE_URL + "/admin/update";
    return await httpClient.patch(url, data);
  }
}
