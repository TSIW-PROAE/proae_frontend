import Cookie from "js-cookie"

export function getCookie(name: string): string | null {
  const cookie = Cookie.get(name);
  return cookie ? cookie : null;
}

export function setCookie(name: string, value: string, days?: number) {
  if(days){
    Cookie.set(name, value, {
    expires: days,
    secure: true,
    sameSite: "Strict",
  }) 
  } else{
    Cookie.set(name, value, {
      expires: parseInt(import.meta.env.VITE_COOKIE_EXPIRATION_DAYS),
      secure: true,
      sameSite: "Strict",
    })
  }
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
