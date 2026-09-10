import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Avatar,
  Button,
  Card,
  EmptyRow,
  Field,
  Input,
  Modal,
  Select,
} from "@/components/ui/primitives";
import { departmentsApi, portfoliosApi, rolesApi, usersApi } from "@/lib/api/services";
import type { Department, Portfolio, Role, User } from "@/types";

export const Route = createFileRoute("/admin/portfolios")({
  head: () => ({
    meta: [
      { title: "Portfolio management — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Manage staff portfolios: role, department, address and LinkedIn profile records.",
      },
      { property: "og:title", content: "Portfolio management — Northbeam" },
      {
        property: "og:description",
        content: "Manage staff role, department, address and LinkedIn records.",
      },
    ],
  }),
  component: AdminPortfoliosPage,
});

function AdminPortfoliosPage() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [form, setForm] = useState({
    user: "",
    role: "",
    department: "",
    address: "",
    linkedin: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([portfoliosApi.list(), usersApi.list(), rolesApi.list(), departmentsApi.list()])
      .then(([p, u, r, d]) => {
        setItems([...p]);
        setUsers([...u]);
        setRoles([...r]);
        setDepartments([...d]);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const name = (id: number) => users.find((u) => u.id === id)?.fullname ?? "Unknown";
  const roleName = (id: number) => roles.find((r) => r.id === id)?.name ?? "—";
  const deptName = (id: number) => departments.find((d) => d.id === id)?.name ?? "—";

  function openCreate() {
    setEditing(null);
    setForm({ user: "", role: "", department: "", address: "", linkedin: "" });
    setErrors({});
    setOpen(true);
  }

  function openEdit(p: Portfolio) {
    setEditing(p);
    setForm({
      user: String(p.user),
      role: String(p.role),
      department: String(p.department),
      address: p.address,
      linkedin: p.linkedin,
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.user) next["user"] = "Select a staff member.";
    if (!form.role) next["role"] = "Select a role.";
    if (!form.department) next["department"] = "Select a department.";
    if (form.address.trim().length < 5) next["address"] = "Enter a physical address.";
    if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\//.test(form.linkedin))
      next["linkedin"] = "Enter a full LinkedIn profile URL.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const payload = {
      user: Number(form.user),
      role: Number(form.role),
      department: Number(form.department),
      image: editing?.image ?? "",
      address: form.address.trim(),
      linkedin: form.linkedin.trim(),
    };
    try {
      if (editing) await portfoliosApi.update(editing.id, payload);
      else await portfoliosApi.create(payload);
      setOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function destroy(p: Portfolio) {
    if (!window.confirm(`Delete the portfolio for ${name(p.user)}?`)) return;
    await portfoliosApi.remove(p.id);
    await load();
  }

  return (
    <AppShell
      title="Portfolio management"
      requireAdmin
      actions={
        <Button variant="ink" size="sm" onClick={openCreate}>
          + New portfolio
        </Button>
      }
    >
      <Card className="p-0">
        <h2 className="px-5 pt-5 font-display text-base font-semibold">Staff portfolios</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-ink/40">
              <tr className="border-b border-white/60">
                <th className="px-4 py-3 font-semibold">Staff</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Department</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Role</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">LinkedIn</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <EmptyRow colSpan={5} label="Loading…" />
              ) : items.length === 0 ? (
                <EmptyRow colSpan={5} label="No portfolios recorded yet." />
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-b border-white/50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={`${name(p.user)} profile`}
                            className="size-9 rounded-full object-cover"
                          />
                        ) : (
                          <Avatar name={name(p.user)} />
                        )}
                        <div>
                          <p className="font-medium">{name(p.user)}</p>
                          <p className="max-w-[200px] truncate text-xs text-ink/45">{p.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">
                      {deptName(p.department)}
                    </td>
                    <td className="hidden px-4 py-3 text-ink/60 md:table-cell">
                      {roleName(p.role)}
                    </td>
                    <td className="hidden max-w-[220px] truncate px-4 py-3 text-brand lg:table-cell">
                      {p.linkedin || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                          Edit
                        </Button>
                        <Button variant="bad" size="sm" onClick={() => void destroy(p)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        title={editing ? "Edit portfolio" : "New portfolio"}
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <Field label="Staff member" error={errors["user"]}>
            <Select value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })}>
              <option value="">Select staff</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullname}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Role" error={errors["role"]}>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Department" error={errors["department"]}>
            <Select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="LinkedIn profile" error={errors["linkedin"]}>
            <Input
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address" error={errors["address"]}>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex gap-2 pt-1 sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save portfolio"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
