import Cookie from "js-cookie"

export function getCookie(name: string): string | null {
  const cookie = Cookie.get(name);
  return cookie ? cookie : null;
}

export function setCookie(name: string, value: string, days: number) {
  Cookie.set(name, value, {
    expires: days,
    secure: true,
    sameSite: "Strict",
  })
}
