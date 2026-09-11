import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, Button, Card, StatusPill } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import {
  departmentsApi,
  leaveTypesApi,
  leavesApi,
  portfoliosApi,
  rolesApi,
  usersApi,
} from "@/lib/api/services";
import type { Department, LeaveType, Portfolio, Role, StaffLeave, User } from "@/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Northbeam Staff Information System" },
      {
        name: "description",
        content: "Your personal staff dashboard, or the administrator management overview.",
      },
      { property: "og:title", content: "Dashboard — Northbeam Staff Console" },
      {
        property: "og:description",
        content: "Personal staff dashboard and administrator management overview.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  return <StaffDashboard />;
}

/* ==================== STAFF DASHBOARD (own data only) ==================== */

function StaffDashboard() {
  const { user } = useAuth();
  const [myLeaves, setMyLeaves] = useState<StaffLeave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [myPortfolio, setMyPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    if (!user) return;
    void Promise.all([
      leavesApi.list(),
      leaveTypesApi.list(),
      departmentsApi.list(),
      rolesApi.list(),
      portfoliosApi.list(),
    ]).then(([leaves, lt, depts, rs, portfolios]) => {
      // Staff only ever see their OWN leave requests and portfolio.
      setMyLeaves(leaves.filter((l) => l.user === user.id));
      setLeaveTypes([...lt]);
      setDepartments([...depts]);
      setRoles([...rs]);
      setMyPortfolio(portfolios.find((p) => p.user === user.id) ?? null);
    });
  }, [user]);

  const pending = myLeaves.filter((l) => l.status === "pending");
  const approved = myLeaves.filter((l) => l.status === "approved");
  const rejected = myLeaves.filter((l) => l.status === "rejected");
  const daysUsed = approved.reduce((sum, l) => sum + l.days, 0);

  const typeName = (id: number) => leaveTypes.find((t) => t.id === id)?.name ?? "—";
  const roleName = (id: number) => roles.find((r) => r.id === id)?.name ?? "—";
  const deptName = (id: number) => departments.find((d) => d.id === id)?.name ?? "—";

  return (
    <AppShell title={`Karibu, ${user?.fullname.split(" ")[0] ?? ""}`} eyebrow="Staff member">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="My requests" value={myLeaves.length} note="total leave requests" tone="text-accent" />
        <Kpi label="Pending" value={pending.length} note="awaiting admin review" tone="text-warn" />
        <Kpi label="Approved" value={approved.length} note={`${daysUsed} days used`} tone="text-ok" />
        <Kpi label="Rejected" value={rejected.length} note="not approved" tone="text-bad" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">My leave history</h2>
              <Link to="/leave" className="text-xs font-semibold text-brand">
                Request leave →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {myLeaves.length === 0 && (
                <p className="rounded-xl border border-white/70 bg-white/60 p-4 text-sm text-ink/50">
                  You have not requested any leave yet.
                </p>
              )}
              {myLeaves.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/60 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{typeName(l.leave_type)}</p>
                    <p className="truncate text-xs text-ink/50">
                      {l.start_date} → {l.end_date} · {l.days} days
                    </p>
                  </div>
                  <StatusPill status={l.status} />
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <Card>
            <h2 className="font-display text-base font-semibold">My portfolio</h2>
            <p className="mt-1 text-xs text-ink/50">Profile shown to administrators</p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={user?.fullname ?? ""} size={48} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.fullname}</p>
                <p className="truncate text-xs text-ink/50">@{user?.username}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Role" value={myPortfolio ? roleName(myPortfolio.role) : "Not set"} />
              <Row
                label="Department"
                value={myPortfolio ? deptName(myPortfolio.department) : "Not set"}
              />
              <Row label="Phone" value={user?.phone_number ?? "—"} />
              <Row label="Address" value={myPortfolio?.address || "Not set"} />
              <Row label="Status" value={user?.status ?? "—"} />
            </dl>
            <Link to="/portfolio" className="mt-4 block">
              <Button className="w-full">
                {myPortfolio ? "Update portfolio" : "Complete portfolio"}
              </Button>
            </Link>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

/* ==================== ADMIN DASHBOARD (org-wide data) ==================== */

function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const load = () =>
    Promise.all([
      usersApi.list(),
      leavesApi.list(),
      departmentsApi.list(),
      rolesApi.list(),
      leaveTypesApi.list(),
    ]).then(([u, l, d, r, lt]) => {
      setUsers([...u]);
      setLeaves([...l]);
      setDepartments([...d]);
      setRoles([...r]);
      setLeaveTypes([...lt]);
    });

  useEffect(() => {
    void load();
  }, []);

  const pending = users.filter((u) => u.status === "pending");
  const active = users.filter((u) => u.status === "active");
  const onLeave = leaves.filter((l) => l.status === "approved");

  const name = (id: number) => users.find((u) => u.id === id)?.fullname ?? "—";
  const typeName = (id: number) => leaveTypes.find((t) => t.id === id)?.name ?? "—";

  async function decide(id: number, decision: "approve" | "reject") {
    await usersApi.decide(id, decision);
    await load();
  }

  return (
    <AppShell title={`Welcome back, ${user?.fullname.split(" ")[0] ?? ""}`} eyebrow="Administrator">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Active staff" value={active.length} note="approved accounts" tone="text-ok" />
        <Kpi
          label="Pending requests"
          value={pending.length}
          note="awaiting review"
          tone="text-warn"
        />
        <Kpi label="On leave" value={onLeave.length} note="approved leave" tone="text-accent" />
        <Kpi
          label="Departments"
          value={departments.length}
          note={`across ${roles.length} roles`}
          tone="text-ink/40"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Registration approvals</h2>
              <span className="rounded-full bg-bad/12 px-2.5 py-1 text-xs font-semibold text-bad">
                {pending.length} to review
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {pending.length === 0 && (
                <p className="rounded-xl border border-white/70 bg-white/60 p-4 text-sm text-ink/50">
                  Nothing waiting — all registrations are reviewed.
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
                      @{p.username} · registered {p.created_at}
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
        </section>

        <section>
          <Card>
            <h2 className="font-display text-base font-semibold">Administrator</h2>
            <p className="mt-1 text-xs text-ink/50">Signed in with management access</p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={user?.fullname ?? ""} size={48} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.fullname}</p>
                <p className="truncate text-xs text-ink/50">@{user?.username}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Access" value="Administrator" />
              <Row label="Phone" value={user?.phone_number ?? "—"} />
              <Row label="Status" value={user?.status ?? "—"} />
            </dl>
            <Link to="/admin/users" className="mt-4 block">
              <Button className="w-full">Manage users</Button>
            </Link>
          </Card>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between px-1 pb-3">
          <h2 className="font-display text-base font-semibold">Recent leave requests</h2>
          <Link to="/admin/leaves" className="text-xs font-semibold text-brand">
            Manage all →
          </Link>
        </div>
        <Card className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-ink/40">
              <tr className="border-b border-white/60">
                <th className="px-4 py-3 font-semibold">Staff</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Type</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Dates</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.slice(0, 5).map((l) => (
                <tr key={l.id} className="border-b border-white/50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={name(l.user)} size={34} />
                      <span className="font-medium">{name(l.user)}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-ink/60 sm:table-cell">
                    {typeName(l.leave_type)}
                  </td>
                  <td className="hidden px-4 py-3 text-ink/60 md:table-cell">
                    {l.start_date} → {l.end_date}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </AppShell>
  );
}

/* ==================== Shared bits ==================== */

function Kpi({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  tone: string;
}) {
  return (
    <Card>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      <p className={`mt-1 text-xs font-medium ${tone}`}>{note}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/45">{label}</dt>
      <dd className="truncate text-right font-medium capitalize">{value}</dd>
    </div>
  );
}
