import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { Step } from "@/types/step";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/steps";

export class StepService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarStepsPorEdital(editalId: number): Promise<Step[]> {
    return this.httpClient.get<Step[]>(`${BASE_URL}/edital/${editalId}`);
  }

  async buscarStepPorId(id: number): Promise<Step> {
    return this.httpClient.get<Step>(`${BASE_URL}/${id}`);
  }

  async criarStep(data: { texto: string; edital_id: number }): Promise<Step> {
  const resp = await this.httpClient.post<Step>(`${BASE_URL}`, data);
  return resp.data;
  }

  async atualizarStep(id: number, data: { texto?: string }): Promise<Step> {
  return this.httpClient.patch<Step>(`${BASE_URL}/${id}`, data);
  }

  async deletarStep(id: number): Promise<{ message: string }> {
  return this.httpClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
  }
}

export const stepService = new StepService();
