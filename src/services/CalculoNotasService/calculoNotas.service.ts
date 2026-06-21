import { inscricaoServiceManager } from "../InscricaoService/inscricaoService";

export interface NotaCalculada {
  aluno_id: string;
  inscricao_id: string;
  nome: string;
  matricula: string;
  email: string;
  nota_documentos: number;
  nota_respostas: number;
  nota_pareceres: number;
  nota_final: number;
  ranking: number;
  detalhes: {
    documentos_aprovados: number;
    documentos_total: number;
    respostas_completas: number;
    respostas_total: number;
    pareceres_aprovados: number;
    pareceres_total: number;
  };
}

export interface CalculoNotasRequest {
  edital_id: number;
  step_id?: string;
}

export class CalculoNotasService {
  /**
   * Calcula o ranqueamento usando a pontuação validada pelo backend
   * (mesma regra da tela Inscrições e análise).
   */
  async calcularNotasEdital(
    editalId: string,
    _stepId?: string,
  ): Promise<NotaCalculada[]> {
    try {
      const inscritos =
        await inscricaoServiceManager.listarInscritosPorEdital(editalId);

      const notasCalculadas = inscritos.map((aluno) => {
        const validada = Number(aluno.pontuacao_validada ?? 0);
        const maxima = Number(aluno.pontuacao_maxima ?? 0);

        return {
          aluno_id: aluno.aluno_id,
          inscricao_id: aluno.inscricao_id,
          nome: aluno.nome,
          matricula: aluno.matricula,
          email: aluno.email,
          nota_documentos: 0,
          nota_respostas: Math.round(validada * 100) / 100,
          nota_pareceres: Math.round(maxima * 100) / 100,
          nota_final: Math.round(validada * 100) / 100,
          ranking: 0,
          detalhes: {
            documentos_aprovados: 0,
            documentos_total: 0,
            respostas_completas: Math.round(validada * 100) / 100,
            respostas_total: Math.round(maxima * 100) / 100,
            pareceres_aprovados: 0,
            pareceres_total: 0,
          },
        };
      });

      notasCalculadas.sort((a, b) => b.nota_final - a.nota_final);
      notasCalculadas.forEach((nota, index) => {
        nota.ranking = index + 1;
      });

      return notasCalculadas;
    } catch (error: any) {
      console.error("Erro ao calcular notas:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Erro ao calcular notas do edital",
      );
    }
  }
}

export const calculoNotasService = new CalculoNotasService();

