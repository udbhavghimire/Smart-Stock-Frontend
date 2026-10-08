import "server-only";

// Server-only settings. Never prefix these with NEXT_PUBLIC_.
export const serverEnv = {
  loginUsername: process.env.LOGIN_USERNAME ?? "demo",
  loginPassword: process.env.LOGIN_PASSWORD ?? "demo",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "smartstock_session",
  sessionMaxAgeSeconds: Number(process.env.SESSION_MAX_AGE_SECONDS ?? 60 * 60 * 12),
};
