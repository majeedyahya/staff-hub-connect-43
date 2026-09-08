import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Field, Input, Select } from "@/components/ui/primitives";
import { authApi } from "@/lib/api/services";
import type { Gender } from "@/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Staff registration — Northbeam Staff Information System" },
      {
        name: "description",
        content:
          "Request a Northbeam staff account. Registrations are reviewed and approved by a system administrator.",
      },
      { property: "og:title", content: "Staff registration — Northbeam" },
      {
        property: "og:description",
        content: "Request a staff account; an administrator reviews every registration.",
      },
    ],
  }),
  component: RegisterPage,
});

interface FormState {
  username: string;
  fullname: string;
  gender: Gender;
  phone_number: string;
  password: string;
  confirm: string;
}

export default function noop() {}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    username: "",
    fullname: "",
    gender: "female",
    phone_number: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.username.trim().length < 3) next.username = "At least 3 characters.";
    if (form.fullname.trim().length < 3) next.fullname = "Enter your full name.";
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone_number.trim()))
      next.phone_number = "Enter a valid phone number.";
    if (form.password.length < 6) next.password = "At least 6 characters.";
    if (form.password !== form.confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    setMessage(null);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await authApi.register({
        username: form.username.trim(),
        fullname: form.fullname.trim(),
        gender: form.gender,
        phone_number: form.phone_number.trim(),
        password: form.password,
      });
      setDone(true);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-scene flex min-h-screen items-center justify-center px-4 py-10 font-sans text-ink">
      <div className="w-full max-w-xl">
        <Card>
          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-ok/15 text-xl text-ok">
                ✓
              </div>
              <h1 className="mt-4 font-display text-xl font-semibold">Registration submitted</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink/55">
                Your account is pending approval. You will be able to sign in once an administrator
                approves it.
              </p>
              <Button className="mt-5" onClick={() => navigate({ to: "/" })}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold">Create your staff account</h1>
              <p className="mt-1 text-sm text-ink/50">
                An administrator reviews every registration before access is granted.
              </p>

              <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
                <Field label="Full name" error={errors.fullname}>
                  <Input
                    value={form.fullname}
                    onChange={(e) => set("fullname", e.target.value)}
                    placeholder="Amara Osei"
                  />
                </Field>
                <Field label="Username" error={errors.username}>
                  <Input
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    placeholder="aosei"
                  />
                </Field>
                <Field label="Gender" error={errors.gender}>
                  <Select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value as Gender)}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
                <Field label="Phone number" error={errors.phone_number}>
                  <Input
                    value={form.phone_number}
                    onChange={(e) => set("phone_number", e.target.value)}
                    placeholder="+254 700 000 000"
                  />
                </Field>
                <Field label="Password" error={errors.password}>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                </Field>
                <Field label="Confirm password" error={errors.confirm}>
                  <Input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => set("confirm", e.target.value)}
                  />
                </Field>

                {message && (
                  <p className="rounded-xl bg-bad/10 px-3 py-2 text-xs font-medium text-bad sm:col-span-2">
                    {message}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1 sm:col-span-2">
                  <Button type="submit" disabled={busy}>
                    {busy ? "Submitting…" : "Submit registration"}
                  </Button>
                  <Link to="/" className="text-sm font-medium text-ink/55 hover:text-ink">
                    Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
