import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, EmptyRow, Field, Input, Select, StatusPill, Textarea } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { businessDays, leaveTypesApi, leavesApi } from "@/lib/api/services";
import type { LeaveType, StaffLeave } from "@/types";

export const Route = createFileRoute("/leave")({
  head: () => ({
    meta: [
      { title: "My leave — Northbeam Staff Information System" },
      {
        name: "description",
        content:
          "Request annual, sick or unpaid leave and track the approval status of every request you have made.",
      },
      { property: "og:title", content: "My leave — Northbeam Staff Console" },
      {
        property: "og:description",
        content: "Submit leave requests and track their approval status.",
      },
    ],
  }),
  component: LeavePage,
});

function LeavePage() {
  const { user } = useAuth();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [form, setForm] = useState({ leave_type: "", start_date: "", end_date: "", reason: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () =>
    Promise.all([leaveTypesApi.list(), leavesApi.list()]).then(([t, l]) => {
      setTypes([...t]);
      setLeaves([...l]);
    });

  useEffect(() => {
    void load();
  }, []);

  const days = useMemo(
    () => businessDays(form.start_date, form.end_date),
    [form.start_date, form.end_date],
  );
  const mine = leaves.filter((l) => l.user === user?.id);
  const typeName = (id: number) => types.find((t) => t.id === id)?.name ?? "—";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const next: Record<string, string> = {};
    if (!form.leave_type) next["leave_type"] = "Choose a leave type.";
    if (!form.start_date) next["start_date"] = "Start date is required.";
    if (!form.end_date) next["end_date"] = "End date is required.";
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      next["end_date"] = "End date must be after the start date.";
    if (form.reason.trim().length < 5) next["reason"] = "Give a short reason (5+ characters).";
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await leavesApi.create({
        user: user.id,
        leave_type: Number(form.leave_type),
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason.trim(),
        days,
        status: "pending",
      });
      setForm({ leave_type: "", start_date: "", end_date: "", reason: "" });
      setSaved(true);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="My leave" eyebrow="Staff member">
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Card className="p-0">
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="font-display text-base font-semibold">My requests</h2>
              <span className="text-xs text-ink/45">{mine.length} total</span>
            </div>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.12em] text-ink/40">
                <tr className="border-b border-white/60">
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Dates</th>
                  <th className="px-4 py-3 font-semibold">Days</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {mine.length === 0 ? (
                  <EmptyRow colSpan={4} label="No leave requests yet." />
                ) : (
                  mine.map((l) => (
                    <tr key={l.id} className="border-b border-white/50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{typeName(l.leave_type)}</p>
                        <p className="truncate text-xs text-ink/50">{l.reason}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">
                        {l.start_date} → {l.end_date}
                      </td>
                      <td className="px-4 py-3 text-ink/60">{l.days}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={l.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <Card>
            <h2 className="font-display text-base font-semibold">Request leave</h2>
            <p className="mt-1 text-xs text-ink/50">Submitted for manager review</p>
            <form className="mt-4 space-y-3" onSubmit={submit}>
              <Field label="Leave type" error={errors["leave_type"]}>
                <Select
                  value={form.leave_type}
                  onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                >
                  <option value="">Select a type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start" error={errors["start_date"]}>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </Field>
                <Field label="End" error={errors["end_date"]}>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Reason" error={errors["reason"]}>
                <Textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Family trip — pre-booked"
                />
              </Field>
              <div className="flex items-center justify-between rounded-xl bg-brand/8 px-3 py-2.5">
                <span className="text-xs font-medium text-ink/60">Business days</span>
                <span className="font-display text-sm font-semibold">{days} days</span>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Submitting…" : "Submit request"}
              </Button>
              {saved && (
                <p className="text-center text-xs font-medium text-ok">
                  Request submitted for review.
                </p>
              )}
            </form>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
