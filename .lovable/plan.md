# Stockerz RO — Multi-Tenant Stock & Service Management

A premium dark SaaS dashboard for RO water purifier shops: stock, sales, service, EMI, technicians, reports, invoices, and filter-change reminders. Each shop's data is isolated (multi-tenant). All displayed data in UPPERCASE. WhatsApp sharing via `wa.me` links (manual send).

## Tech & Design

- **Stack:** TanStack Start + Lovable Cloud (Supabase) for auth, DB, RLS.
- **Design:** Dark SaaS, bento grid dashboard, glassmorphism cards, aurora hero gradient, Inter font, Lucide icons, Framer Motion animations, Recharts (TradingView-styled) for reports.
- **Invoice:** Client-side PDF via `jspdf` + `html2canvas`; print + save + WhatsApp share button.

## Auth (Lovable Cloud)

- Sign up → creates `shops` row + links user as owner.
- Login page: email + password, eye toggle on password, "Forgot password?" link.
- `/reset-password` route for recovery.
- Every table scoped by `shop_id`; RLS enforces `shop_id ∈ user's shops`.

## Database Schema

```text
shops(id, name, logo_url, contact, email, gst, address, created_at)
shop_members(shop_id, user_id, role)          -- links auth.users → shop
products(id, shop_id, model, category[machine|filter|spare], product_type, qty, price, created_at)
sales(id, shop_id, source[stock|manual|office], product_id?, product_name, qty, price,
      customer_name?, phone?, address?, sale_date, created_at)
services(id, shop_id, customer_name, phone, service_type, technician_id?, address,
         service_date, next_service_date?, is_filter_change, created_at)
service_items(id, service_id, product_name, price)
technicians(id, shop_id, name, phone, specialization)
emi_plans(id, shop_id, customer_name, phone, model, total, down_payment, tenure_months, start_date)
customers(id, shop_id, name, phone, address)  -- derived history view
```

- Security-definer `user_belongs_to_shop(uid, shop_id)` for RLS (avoids recursion).
- GRANTs to `authenticated`; RLS enabled on every table.
- Trigger: on sale from stock → decrement `products.qty`.
- Trigger: on service where `is_filter_change=true` → set `next_service_date = service_date + 3 months`.
- Storage bucket `shop-logos` (public) for logos.

## Pages / Routes

```text
/auth              login + signup + forgot password (public)
/reset-password    recovery form (public)
/_authenticated/
  dashboard        bento grid: KPIs, sales chart, low-stock, filter reminders due
  stock            product list + add/edit form, low-stock badge
  sales            tabs: from-stock | manual | office; entry forms + table
  service          create service (multi-item), list, mark done
  technicians      CRUD
  emi              CRUD list + detail
  reports          daily/monthly sales & service charts, remaining stock
  customers        history + services per customer
  invoice/$id      printable invoice (shop details, items, totals) + Print / Save PDF / WhatsApp
  settings         shop profile (logo upload, contact, email, GST, address)
```

Root `/` = marketing landing with sign-in CTA (redirects to `/dashboard` if signed in).

## Feature Details

- **Stock:** add/edit product; category + product_type; qty updated by sales trigger; manual +/- adjust.
- **Sales:** three entry modes as tabs; from-stock uses product picker + auto-decrement; manual/office are free-form.
- **Service:** dynamic item rows (add another product/price); optional technician; auto next_service_date for filter changes.
- **EMI:** stores plan; dashboard shows active plans; monthly EMI computed = (total − down) / tenure.
- **Reports:** date range filter, daily & monthly aggregates, service counts, stock remaining table, CSV export.
- **Dashboard bento tiles:** Today's sales · Month sales · Low stock count · Filter reminders due (next 30 days) · Sales trend chart · Recent services · Active EMIs.
- **Filter reminders:** query `services where is_filter_change and next_service_date <= today+30d`; each row has a "Send WhatsApp reminder" button → opens `wa.me/<phone>?text=...` prefilled reminder.
- **Invoice:** renders shop header (logo, name, GST, address, contact) + itemized table + totals in UPPERCASE; Print (window.print with print CSS), Save PDF (jspdf), WhatsApp share (wa.me link with invoice summary text).
- **UPPERCASE rendering:** global CSS `text-transform: uppercase` on data cells + `.toUpperCase()` on invoice text output.
- **Customer history:** grouped by phone; shows past sales + services; auto-created on first sale/service with phone.

## Technical Notes

- Server functions (`createServerFn` + `requireSupabaseAuth`) for all writes; RLS as user.
- `shop_id` derived server-side from `shop_members` (never trusted from client input).
- Charts: Recharts with dark theme + gradient fills.
- Framer Motion for card enter/hover; glass = `bg-white/5 backdrop-blur-xl border-white/10`.
- Design tokens (aurora gradient, glass surfaces, chart palette) added to `src/styles.css` as semantic tokens — no hardcoded colors in components.
- Automatic WhatsApp sending is **out of scope** (would need Twilio/Meta paid API); only manual `wa.me` links.

## Build Order

1. Enable Lovable Cloud, migration for schema + RLS + triggers + storage bucket.
2. Design tokens + shell layout (sidebar + topbar, glass, aurora).
3. Auth pages (login/signup/forgot/reset) + shop provisioning on signup.
4. Shop profile / settings + logo upload.
5. Products (stock) CRUD.
6. Technicians CRUD.
7. Sales (3 modes) + stock decrement trigger integration.
8. Services (multi-item) + next_service_date logic.
9. EMI CRUD.
10. Customers history view.
11. Dashboard bento + filter reminders.
12. Reports (charts + CSV).
13. Invoice page + PDF/print/WhatsApp.
14. Landing page at `/` + head metadata across routes.
