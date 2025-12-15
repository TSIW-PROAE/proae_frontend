import { FetchAdapter } from "../BaseRequestService/HttpClient";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;

export interface ValidateRespostaDto {
  validada?: boolean;
  dataValidade?: string;
}

export interface ValidateRespostaResponse {
  sucesso: boolean;
  dados: {
    resposta: {
      id: number;
      validada: boolean;
      dataValidacao: string;
      dataValidade?: string;
    };
  };
  mensagem?: string;
}

class RespostaService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async validarResposta(respostaId: number, dto: ValidateRespostaDto): Promise<ValidateRespostaResponse> {
    const respostaIdStr = String(respostaId);
    const pluralUrl = `${BASE_URL}/respostas/${respostaIdStr}/validate`;
    const singularUrl = `${BASE_URL}/resposta/${respostaIdStr}/validate`;

    try {
      return await this.httpClient.patch<ValidateRespostaResponse>(pluralUrl, dto);
    } catch (erroPlural: any) {
      const shouldRetrySingular = this.deveTentarSingular(erroPlural);

      if (shouldRetrySingular) {
        try {
          return await this.httpClient.patch<ValidateRespostaResponse>(singularUrl, dto);
        } catch (erroSingular: any) {
          console.error("Erro ao validar resposta (rota singular):", erroSingular);
          throw new Error(this.extrairMensagemErro(erroSingular));
        }
      }

      console.error("Erro ao validar resposta (rota plural):", erroPlural);
      throw new Error(this.extrairMensagemErro(erroPlural));
    }
  }

  private deveTentarSingular(erro: unknown): boolean {
    if (!erro) return false;

    const mensagem = this.extrairMensagemGenerica(erro);
    if (!mensagem) return false;

    return mensagem.includes("/resposta/") && !mensagem.includes("/respostas/");
  }

  private extrairMensagemErro(erro: unknown): string {
    return (
      (typeof erro === "object" && erro !== null && "message" in erro && typeof (erro as any).message === "string"
        ? (erro as any).message
        : undefined) ||
      (typeof erro === "object" && erro !== null && "mensagem" in erro && typeof (erro as any).mensagem === "string"
        ? (erro as any).mensagem
        : undefined) ||
      this.extrairMensagemGenerica(erro) ||
      "Erro ao validar resposta"
    );
  }

  private extrairMensagemGenerica(erro: unknown): string | undefined {
    if (typeof erro === "string") {
      return erro;
    }

    if (typeof erro === "object" && erro !== null) {
      if ("message" in erro && typeof (erro as any).message === "string") {
        return (erro as any).message;
      }

      if ("mensagem" in erro && typeof (erro as any).mensagem === "string") {
        return (erro as any).mensagem;
      }
    }

    return undefined;
  }
}

export const respostaService = new RespostaService();
