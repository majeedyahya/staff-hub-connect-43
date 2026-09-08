import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "brand" | "ink" | "ghost" | "ok" | "bad";

const variants: Record<Variant, string> = {
  brand: "bg-brand text-brand-foreground shadow-lg shadow-brand/25 hover:bg-brand/90",
  ink: "bg-ink text-white shadow-lg shadow-ink/20 hover:bg-ink/90",
  ghost: "border border-white/70 bg-white/60 text-ink/70 hover:bg-white/85",
  ok: "bg-ok text-white shadow-sm shadow-ok/30 hover:bg-ok/90",
  bad: "border border-white/70 bg-white/70 text-bad hover:bg-white",
};

export function Button({
  variant = "brand",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("glass p-5", className)}>{children}</div>;
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="label-mini">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-bad">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-ink/45">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("field", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("field appearance-none", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("field min-h-[84px]", className)} {...props} />;
}

const statusTone: Record<string, string> = {
  active: "bg-ok/15 text-ok",
  approved: "bg-ok/15 text-ok",
  pending: "bg-warn/15 text-warn",
  inactive: "bg-ink/10 text-ink/50",
  rejected: "bg-bad/15 text-bad",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        statusTone[status] ?? "bg-ink/10 text-ink/50",
      )}
    >
      {status}
    </span>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-brand/12 font-display font-semibold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm">
      <div className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white/85 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-ink/45">
        {label}
      </td>
    </tr>
  );
}
