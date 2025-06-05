// services/EditarPerfilService.ts
import { useClerk } from "@clerk/clerk-react";
import IHttpClient from "../BaseRequestService/HttpClient";

export default class EditarPerfilService {
  headerToken: string;

  constructor(private readonly httpClient: IHttpClient) {
    this.headerToken = localStorage.getItem('token') || ''; 
  }

  async getAlunoPerfil() {
    const user = useClerk();
    console.log(user);
    const url = import.meta.env.VITE_API_URL_SERVICES + `/aluno`;
    const response = await this.httpClient.get(url);
    return response;
  }
}