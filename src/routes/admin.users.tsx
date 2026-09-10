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
  StatusPill,
} from "@/components/ui/primitives";
import { usersApi } from "@/lib/api/services";
import type { Gender, User, UserRole, UserStatus } from "@/types";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User management — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Create, edit, activate and remove staff and administrator accounts.",
      },
      { property: "og:title", content: "User management — Northbeam" },
      {
        property: "og:description",
        content: "Create, edit, activate and remove staff accounts.",
      },
    ],
  }),
  component: UsersPage,
});

interface FormState {
  username: string;
  fullname: string;
  gender: Gender;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
  password: string;
}

const empty: FormState = {
  username: "",
  fullname: "",
  gender: "female",
  phone_number: "",
  role: "staff",
  status: "active",
  password: "",
};

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [busy, setBusy] = useState(false);

  const load = () =>
    usersApi
      .list()
      .then((u) => setUsers([...u]))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const filtered = users.filter((u) =>
    `${u.fullname} ${u.username}`.toLowerCase().includes(query.toLowerCase()),
  );

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({
      username: u.username,
      fullname: u.fullname,
      gender: u.gender,
      phone_number: u.phone_number,
      role: u.role,
      status: u.status,
      password: "",
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.username.trim().length < 3) next.username = "At least 3 characters.";
    if (form.fullname.trim().length < 3) next.fullname = "Enter the full name.";
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone_number.trim()))
      next.phone_number = "Enter a valid phone number.";
    if (!editing && form.password.length < 6) next.password = "At least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      if (editing) await usersApi.update(editing.id, form);
      else await usersApi.create(form);
      setOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function destroy(u: User) {
    if (!window.confirm(`Delete ${u.fullname}? This also removes their portfolio and leave.`))
      return;
    await usersApi.remove(u.id);
    await load();
  }

  return (
    <AppShell
      title="User management"
      requireAdmin
      actions={
        <Button variant="ink" size="sm" onClick={openCreate}>
          + New user
        </Button>
      }
    >
      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
          <h2 className="font-display text-base font-semibold">All accounts</h2>
          <Input
            className="ml-auto max-w-xs"
            placeholder="Search staff…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-ink/40">
              <tr className="border-b border-white/60">
                <th className="px-4 py-3 font-semibold">Staff</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Phone</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Account type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <EmptyRow colSpan={5} label="Loading…" />
              ) : filtered.length === 0 ? (
                <EmptyRow colSpan={5} label="No matching accounts." />
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-white/50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullname} />
                        <div>
                          <p className="font-medium">{u.fullname}</p>
                          <p className="text-xs text-ink/45">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">{u.phone_number}</td>
                    <td className="hidden px-4 py-3 capitalize text-ink/60 md:table-cell">
                      {u.role}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={u.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        <Button variant="bad" size="sm" onClick={() => void destroy(u)}>
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

      <Modal open={open} title={editing ? "Edit user" : "New user"} onClose={() => setOpen(false)}>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <Field label="Full name" error={errors.fullname}>
            <Input
              value={form.fullname}
              onChange={(e) => setForm({ ...form, fullname: e.target.value })}
            />
          </Field>
          <Field label="Username" error={errors.username}>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>
          <Field label="Gender">
            <Select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Phone number" error={errors.phone_number}>
            <Input
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
          </Field>
          <Field label="Account type">
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Password"
              error={errors.password}
              hint={editing ? "Leave blank to keep the current password" : undefined}
            >
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex gap-2 pt-1 sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save user"}
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
