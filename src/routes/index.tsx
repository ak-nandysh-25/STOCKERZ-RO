import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Droplet,
  Wrench,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  Users,
  Boxes,
  Sparkles,
  Zap,
  Check,
  Store,
  ChevronRight,
  TrendingUp,
  Bell,
  Clock,
  Printer,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STOCKERZ RO — Complete Business OS for RO Water Purifier Shops" },
      {
        name: "description",
        content:
          "Run your RO water purifier business end-to-end: stock inventory, 3-month filter replacement reminders, custom EMI plans, field technicians, GST invoices, and sales reports.",
      },
      { property: "og:title", content: "STOCKERZ RO — Command Center for RO Shops" },
      {
        property: "og:description",
        content: "Automate filter change reminders, sales, EMI tracking, and stock management for your RO shop.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="aurora-bg min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 p-2 text-primary shadow-inner">
              <Droplet className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                STOCKERZ <span className="text-primary">RO</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                v2.0 OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#workflow" className="transition hover:text-foreground">
              How it Works
            </a>
            <a href="#modules" className="transition hover:text-foreground">
              Modules
            </a>
            <a href="#pricing" className="transition hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition hover:text-foreground">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/admin-login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
            >
              <Store className="h-3.5 w-3.5" /> Admin Portal
            </Link>
            <Link
              to="/auth"
              className="rounded-xl glass px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/10 hover:border-white/20"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Purpose-Built SaaS for Water Purifier Showrooms & Technicians</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
          Supercharge your RO business with{" "}
          <span className="bg-gradient-to-r from-aurora-2 via-primary to-aurora-3 bg-clip-text text-transparent">
            automated filter reminders
          </span>{" "}
          & smart sales.
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed md:text-xl">
          Everything your RO shop needs: stock inventory auto-deduction, 3-month filter service scheduling, custom monthly EMI plans, technician assignment, and 1-click GST invoices.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-[1.02] hover:brightness-110 active:scale-95"
          >
            Launch Your Shop Free <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-2xl glass px-7 py-4 text-base font-semibold text-foreground transition hover:bg-white/10"
          >
            Explore All Features
          </a>
        </div>

        {/* Feature Pill Tags */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 border border-white/5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Auto-Filter Reminders
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 border border-white/5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Thermal & PDF Invoices
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 border border-white/5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> EMI Dues Ledger
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 border border-white/5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Field Technician Tracking
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 border border-white/5">
            <Shield className="h-3.5 w-3.5 text-primary" /> Multi-Shop Tenant Isolation
          </span>
        </div>

        {/* Interactive Dashboard UI Showcase Card */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-3xl border border-white/10 glass p-4 md:p-6 shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

          {/* Top Bar Mockup */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs font-mono text-muted-foreground">stockerz-ro.app/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Live Shop Connected
            </div>
          </div>

          {/* Dashboard Grid Preview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Monthly Revenue</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-black">₹ 1,84,500</p>
              <span className="text-[11px] text-emerald-400 font-medium">+18.4% from last month</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Service Due (90 Days)</span>
                <Bell className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 text-2xl font-black">18 Customers</p>
              <span className="text-[11px] text-amber-400 font-medium">Filter replacement alert active</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Active Stock Items</span>
                <Boxes className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-black">142 Units</p>
              <span className="text-[11px] text-primary font-medium">Membranes, Filters & Purifiers</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Pending EMI Dues</span>
                <CreditCard className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-2 text-2xl font-black">₹ 32,400</p>
              <span className="text-[11px] text-accent font-medium">8 active installments</span>
            </div>
          </div>

          {/* Quick Ticket List Mockup */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Service Calls & Technicians</h4>
              <span className="text-xs text-primary font-medium">View All Schedule →</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary grid place-items-center font-bold">RO</div>
                  <div>
                    <div className="font-semibold">AquaGrand 12L Service & Sediment Candle</div>
                    <div className="text-[11px] text-muted-foreground">Cust: S. Ramesh • Tech: Kumar (Field Engg)</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                  Scheduled Today
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 text-accent grid place-items-center font-bold">EMI</div>
                  <div>
                    <div className="font-semibold">Kent Supreme 20L Installation</div>
                    <div className="text-[11px] text-muted-foreground">Cust: M. Priya • 6 Months EMI Plan</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                  Invoice Paid
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Engineered for Water Purifier Businesses</p>
          <h2 className="mt-3 text-3xl font-black md:text-5xl">Everything you need to scale your RO shop</h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">
            Stop relying on manual registers, missing 3-month filter changes, or losing track of customer EMI payments.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Droplet,
              title: "Stock Inventory & Spare Parts",
              desc: "Auto-decrement stock during sales. Categorize RO Purifiers, Filter Candles, Membranes, Booster Pumps, and UV Lamps easily.",
              badge: "Auto-Deduction",
            },
            {
              icon: Clock,
              title: "3-Month Filter Change Reminders",
              desc: "Automatic filter service alerts on your dashboard 90 days after purchase or last service call so you never lose a repeat customer.",
              badge: "100% Repeat Revenue",
            },
            {
              icon: CreditCard,
              title: "Custom EMI & Installment Plans",
              desc: "Offer zero-down EMI options to your customers. Track monthly pending dues, collection histories, and send reminders.",
              badge: "Ledger Management",
            },
            {
              icon: FileText,
              title: "GST Invoicing & Thermal Printing",
              desc: "Generate professional tax invoices for purifiers and service calls. Supports Bluetooth thermal receipts and PDF downloads.",
              badge: "1-Click Print",
            },
            {
              icon: Users,
              title: "Technician & Field Engineer Dispatch",
              desc: "Assign service calls and installations to your field technicians. Monitor completion rates and technician performance.",
              badge: "Field Ops",
            },
            {
              icon: BarChart3,
              title: "Financial Reports & Profit Analytics",
              desc: "Real-time daily, weekly, and monthly sales graphs, profit margin calculators, and top-selling model breakdowns.",
              badge: "Live Analytics",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative rounded-3xl glass p-8 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition duration-300">
                  <f.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                  {f.badge}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold">{f.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Breakdown */}
      <section id="modules" className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Comprehensive Modules</span>
            <h2 className="mt-3 text-3xl font-black md:text-4xl leading-tight">
              One software. All your showroom operations.
            </h2>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Designed specifically for water purification technicians and showroom managers. No confusing bloated menus — just the tools you use every single day.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { title: "Customer History CRM", text: "Complete history of installed purifiers, membrane changes, and service history per customer." },
                { title: "Multi-Sale Modes", text: "Direct Sale, Sale with Installation, or EMI Installment Plan options in one billing window." },
                { title: "Custom Shop Branding", text: "Upload your shop logo, address, contact details, and GSTIN to print directly on bills." },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition"
              >
                Try the dashboard live <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-3xl glass p-6 border border-white/10 text-left">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 grid place-items-center font-bold mb-4">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Service Ticket Management</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Log service calls, assign technicians, specify replace items (Pre-filter, Sediment, Carbon, RO Membrane, UV lamp) and track resolution status.
                </p>
              </div>

              <div className="rounded-3xl glass p-6 border border-white/10 text-left sm:translate-y-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 grid place-items-center font-bold mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Instant GST Invoice Engine</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Auto-calculates CGST, SGST, IGST, discounts, and payment methods (Cash, UPI, Card, Net Banking). Print clean A4 or 3-inch thermal receipts.
                </p>
              </div>

              <div className="rounded-3xl glass p-6 border border-white/10 text-left">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 grid place-items-center font-bold mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Field Technician Portal</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Technicians get assigned service locations, customer contacts, and required replacement parts right on their mobile browsers.
                </p>
              </div>

              <div className="rounded-3xl glass p-6 border border-white/10 text-left sm:translate-y-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 grid place-items-center font-bold mb-4">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Multi-Shop & Role Control</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Supports admin roles and shop owners. Each shop’s customer database and inventory remains isolated with enterprise-grade row level security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="mx-auto max-w-6xl px-6 py-20 border-t border-white/5 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Simple 3-Step Setup</span>
        <h2 className="mt-3 text-3xl font-black md:text-5xl">How STOCKERZ RO Works</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
          Get your entire shop running in under 5 minutes without complex IT setup or hardware installation.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3 text-left">
          {[
            {
              step: "01",
              title: "Setup Your Showroom Profile",
              desc: "Sign up, enter your shop name, logo, GSTIN, and contact details for printed invoices.",
            },
            {
              step: "02",
              title: "Add Stock & Log Sales",
              desc: "Add your purifiers and spare filters into inventory. Log sales with instant stock auto-deduction.",
            },
            {
              step: "03",
              title: "Automate Reminders & Service",
              desc: "The dashboard automatically alerts you when 3-month filter replacement is due for each customer.",
            },
          ].map((s) => (
            <div key={s.step} className="relative rounded-3xl glass p-8 border border-white/10">
              <span className="text-4xl font-black text-primary/40 font-mono">{s.step}</span>
              <h3 className="mt-4 font-bold text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Transparent Pricing</span>
        <h2 className="mt-3 text-3xl font-black md:text-5xl">Simple plans for shops of all sizes</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
          No hidden fees or per-user penalties. Choose the plan that fits your showroom.
        </p>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="rounded-3xl glass p-8 text-left border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Single Outlet</span>
              <h3 className="mt-2 text-2xl font-extrabold">Starter Shop</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">Free</span>
                <span className="text-xs text-muted-foreground">/ forever</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Ideal for new single-person RO service technicians starting out.</p>

              <ul className="mt-8 space-y-3 text-xs">
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> Up to 50 Active Customers
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> Stock Inventory Management
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> 3-Month Filter Reminders
                </li>
                <li className="flex items-center gap-2 text-muted-foreground opacity-60">
                  <Check className="h-4 w-4 text-muted-foreground" /> GST Invoicing & Thermal Receipts
                </li>
              </ul>
            </div>

            <Link
              to="/auth"
              className="mt-8 block w-full text-center rounded-xl glass px-4 py-3 text-sm font-bold transition hover:bg-white/10"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Showroom Plan - Featured */}
          <div className="relative rounded-3xl glass p-8 text-left border-2 border-primary shadow-2xl shadow-primary/20 flex flex-col justify-between bg-primary/5">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[11px] font-black uppercase tracking-wider text-primary-foreground shadow-md">
              Most Popular
            </div>

            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Showroom OS</span>
              <h3 className="mt-2 text-2xl font-extrabold">Pro Showroom</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">₹499</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">For established RO water purifier shops & service outlets.</p>

              <ul className="mt-8 space-y-3 text-xs">
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> Unlimited Customers & Stock Items
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> Automated Filter Replacement Reminders
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> Custom EMI Plans & Dues Tracker
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> GST PDF & Thermal Bluetooth Invoices
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-primary" /> Field Technician Ticket Dispatch
                </li>
              </ul>
            </div>

            <Link
              to="/auth"
              className="mt-8 block w-full text-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-3xl glass p-8 text-left border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-sm font-bold text-accent uppercase tracking-wider">Multi-Branch</span>
              <h3 className="mt-2 text-2xl font-extrabold">Enterprise Chain</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">₹999</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">For RO distributors, franchises & multi-location chains.</p>

              <ul className="mt-8 space-y-3 text-xs">
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-accent" /> Multi-Branch Shop Management
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-accent" /> Role-based Admin & Staff Access
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-accent" /> Advanced Profit & Tax Reports
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-accent" /> Priority Phone & WhatsApp Support
                </li>
              </ul>
            </div>

            <Link
              to="/auth"
              className="mt-8 block w-full text-center rounded-xl glass px-4 py-3 text-sm font-bold transition hover:bg-white/10"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Got Questions?</span>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does the 3-month filter replacement reminder work?",
              a: "When you complete a sale or service for a customer, STOCKERZ RO calculates a 90-day timer based on the installed filter lifespan. Exactly 90 days later, the customer automatically appears in your dashboard's 'Filter Service Due' list so you can call or send a reminder."
            },
            {
              q: "Can I generate GST bills and print on thermal printers?",
              a: "Yes! STOCKERZ RO supports both full-page A4 PDF tax invoices and 3-inch thermal Bluetooth receipt printing. You can customize your shop's GSTIN, logo, and phone number."
            },
            {
              q: "How does stock auto-deduction work during sales?",
              a: "When you create a new sale (Direct Sale or Sale + Installation), the purifiers, sediment filters, pre-carbon candles, or RO membranes included in the bill are automatically subtracted from your live stock inventory."
            },
            {
              q: "Can field technicians log in from mobile devices?",
              a: "Yes, STOCKERZ RO is 100% responsive and works smoothly on mobile browsers. Technicians can view assigned service tickets, navigate to customer addresses, and log completed filter replacements on the go."
            },
            {
              q: "Is my shop data isolated and secure?",
              a: "Absoltely. STOCKERZ RO uses multi-tenant Row Level Security (RLS) powered by Supabase. Your shop's customer records, sales totals, and inventory are strictly private to your account."
            }
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-2xl glass border border-white/10 overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-base hover:text-primary transition"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openFaq === index ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="mx-auto max-w-6xl px-6 py-16 mb-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary/20 via-accent/20 to-aurora-1/20 border border-white/15 p-10 md:p-16 text-center overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <h2 className="text-3xl font-black md:text-5xl tracking-tight">
            Ready to streamline your RO shop today?
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of RO purifier dealers who trust STOCKERZ RO to manage stock, service reminders, and sales.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 transition hover:brightness-110 hover:scale-[1.02]"
            >
              Start Free Trial Now <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/30">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
              <Droplet className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-foreground">STOCKERZ RO</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} STOCKERZ RO. Built for RO Water Purifier Shops & Service Outlets.
          </p>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground transition">
              Sign In
            </Link>
            <Link to="/admin-login" className="hover:text-foreground transition">
              Admin Portal
            </Link>
            <a href="#privacy" className="hover:text-foreground transition">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
