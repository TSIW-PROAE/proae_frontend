import type { AdminPerfil, UserRole } from "@/types/auth";

const VALID_ROLES: ReadonlySet<string> = new Set<string>(["admin", "aluno"]);
const VALID_ADMIN_PERFIS: ReadonlySet<string> = new Set<string>([
  "tecnico",
  "gerencial",
  "coordenacao",
]);

/**
 * Normaliza `roles` vindos da API (array, string simple-array, ou indefinido).
 * Retorna apenas roles válidas com o tipo `UserRole`.
 */
export function normalizeRoles(roles: unknown): UserRole[] {
  let raw: string[];
  if (Array.isArray(roles)) {
    raw = roles.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
  } else if (typeof roles === "string" && roles.trim()) {
    raw = roles
      .split(",")
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean);
  } else {
    return [];
  }
  return raw.filter((r): r is UserRole => VALID_ROLES.has(r));
}

export function hasAdminRole(roles: unknown): boolean {
  return normalizeRoles(roles).some((r) => r.toLowerCase() === "admin");
}

export function hasAlunoRole(roles: unknown): boolean {
  return normalizeRoles(roles).some((r) => r.toLowerCase() === "aluno");
}

/** Admin aprovado para acesso ao painel PROAE */
export function isAdminAprovado(
  aprovado: boolean | null | undefined,
  adminAprovado: boolean | null | undefined,
): boolean {
  return aprovado === true || adminAprovado === true;
}

/**
 * Normaliza `adminPerfil` recebido da API. Aceita variações de caixa e remove acentos
 * para tolerar entrada do tipo "Coordenação". Cadastros antigos sem coluna preenchida
 * são tratados como `gerencial` (compatibilidade com comportamento histórico).
 */
export function normalizeAdminPerfil(
  perfil: unknown,
): AdminPerfil {
  if (perfil == null) return "gerencial";
  const raw = String(perfil)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!raw) return "gerencial";
  return VALID_ADMIN_PERFIS.has(raw) ? (raw as AdminPerfil) : "gerencial";
}

/** Pode criar/editar/publicar/excluir editais e configurar formulários. */
export function canManageEditais(perfil: AdminPerfil | null | undefined): boolean {
  return normalizeAdminPerfil(perfil) === "gerencial";
}

/** Pode alterar status/observação de inscrições, validar respostas e reabrir prazos. */
export function canAnalyzeInscricoes(
  perfil: AdminPerfil | null | undefined,
): boolean {
  const p = normalizeAdminPerfil(perfil);
  return p === "tecnico" || p === "gerencial";
}

/** Apenas leitura: somente consulta (perfil de coordenação). */
export function isReadOnlyAdmin(
  perfil: AdminPerfil | null | undefined,
): boolean {
  return normalizeAdminPerfil(perfil) === "coordenacao";
}

/** Rótulo amigável para exibição na UI. */
export function adminPerfilLabel(
  perfil: AdminPerfil | null | undefined,
): string {
  switch (normalizeAdminPerfil(perfil)) {
    case "tecnico":
      return "Técnico";
    case "coordenacao":
      return "Coordenação";
    case "gerencial":
    default:
      return "Gerencial";
  }
}
