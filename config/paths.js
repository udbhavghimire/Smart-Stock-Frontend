/**
 * Central path configuration (spec §0, §4).
 * Components MUST import paths from here and never hard-code them.
 *
 * TODO(spec): the team chooses the final page URLs. In the App Router a page's
 * URL also comes from its folder under app/, so keep the two in step.
 */
export const pagePaths = {
  home: "/",
  login: "/login",
  warehouse: "/warehouse",
  machines: "/machines",
  newInstallations: "/new-installations",
};

/** Product detail page. Product names go through encodeURIComponent (spec §5). */
export function productPath(item) {
  return `${pagePaths.warehouse}/${encodeURIComponent(item)}`;
}

/** Next.js server-side routes that the browser calls (never the backend directly). */
export const apiPaths = {
  signIn: "/api/auth/sign-in",
  signOut: "/api/auth/sign-out",
};

/** Pages reachable without a session. */
export const publicPagePaths = [pagePaths.login];

/**
 * Only allow same-site relative paths as a post-login destination,
 * so `?next=` cannot be used as an open redirect.
 */
export function safeNextPath(next) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return pagePaths.home;
  }
  if (publicPagePaths.includes(next.split("?")[0])) return pagePaths.home;
  return next;
}
