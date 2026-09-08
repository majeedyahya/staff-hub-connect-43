import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { SWAGGER_URL } from "@/lib/api/client";
import { Avatar, Button } from "@/components/ui/primitives";

interface NavItem {
  to: string;
  label: string;
  glyph: string;
}

const staffNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", glyph: "▤" },
  { to: "/portfolio", label: "Portfolio", glyph: "☰" },
  { to: "/leave", label: "My Leave", glyph: "☾" },
];

const adminNav: NavItem[] = [
  { to: "/admin/approvals", label: "Approvals", glyph: "✓" },
  { to: "/admin/users", label: "Users", glyph: "✎" },
  { to: "/admin/portfolios", label: "Portfolios", glyph: "❖" },
  { to: "/admin/leaves", label: "Leave requests", glyph: "☾" },
  { to: "/admin/departments", label: "Departments", glyph: "⚙" },
  { to: "/admin/roles", label: "Roles", glyph: "✦" },
  { to: "/admin/leave-types", label: "Leave types", glyph: "≡" },
];

export function AppShell({
  title,
  eyebrow,
  actions,
  children,
  requireAdmin = false,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/", replace: true });
    else if (requireAdmin && user.role !== "admin") navigate({ to: "/dashboard", replace: true });
  }, [ready, user, requireAdmin, navigate]);

  if (!ready || !user) {
    return (
      <div className="bg-scene grid min-h-screen place-items-center text-sm text-ink/50">
        Loading your workspace…
      </div>
    );
  }

  const NavLinks = ({ items }: { items: NavItem[] }) => (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMenuOpen(false)}
            className={
              active
                ? "flex items-center gap-3 rounded-xl bg-brand px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand/20"
                : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-white/70"
            }
          >
            <span className="text-base leading-none">{item.glyph}</span> {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="glass p-4">
      <div className="flex items-center gap-2 px-1 pb-4">
        <div className="grid size-9 place-items-center rounded-xl bg-brand font-display text-sm font-bold text-white shadow-lg shadow-brand/30">
          N
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-tight">Northbeam</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Staff Console</p>
        </div>
      </div>
      <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/35">
        Workspace
      </p>
      <NavLinks items={staffNav} />
      {user.role === "admin" && (
        <>
          <p className="px-1 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/35">
            Administration
          </p>
          <NavLinks items={adminNav} />
        </>
      )}
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/60 bg-white/40 p-3">
        <Avatar name={user.fullname} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.fullname}</p>
          <p className="truncate text-[11px] capitalize text-ink/50">
            {user.role === "admin" ? "System Admin" : "Staff"}
          </p>
        </div>
        <button
          onClick={logout}
          className="ml-auto text-[11px] font-semibold text-ink/40 hover:text-bad"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-scene min-h-screen w-full font-sans text-ink antialiased">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-5 lg:px-8">
        <div className="flex min-h-[860px] gap-5">
          <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

          <main className="min-w-0 flex-1">
            <div className="glass flex flex-wrap items-center gap-3 p-3">
              <button
                className="grid size-9 place-items-center rounded-xl border border-white/70 bg-white/60 text-ink/60 lg:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                ☰
              </button>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">
                  {eyebrow ?? (user.role === "admin" ? "Administrator" : "Staff member")}
                </p>
                <h1 className="font-display text-xl font-semibold leading-tight">{title}</h1>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {actions}
                <a
                  href={SWAGGER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-sm text-ink/60 hover:bg-white/80 sm:flex"
                >
                  ↗ API docs
                </a>
                <Button variant="ghost" size="sm" onClick={logout} className="lg:hidden">
                  Sign out
                </Button>
              </div>
            </div>

            {menuOpen && <div className="mt-4 lg:hidden">{sidebar}</div>}

            <div className="mt-5 space-y-5">{children}</div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 pb-2 text-xs text-ink/45">
              <span>© {new Date().getFullYear()} Northbeam Systems</span>
              <a
                href={SWAGGER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-brand"
              >
                <span>↗</span> Swagger / OpenAPI docs
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
