/** Vigência do Cadastro Geral (espelha backend cg-semestre.util). */

export interface SemestreParsed {
  year: number;
  term: 1 | 2;
}

export function parseSemestre(value: string | null | undefined): SemestreParsed | null {
  const s = String(value ?? "").trim();
  const m = /^(\d{4})\.([12])$/.exec(s);
  if (!m) return null;
  return { year: Number(m[1]), term: Number(m[2]) as 1 | 2 };
}

export function formatSemestre(year: number, term: 1 | 2): string {
  return `${year}.${term}`;
}

export function getSemestreAtual(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const term: 1 | 2 = month <= 7 ? 1 : 2;
  return formatSemestre(year, term);
}

export function compareSemestre(a: string, b: string): number {
  const pa = parseSemestre(a);
  const pb = parseSemestre(b);
  if (!pa || !pb) return 0;
  if (pa.year !== pb.year) return pa.year - pb.year;
  return pa.term - pb.term;
}

export function isCgVigente(opts: {
  cgSituacao: string | null | undefined;
  cgValidoAteSemestre: string | null | undefined;
  now?: Date;
}): boolean {
  const situacao = String(opts.cgSituacao ?? "").trim();
  if (situacao !== "Apto") return false;
  const limite = String(opts.cgValidoAteSemestre ?? "").trim();
  if (!limite) return true;
  return compareSemestre(getSemestreAtual(opts.now), limite) <= 0;
}

/** Rótulo amigável para exibição (valor persistido pode ser ASCII: "Nao cadastrado"). */
export function formatarSituacaoCadastroGeral(
  value: string | null | undefined,
): string {
  const s = String(value ?? "").trim();
  if (!s || s === "Nao cadastrado") return "Não cadastrado";
  return s;
}
