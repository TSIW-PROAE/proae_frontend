import IHttpClient from "../BaseRequestService/HttpClient";
import { RPendenciasAluno } from "../../types/pendencias";

const url = import.meta.env.VITE_API_URL_SERVICES + `/documentos`;
export default class PendenciasAlunoService {

  constructor(private readonly httpClient: IHttpClient) {}

  async getPendenciasAluno(): Promise<RPendenciasAluno>{
    return this.httpClient.get(`${url}/pendencias/meus`);
  }

}
