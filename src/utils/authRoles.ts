import type { UserRole } from "@/types/auth";

const VALID_ROLES: ReadonlySet<string> = new Set<string>(["admin", "aluno"]);

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
