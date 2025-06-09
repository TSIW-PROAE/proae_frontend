// services/EditarPerfilService.ts
import IHttpClient from "../BaseRequestService/HttpClient";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default class EditarPerfilService {
  async getAlunoPerfil(httpClient: IHttpClient) {
    const sessionToken = getCookie('__session');
    if (!sessionToken) {
      throw new Error("Sessão não encontrada no cookie");
    }
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno`;
    const response = await httpClient.get(url, sessionToken);
    console.log(response);
    return response;
  }

  async patchAlunoPerfil(httpClient: IHttpClient, data: Record<string, any>) {
    const sessionToken = getCookie('__session');
    if (!sessionToken) {
      throw new Error("Sessão não encontrada no cookie");
    }
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno/update`;
    return await httpClient.patch(url, data, sessionToken);
  }
}