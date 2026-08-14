import * as React from "react";

export function Card({ className = "", children, hover = false }: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return (
    <div className={`glass ${hover ? "glass-hover group" : ""} relative overflow-hidden rounded-2xl p-5 md:p-6 shadow-xl shadow-black/5 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight md:text-3xl text-foreground bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm font-medium text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "outline" | "accent" }) {
  const styles = {
    primary:
      "bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.97]",
    accent:
      "bg-gradient-to-r from-accent to-teal-500 text-accent-foreground hover:brightness-110 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 active:scale-[0.97]",
    ghost:
      "hover:bg-foreground/10 text-foreground active:scale-[0.97]",
    outline:
      "glass hover:bg-foreground/10 text-foreground border border-glass-border hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.97]",
    danger:
      "bg-gradient-to-r from-destructive to-rose-600 text-destructive-foreground hover:brightness-110 shadow-lg shadow-destructive/20 hover:shadow-destructive/40 hover:-translate-y-0.5 active:scale-[0.97]",
  }[variant];

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${styles} ${className}`}
    />
  );
}

export function Badge({
  children,
  variant = "primary",
  className = "",
}: React.PropsWithChildren<{ variant?: "primary" | "success" | "warning" | "destructive" | "accent" | "muted"; className?: string }>) {
  const styles = {
    primary: "bg-primary/15 text-primary border-primary/30",
    success: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    accent: "bg-accent/15 text-accent border-accent/30",
    muted: "bg-muted/40 text-muted-foreground border-border/40",
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold tracking-wide uppercase-data transition-transform duration-200 hover:scale-105 ${styles} ${className}`}>
      {children}
    </span>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none border border-border/60 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl bg-input px-3.5 py-2.5 text-sm text-foreground outline-none border border-border/60 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none border border-border/60 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 ${props.className ?? ""}`}
    />
  );
}

export function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Table({ children }: React.PropsWithChildren) {
  return (
    <div className="glass overflow-hidden rounded-2xl shadow-xl shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-foreground">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={`border-b border-glass-border bg-muted/20 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`border-b border-glass-border/40 px-4 py-3.5 uppercase-data text-foreground transition-colors duration-150 hover:bg-primary/5 ${className}`}>{children}</td>;
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="py-16 text-center text-sm font-medium text-muted-foreground">
      <p>{text}</p>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: React.PropsWithChildren<{ open: boolean; onClose: () => void; title: string }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="glass w-full max-w-lg rounded-3xl p-6 text-foreground shadow-2xl border border-glass-border animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-glass-border/50 pb-3">
          <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl glass text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
