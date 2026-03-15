import IhttpClient from "@/services/api";
import { API_BASE_URL } from "@/config/api";

export class VagasService{
  constructor(
    private readonly httpClient: IhttpClient
  ){}

  async getVagasEdital(idEdital: string){
    const url = API_BASE_URL + `/vagas/edital/${idEdital}`;
    const response = await this.httpClient.get(url);
    return response;
  }

  // TODO: Tipar dados de criação de vaga
  async createVaga(data: any){
    const url = API_BASE_URL + "/vagas";
    const response = await this.httpClient.post(url, data);
    return response;
  }

  async updateVaga(idVaga: string, data: any){
    const url = API_BASE_URL + `/vagas/${idVaga}`;
    const response = await this.httpClient.put(url, data);
    return response;
  }

  async deleteVaga(idVaga: string){
    const url = API_BASE_URL + `/vagas/${idVaga}`;
    const response = await this.httpClient.delete(url);
    return response;
  }
}
