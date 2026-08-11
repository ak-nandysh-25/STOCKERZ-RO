import * as React from "react";

export function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Button({ variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "outline" }) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all",
    ghost: "hover:bg-white/5 text-foreground",
    outline: "glass hover:bg-white/10",
    danger: "bg-destructive text-destructive-foreground hover:brightness-110",
  }[variant];
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`} />;
}

export function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Table({ children }: React.PropsWithChildren) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={`border-b border-glass-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`}>{children}</th>;
}

export function Td({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={`border-b border-glass-border/60 px-4 py-3 uppercase-data ${className}`}>{children}</td>;
}

export function Empty({ text }: { text: string }) {
  return <div className="py-16 text-center text-sm text-muted-foreground">{text}</div>;
}

export function Modal({ open, onClose, title, children }: React.PropsWithChildren<{ open: boolean; onClose: () => void; title: string }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="glass w-full max-w-lg rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
