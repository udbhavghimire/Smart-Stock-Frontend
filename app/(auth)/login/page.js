import { safeNextPath } from "@/config/paths";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in · SmartStock",
};

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(Array.isArray(next) ? next[0] : next);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">SmartStock</h1>
        <p className="mb-6 text-sm text-muted">Sign in to continue</p>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
