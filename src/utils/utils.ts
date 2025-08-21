import Cookie from "js-cookie"

export function getCookie(name: string): string | null {
  const cookie = Cookie.get(name);
  return cookie ? cookie : null;
}

export function setCookie(name: string, value: string, days?: number) {
  Cookie.set(name, value, {
    expires: import.meta.env.VITE_COOKIE_EXPIRATION_DAYS ? parseInt(import.meta.env.VITE_COOKIE_EXPIRATION_DAYS) : days,
    secure: true,
    sameSite: "Strict",
  })
}

export function deleteCookie(name: string) {
  Cookie.remove(name);
}

export function extractCookieFromHeaders(headers: Record<string, string>, cookieName: string): string | null {
  const setCookieHeader = headers['set-cookie'] || headers['Set-Cookie'];

  if (!setCookieHeader) return null;

  const regex = new RegExp(`${cookieName}=([^;]+)`);
  const match = setCookieHeader.match(regex);

  return match ? match[1] : null;
}
