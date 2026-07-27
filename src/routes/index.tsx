import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplet, Wrench, BarChart3, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STOCKERZ RO — Stock & Service Management for RO Shops" },
      { name: "description", content: "Run your RO water purifier shop end-to-end: stock, sales, service, EMI plans, reports, invoices and filter reminders." },
      { property: "og:title", content: "STOCKERZ RO" },
      { property: "og:description", content: "The command center for RO water purifier shops." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="aurora-bg min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 text-primary">
            <Droplet className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">STOCKERZ RO</span>
        </div>
        <Link to="/auth" className="rounded-lg glass px-4 py-2 text-sm font-medium hover:bg-white/10">
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Premium SaaS for RO Shops</p>
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Run your RO water business from one <span className="bg-gradient-to-r from-aurora-2 via-aurora-1 to-aurora-3 bg-clip-text text-transparent">beautiful dashboard</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Stock, sales, service, EMI plans, invoices, filter reminders — everything a modern RO water purifier shop needs.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110">
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { icon: Droplet, title: "Stock & Sales", desc: "Auto-decrement stock, three sale modes." },
            { icon: Wrench, title: "Service & Reminders", desc: "3-month filter change reminders on dashboard." },
            { icon: BarChart3, title: "Reports", desc: "Daily & monthly sales, service and stock." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 text-left">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" /> Multi-shop tenant isolation • Row-level security
        </p>
      </main>
    </div>
  );
}
