import { CondicaoLogica, PaginaConfig, TipoInput, FormatacaoInput } from "@/types/dynamicForm";
import { StepResponseDto, PerguntaResponseDto, PerguntaCondicaoApi } from "@/types/step";

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

function sanitizeOptionToken(token: unknown): string {
  const raw = String(token ?? "").trim();
  if (!raw) return "";
  return raw
    .replace(/^[\s{"]+/, "")
    .replace(/[\s}"]+$/, "")
    .replace(/\\"/g, '"')
    .trim();
}

function normalizePerguntaOpcoes(rawOpcoes: unknown): string[] {
  const items = Array.isArray(rawOpcoes) ? rawOpcoes : [rawOpcoes];
  const normalized: string[] = [];

  for (const item of items) {
    const text = String(item ?? "").trim();
    if (!text) continue;

    // Caso legado: literal de array do Postgres, ex.: {"Sim","Nao"}.
    if (text.startsWith("{") && text.endsWith("}")) {
      const inner = text.slice(1, -1);
      const parts = inner
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((p) => sanitizeOptionToken(p))
        .filter(Boolean);
      normalized.push(...parts);
      continue;
    }

    const clean = sanitizeOptionToken(text);
    if (clean) normalized.push(clean);
  }

  return Array.from(new Set(normalized));
}

/**
 * Adapta a resposta de Steps do backend para o formato de páginas/inputs.
 * Aplica ordenação por (ordem, id) tanto em steps quanto em perguntas, e
 * propaga a regra `condicao` para o `useFormBuilder` filtrar dinamicamente.
 */
export const mapStepsToPaginas = (steps: StepResponseDto[]): PaginaConfig[] => {
  const toStepId = (value: string | number): number => {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return steps
    .slice()
    .sort(compararPorOrdem)
    .map((step: StepResponseDto) => ({
      step_id: toStepId(step.id),
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
          options: normalizePerguntaOpcoes(pergunta.opcoes).map((opcao: string) => ({
            value: opcao,
            label: opcao,
          })),
          placeholder: pergunta.placeholder,
          condicao: mapearCondicao(pergunta.condicao),
        })),
    }));
};
