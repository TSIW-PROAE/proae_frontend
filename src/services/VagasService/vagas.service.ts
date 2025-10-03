import IhttpClient from "@/services/BaseRequestService/HttpClient";

export class VagasService{
  constructor(
    private readonly httpClient: IhttpClient
  ){}

  async getVagasEdital(idEdital: string){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/vagas/edital/${idEdital}`;
    const response = await this.httpClient.get(url);
    return response;
  }

  // TODO: Tipar dados de criação de vaga
  async createVaga(data: any){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/vagas`;
    const response = await this.httpClient.post(url, data);
    return response;
  }

  async updateVaga(idVaga: string, data: any){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/vagas/${idVaga}`;
    const response = await this.httpClient.put(url, data);
    return response;
  }

  async deleteVaga(idVaga: string){
    const url = import.meta.env.VITE_API_URL_SERVICES + `/vagas/${idVaga}`;
    const response = await this.httpClient.delete(url);
    return response;
  }
}
