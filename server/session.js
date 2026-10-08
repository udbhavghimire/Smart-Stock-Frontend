import "server-only";
import { serverEnv } from "./env";

/** Session token lives only in an httpOnly cookie set here (spec §3, §13). */
export function setSessionCookie(response, token) {
  response.cookies.set({
    name: serverEnv.sessionCookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: serverEnv.sessionMaxAgeSeconds,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set({
    name: serverEnv.sessionCookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** CSRF protection for state-changing routes: the request must come from this origin. */
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
