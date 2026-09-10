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
  Textarea,
} from "@/components/ui/primitives";
import { businessDays, leaveTypesApi, leavesApi, usersApi } from "@/lib/api/services";
import type { LeaveStatus, LeaveType, StaffLeave, User } from "@/types";

export const Route = createFileRoute("/admin/leaves")({
  head: () => ({
    meta: [
      { title: "Leave management — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Approve, reject, edit and remove staff leave requests across every department.",
      },
      { property: "og:title", content: "Leave management — Northbeam" },
      {
        property: "og:description",
        content: "Approve, reject and edit staff leave requests.",
      },
    ],
  }),
  component: AdminLeavesPage,
});

function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | LeaveStatus>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StaffLeave | null>(null);
  const [form, setForm] = useState({
    user: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    status: "pending" as LeaveStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([leavesApi.list(), usersApi.list(), leaveTypesApi.list()])
      .then(([l, u, t]) => {
        setLeaves([...l]);
        setUsers([...u]);
        setTypes([...t]);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const name = (id: number) => users.find((u) => u.id === id)?.fullname ?? "Unknown";
  const typeName = (id: number) => types.find((t) => t.id === id)?.name ?? "—";
  const rows = filter === "all" ? leaves : leaves.filter((l) => l.status === filter);

  function openCreate() {
    setEditing(null);
    setForm({
      user: "",
      leave_type: "",
      start_date: "",
      end_date: "",
      reason: "",
      status: "pending",
    });
    setErrors({});
    setOpen(true);
  }

  function openEdit(l: StaffLeave) {
    setEditing(l);
    setForm({
      user: String(l.user),
      leave_type: String(l.leave_type),
      start_date: l.start_date,
      end_date: l.end_date,
      reason: l.reason,
      status: l.status,
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.user) next["user"] = "Select a staff member.";
    if (!form.leave_type) next["leave_type"] = "Select a leave type.";
    if (!form.start_date) next["start_date"] = "Start date is required.";
    if (!form.end_date || form.end_date < form.start_date)
      next["end_date"] = "End date must be after the start date.";
    if (form.reason.trim().length < 5) next["reason"] = "Give a short reason.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const payload = {
      user: Number(form.user),
      leave_type: Number(form.leave_type),
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason.trim(),
      days: businessDays(form.start_date, form.end_date),
      status: form.status,
    };
    try {
      if (editing) await leavesApi.update(editing.id, payload);
      else await leavesApi.create(payload);
      setOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(l: StaffLeave, status: LeaveStatus) {
    await leavesApi.setStatus(l.id, status);
    await load();
  }

  async function destroy(l: StaffLeave) {
    if (!window.confirm(`Delete this leave request for ${name(l.user)}?`)) return;
    await leavesApi.remove(l.id);
    await load();
  }

  return (
    <AppShell
      title="Leave management"
      requireAdmin
      actions={
        <Button variant="ink" size="sm" onClick={openCreate}>
          + New request
        </Button>
      }
    >
      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-2 px-5 pt-5">
          <h2 className="font-display text-base font-semibold">Requests</h2>
          <div className="ml-auto flex gap-1.5">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold capitalize text-white"
                    : "rounded-lg border border-white/70 bg-white/60 px-3 py-1.5 text-xs font-semibold capitalize text-ink/60"
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-ink/40">
              <tr className="border-b border-white/60">
                <th className="px-4 py-3 font-semibold">Staff</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Type</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Dates</th>
                <th className="px-4 py-3 font-semibold">Days</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <EmptyRow colSpan={6} label="Loading…" />
              ) : rows.length === 0 ? (
                <EmptyRow colSpan={6} label="No leave requests here." />
              ) : (
                rows.map((l) => (
                  <tr key={l.id} className="border-b border-white/50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={name(l.user)} />
                        <div>
                          <p className="font-medium">{name(l.user)}</p>
                          <p className="max-w-[220px] truncate text-xs text-ink/45">{l.reason}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">
                      {typeName(l.leave_type)}
                    </td>
                    <td className="hidden px-4 py-3 text-ink/60 md:table-cell">
                      {l.start_date} → {l.end_date}
                    </td>
                    <td className="px-4 py-3 text-ink/60">{l.days}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={l.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {l.status !== "approved" && (
                          <Button variant="ok" size="sm" onClick={() => void setStatus(l, "approved")}>
                            Approve
                          </Button>
                        )}
                        {l.status !== "rejected" && (
                          <Button variant="bad" size="sm" onClick={() => void setStatus(l, "rejected")}>
                            Reject
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(l)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => void destroy(l)}>
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
        title={editing ? "Edit leave request" : "New leave request"}
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
          <Field label="Leave type" error={errors["leave_type"]}>
            <Select
              value={form.leave_type}
              onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
            >
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start date" error={errors["start_date"]}>
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </Field>
          <Field label="End date" error={errors["end_date"]}>
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LeaveStatus })}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
          <Field label="Business days">
            <Input disabled value={businessDays(form.start_date, form.end_date)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason" error={errors["reason"]}>
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex gap-2 pt-1 sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save request"}
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
