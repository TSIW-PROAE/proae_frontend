import { CondicaoLogica, PaginaConfig, TipoInput, FormatacaoInput } from "@/types/dynamicForm";
import { StepResponseDto, PerguntaResponseDto, PerguntaCondicaoApi } from "@/types/step";
import type { FormularioGeralStep, FormularioGeralPergunta } from "@/services/FormularioGeralService/formularioGeral.service";

/** Compara em (ordem ASC, id ASC) — replica o comportamento do backend. */
function compararPorOrdem<T extends { ordem?: number; id: string | number }>(
  a: T,
  b: T,
): number {
  const oa = (a.ordem ?? 0) as number;
  const ob = (b.ordem ?? 0) as number;
  if (oa !== ob) return oa - ob;
  // Quando ordem está empatada, usa id como desempate.
  const ia = typeof a.id === "number" ? a.id : Number(a.id) || 0;
  const ib = typeof b.id === "number" ? b.id : Number(b.id) || 0;
  return ia - ib;
}

/**
 * Converte a condição vinda do backend (referência por id) para o formato
 * `CondicaoLogica` consumido pelo `useFormBuilder` (referência por nome,
 * que é `pergunta_${id}`).
 */
function mapearCondicao(
  condicao: PerguntaCondicaoApi | null | undefined,
): CondicaoLogica | undefined {
  if (!condicao || !condicao.pergunta_id_origem) return undefined;
  return {
    campo: `pergunta_${condicao.pergunta_id_origem}`,
    valor: condicao.valor,
    operador: condicao.operador,
  };
}

/**
 * Adapta a resposta de Steps do backend para o formato de páginas/inputs.
 * Aplica ordenação por (ordem, id) tanto em steps quanto em perguntas, e
 * propaga a regra `condicao` para o `useFormBuilder` filtrar dinamicamente.
 */
export const mapStepsToPaginas = (steps: StepResponseDto[]): PaginaConfig[] => {
  return steps
    .slice()
    .sort(compararPorOrdem)
    .map((step: StepResponseDto) => ({
      step_id: step.id,
      titulo: step.texto,
      inputs: step.perguntas
        .slice()
        .sort(compararPorOrdem)
        .map((pergunta: PerguntaResponseDto) => ({
          nome: `pergunta_${pergunta.id}`,
          titulo: pergunta.pergunta,
          tipo: pergunta.tipo_Pergunta as TipoInput,
          obrigatorio: pergunta.obrigatoriedade,
          formatacao: pergunta.tipo_formatacao as FormatacaoInput,
          options: (pergunta.opcoes || []).map((opcao: string) => ({
            value: opcao,
            label: opcao,
          })),
          placeholder: pergunta.placeholder,
          condicao: mapearCondicao(pergunta.condicao),
        })),
    }));
};

/**
 * Adapta os steps retornados por GET /formulario-geral para o formato de páginas/inputs.
 * Permite que o Formulário Geral use as mesmas perguntas e respostas que os outros editais.
 * Defensivo: ignora perguntas sem id (necessário para o envio das respostas).
 */
export const mapFormularioGeralStepsToPaginas = (
  steps: FormularioGeralStep[]
): PaginaConfig[] => {
  if (!steps?.length) return [];
  return steps
    .slice()
    .sort(compararPorOrdem)
    .map((step: FormularioGeralStep, stepIndex: number) => {
      const texto = step.texto ?? (step.id != null ? `Etapa ${step.id}` : `Etapa ${stepIndex + 1}`);
      const perguntas = (step.perguntas ?? [])
        .filter((p: FormularioGeralPergunta) => p.id != null && p.id !== undefined)
        .slice()
        .sort(compararPorOrdem);
      return {
        step_id: step.id,
        titulo: texto,
        inputs: perguntas.map((pergunta: FormularioGeralPergunta) => ({
          nome: `pergunta_${pergunta.id}`,
          titulo: pergunta.pergunta ?? "",
          tipo: (pergunta.tipo_Pergunta || "texto") as TipoInput,
          obrigatorio: Boolean(pergunta.obrigatoriedade),
          formatacao: (pergunta.tipo_formatacao as FormatacaoInput) ?? undefined,
          options: Array.isArray(pergunta.opcoes)
            ? pergunta.opcoes.map((opcao: string) => ({ value: opcao, label: opcao }))
            : [],
          placeholder: pergunta.placeholder ?? undefined,
          condicao: mapearCondicao(pergunta.condicao ?? null),
        })),
      };
    })
    .filter((p) => p.inputs.length > 0);
};
