import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { getCookie } from "@/utils/utils";
import { Step } from "@/types/step";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/steps";

export class StepService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  private getToken(): string {
    return getCookie("token") ?? "";
  }

  async listarStepsPorEdital(editalId: number): Promise<Step[]> {
    return this.httpClient.get<Step[]>(`${BASE_URL}/edital/${editalId}`);
  }

  async buscarStepPorId(id: number): Promise<Step> {
    return this.httpClient.get<Step>(`${BASE_URL}/${id}`);
  }

  async criarStep(data: { texto: string; edital_id: number }): Promise<Step> {
    const token = this.getToken();
    return this.httpClient.post<Step>(`${BASE_URL}`, data, token);
  }

  async atualizarStep(id: number, data: { texto?: string }): Promise<Step> {
    const token = this.getToken();
    return this.httpClient.patch<Step>(`${BASE_URL}/${id}`, data, token);
  }

  async deletarStep(id: number): Promise<{ message: string }> {
    const token = this.getToken();
    return this.httpClient.delete<{ message: string }>(
      `${BASE_URL}/${id}`,
      token
    );
  }
}

export const stepService = new StepService();
