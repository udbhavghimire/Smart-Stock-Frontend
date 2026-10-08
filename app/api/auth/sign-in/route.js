import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { serverEnv } from "@/server/env";
import { isSameOrigin, setSessionCookie } from "@/server/session";

// Simple login: checks the username and password from .env.
// TODO: replace with the backend sign-in once it exists.
export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin not allowed." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { username, password } = body ?? {};

  if (username !== serverEnv.loginUsername || password !== serverEnv.loginPassword) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, randomUUID());
  return response;
}
