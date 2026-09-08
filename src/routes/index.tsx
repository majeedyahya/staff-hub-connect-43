import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card, Field, Input } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { SWAGGER_URL } from "@/lib/api/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Northbeam Staff Information System" },
      {
        name: "description",
        content:
          "Secure sign-in for the Northbeam Staff Information System: staff portfolios, leave requests and admin management.",
      },
      { property: "og:title", content: "Sign in — Northbeam Staff Information System" },
      {
        property: "og:description",
        content: "Staff portfolios, leave requests and admin management in one console.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.username.trim()) next.username = "Username is required.";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    setMessage(null);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const signedIn = await login(form.username.trim(), form.password);
      navigate({ to: signedIn.role === "admin" ? "/admin/approvals" : "/dashboard" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-scene flex min-h-screen items-center justify-center px-4 py-10 font-sans text-ink">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl bg-brand font-display text-base font-bold text-white shadow-lg shadow-brand/30">
            N
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-tight">Northbeam</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Staff Console</p>
          </div>
        </div>

        <Card>
          <h1 className="font-display text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-ink/50">
            Use your staff username and password. New accounts need admin approval.
          </p>

          <form className="mt-5 space-y-3" onSubmit={submit}>
            <Field label="Username" error={errors.username}>
              <Input
                value={form.username}
                autoComplete="username"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. dcho"
              />
            </Field>
            <Field label="Password" error={errors.password}>
              <Input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </Field>

            {message && (
              <p className="rounded-xl bg-bad/10 px-3 py-2 text-xs font-medium text-bad">{message}</p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink/55">
            No account yet?{" "}
            <Link to="/register" className="font-semibold text-brand">
              Register as staff
            </Link>
          </p>

          <div className="mt-5 rounded-xl bg-brand/8 px-3 py-2.5 text-[11px] leading-relaxed text-ink/60">
            Demo logins — admin: <b>admin / admin123</b> · staff: <b>dcho / staff123</b>
          </div>
        </Card>

        <div className="mt-4 flex justify-center">
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand"
          >
            ↗ Swagger / OpenAPI docs
          </a>
        </div>
      </div>
    </div>
  );
}
