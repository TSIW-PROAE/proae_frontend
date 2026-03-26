import Cookie from "js-cookie"

export function getCookie(name: string): string | null {
  const cookie = Cookie.get(name);
  return cookie ? cookie : null;
}

export function setCookie(name: string, value: string, days?: number) {
  Cookie.set(name, value, {
    path: "/",
    expires: import.meta.env.VITE_COOKIE_EXPIRATION_DAYS ? parseInt(import.meta.env.VITE_COOKIE_EXPIRATION_DAYS) : days,
    secure: true,
    sameSite: "Strict",
  })
}

/** Mesmos atributos de path (e quando possível secure/sameSite) para o browser realmente remover o cookie. */
export function deleteCookie(name: string) {
  Cookie.remove(name, { path: "/" })
}

export function extractCookieFromHeaders(headers: Record<string, string>, cookieName: string): string | null {
  const setCookieHeader = headers['set-cookie'] || headers['Set-Cookie'];

  if (!setCookieHeader) return null;

  const regex = new RegExp(`${cookieName}=([^;]+)`);
  const match = setCookieHeader.match(regex);

  return match ? match[1] : null;
}

/**
 * Garante href absoluto para links externos. Evita 404 no SPA quando a API manda URL sem esquema
 * ou quando o front tratava objeto como string (`[object Object]`).
 */
export function normalizeUrlForHref(raw: string | undefined | null): string {
  if (raw == null || !String(raw).trim()) return "#";
  const u = String(raw).trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  // ex.: www.ufba.br ou drive.google.com/...
  if (/^[a-z0-9].*\.[a-z]{2,}/i.test(u) || u.startsWith("www.")) {
    return `https://${u.replace(/^\/+/, "")}`;
  }
  return u;
}
