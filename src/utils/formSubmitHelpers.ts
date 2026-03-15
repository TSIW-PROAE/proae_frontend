import { PaginaConfig, InputConfig } from "@/types/dynamicForm";
import { MinioService } from "@/services/MinioService/minio.service";

export interface RespostaPayload {
  perguntaId: number;
  valorTexto?: string;
  valorOpcoes?: string[];
  urlArquivo?: string;
}

/**
 * Converte DateValue para string no formato DD/MM/YYYY
 */
export function dateValueToString(value: any): string {
  if (!value || typeof value !== 'object') return String(value || '');
  
  if ('year' in value && 'month' in value && 'day' in value) {
    const { year, month, day } = value;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }
  
  return String(value);
}

/**
 * Processa os dados do formulário e prepara as respostas para envio ao backend.
 * Faz upload de arquivos quando necessário.
 */
export async function prepareRespostasForSubmit(
  formData: Record<string, any>,
  paginas: PaginaConfig[],
  vagaId: number,
  minioService: MinioService
): Promise<RespostaPayload[]> {
  const allInputs = paginas.flatMap(p => p.inputs);
  
  const respostas = await Promise.all(
    Object.entries(formData)
      .filter(([key]) => key.startsWith('pergunta_'))
      .map(async ([key, value]) => {
        const perguntaId = parseInt(key.replace('pergunta_', ''));
        const inputConfig = allInputs.find((input: InputConfig) => input.nome === key);
        const tipo = inputConfig?.tipo;

        if (tipo === 'file' && value instanceof File) {
          try {
            const urlArquivo = await minioService.uploadDocument(value, vagaId);
            return { perguntaId, urlArquivo };
          } catch {
            throw new Error("Não foi possível enviar um dos arquivos. Tente novamente.");
          }
        }

        if (tipo === 'select' || tipo === 'radio') {
          const opcaoSelecionada = String(value || '');
          return {
            perguntaId,
            valorOpcoes: opcaoSelecionada ? [opcaoSelecionada] : [],
            valorTexto: opcaoSelecionada
          };
        }

        if (tipo === 'selectGroup' && typeof value === 'object' && value !== null) {
          const valores = Object.values(value).filter(Boolean) as string[];
          return {
            perguntaId,
            valorOpcoes: valores,
            valorTexto: valores.join(', ')
          };
        }

        if (Array.isArray(value)) {
          return {
            perguntaId,
            valorOpcoes: value,
            valorTexto: value.join(', ')
          };
        }

        if (tipo === 'date') {
          return {
            perguntaId,
            valorTexto: dateValueToString(value)
          };
        }

        return {
          perguntaId,
          valorTexto: String(value || '')
        };
      })
  );

  return respostas;
}

/**
 * Extrai dados adicionais (não são perguntas) do formulário
 */
export function extractDadosAdicionais(formData: Record<string, any>): Record<string, any> {
  return Object.entries(formData)
    .filter(([key]) => !key.startsWith('pergunta_'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}
