import type { ReactNode } from "react";

export function Pill({ tone = "muted", children }: { tone?: "ok" | "warn" | "alert" | "muted"; children: ReactNode }) {
  const styles = {
    ok: "bg-primary-soft text-accent-foreground",
    warn: "bg-gold-soft text-gold",
    alert: "bg-destructive-soft text-destructive",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  const dot = { ok: "dot-online", warn: "dot-gold", alert: "dot-alert", muted: "bg-muted-foreground/50" }[tone];
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 break-words rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide ${styles}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

export function SectionHead({ tag, title, action }: { tag: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="font-mono text-[10px] tracking-[0.25em] text-gold">{tag}</div>
        <h2 className="text-xl font-bold tracking-tight text-chassis">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Btn({ variant = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "gold" | "danger" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-glow",
    ghost: "border border-border bg-card text-chassis hover:bg-muted",
    gold: "bg-gold text-primary-foreground hover:bg-gold-glow",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  }[variant];
  return <button {...p} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${v} ${className}`} />;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chassis/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="glass max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-bold text-chassis">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
