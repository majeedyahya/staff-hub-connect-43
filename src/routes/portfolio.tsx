import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, Button, Card, Field, Input, Select } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { departmentsApi, portfoliosApi, rolesApi } from "@/lib/api/services";
import type { Department, Portfolio, Role } from "@/types";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "My portfolio — Northbeam Staff Information System" },
      {
        name: "description",
        content:
          "Keep your staff portfolio current: role, department, photo, address and LinkedIn profile.",
      },
      { property: "og:title", content: "My portfolio — Northbeam Staff Console" },
      {
        property: "og:description",
        content: "Update your role, department, photo, address and LinkedIn profile.",
      },
    ],
  }),
  component: PortfolioPage,
});

interface FormState {
  role: string;
  department: string;
  image: string;
  address: string;
  linkedin: string;
}

function PortfolioPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [existing, setExisting] = useState<Portfolio | null>(null);
  const [form, setForm] = useState<FormState>({
    role: "",
    department: "",
    image: "",
    address: "",
    linkedin: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void Promise.all([rolesApi.list(), departmentsApi.list(), portfoliosApi.list()]).then(
      ([r, d, p]) => {
        setRoles([...r]);
        setDepartments([...d]);
        const mine = p.find((item) => item.user === user.id) ?? null;
        setExisting(mine);
        if (mine)
          setForm({
            role: String(mine.role),
            department: String(mine.department),
            image: mine.image,
            address: mine.address,
            linkedin: mine.linkedin,
          });
      },
    );
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.role) next.role = "Select your role.";
    if (!form.department) next.department = "Select your department.";
    if (form.address.trim().length < 5) next.address = "Enter your physical address.";
    if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\//.test(form.linkedin))
      next.linkedin = "Enter a full LinkedIn profile URL.";
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length) return;

    setBusy(true);
    const payload = {
      user: user.id,
      role: Number(form.role),
      department: Number(form.department),
      image: form.image,
      address: form.address.trim(),
      linkedin: form.linkedin.trim(),
    };
    try {
      const result = existing
        ? await portfoliosApi.update(existing.id, payload)
        : await portfoliosApi.create(payload);
      setExisting(result);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  function onImage(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  return (
    <AppShell title="My portfolio" eyebrow="Staff profile">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Portfolio details</h2>
          <p className="mt-1 text-xs text-ink/50">Visible to administrators in staff records.</p>

          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
            <Field label="Role" error={errors.role}>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="">Select a role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Department" error={errors.department}>
              <Select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="">Select a department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Address" error={errors.address}>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="14 Harbour Way, Mombasa"
              />
            </Field>
            <Field label="LinkedIn profile" error={errors.linkedin}>
              <Input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </Field>
            <Field label="Profile image" hint="PNG or JPG, stored with your record">
              <Input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} />
            </Field>

            <div className="flex items-center gap-3 pt-1 sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : existing ? "Update portfolio" : "Save portfolio"}
              </Button>
              {saved && <span className="text-xs font-medium text-ok">Portfolio saved.</span>}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold">Preview</h2>
          <div className="mt-4 flex items-center gap-3">
            {form.image ? (
              <img
                src={form.image}
                alt={`${user?.fullname ?? "Staff"} profile`}
                className="size-14 rounded-full object-cover"
              />
            ) : (
              <Avatar name={user?.fullname ?? ""} size={56} />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.fullname}</p>
              <p className="truncate text-xs text-ink/50">
                {roles.find((r) => String(r.id) === form.role)?.name ?? "Role not set"} ·{" "}
                {departments.find((d) => String(d.id) === form.department)?.name ?? "No department"}
              </p>
            </div>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink/45">Phone</dt>
              <dd className="text-right font-medium">{user?.phone_number}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink/45">Address</dt>
              <dd className="truncate text-right font-medium">{form.address || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink/45">LinkedIn</dt>
              <dd className="truncate text-right font-medium text-brand">
                {form.linkedin || "—"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </AppShell>
  );
}
