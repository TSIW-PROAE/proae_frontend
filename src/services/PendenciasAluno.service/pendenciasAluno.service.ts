import IHttpClient from "../api";
import { RPendenciasAluno } from "../../types/pendencias";
import { API_BASE_URL } from "@/config/api";

const url = API_BASE_URL + "/documentos";
export default class PendenciasAlunoService {

  constructor(private readonly httpClient: IHttpClient) {}

  async getPendenciasAluno(): Promise<RPendenciasAluno>{
    return this.httpClient.get(`${url}/pendencias/meus`);
  }

}
