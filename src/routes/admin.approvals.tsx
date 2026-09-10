import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, Button, Card, StatusPill } from "@/components/ui/primitives";
import { usersApi } from "@/lib/api/services";
import type { User } from "@/types";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({
    meta: [
      { title: "Registration approvals — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Review, approve or reject pending staff registration requests.",
      },
      { property: "og:title", content: "Registration approvals — Northbeam" },
      {
        property: "og:description",
        content: "Approve or reject pending staff registration requests.",
      },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const load = () => usersApi.list().then((u) => setUsers([...u]));
  useEffect(() => {
    void load();
  }, []);

  const pending = users.filter((u) => u.status === "pending");
  const decided = users.filter((u) => u.status === "rejected" || u.status === "active");

  async function decide(id: number, decision: "approve" | "reject") {
    await usersApi.decide(id, decision);
    await load();
  }

  return (
    <AppShell title="Registration approvals" requireAdmin>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Awaiting review</h2>
          <span className="rounded-full bg-bad/12 px-2.5 py-1 text-xs font-semibold text-bad">
            {pending.length} to review
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {pending.length === 0 && (
            <p className="rounded-xl border border-white/70 bg-white/60 p-4 text-sm text-ink/50">
              No pending registrations.
            </p>
          )}
          {pending.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/60 p-3"
            >
              <Avatar name={p.fullname} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.fullname}</p>
                <p className="truncate text-xs text-ink/50">
                  @{p.username} · {p.phone_number} · registered {p.created_at}
                </p>
              </div>
              <Button variant="ok" size="sm" onClick={() => void decide(p.id, "approve")}>
                Approve
              </Button>
              <Button variant="bad" size="sm" onClick={() => void decide(p.id, "reject")}>
                Reject
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-0">
        <h2 className="px-5 pt-5 font-display text-base font-semibold">Decision history</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.12em] text-ink/40">
            <tr className="border-b border-white/60">
              <th className="px-4 py-3 font-semibold">Staff</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">Registered</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {decided.map((u) => (
              <tr key={u.id} className="border-b border-white/50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullname} size={34} />
                    <span className="font-medium">{u.fullname}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">{u.created_at}</td>
                <td className="px-4 py-3">
                  <StatusPill status={u.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
