// services/EditarPerfilService.ts
import IHttpClient from "../BaseRequestService/HttpClient";

export default class EditarPerfilService {
  async getAlunoPerfil(httpClient: IHttpClient) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno`;
    const response = await httpClient.get(url);
    return response;
  }

  async patchAlunoPerfil(httpClient: IHttpClient, data: Record<string, any>) {
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno/update`;
    return await httpClient.patch(url, data);
  }
}
