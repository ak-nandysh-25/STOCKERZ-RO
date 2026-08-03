-- ========================================================
-- STOCKERZ RO — Complete Supabase Master Database Schema
-- Run this script in Supabase Dashboard -> SQL Editor
-- to create all required tables, triggers, and RLS security policies.
-- ========================================================

-- 1. ENUMS & ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Helper function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- 3. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'MY SHOP',
  logo_url TEXT,
  contact TEXT,
  email TEXT,
  gst TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shops TO authenticated;
GRANT ALL ON public.shops TO service_role;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own shop rw" ON public.shops;
CREATE POLICY "own shop rw" ON public.shops FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins full access on shops" ON public.shops;
CREATE POLICY "Admins full access on shops" ON public.shops FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Helper function: current_shop_id
CREATE OR REPLACE FUNCTION public.current_shop_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT id FROM public.shops WHERE owner_id = auth.uid() LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_shop_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_shop_id() TO authenticated;

-- Auto-create shop on user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.shops (owner_id, name, email)
  VALUES (NEW.id, 'MY SHOP', NEW.email)
  ON CONFLICT (owner_id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 4. PRODUCTS TABLE (Inventory)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('machine','filter','spare')),
  product_type TEXT,
  qty INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop products" ON public.products;
CREATE POLICY "shop products" ON public.products FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

DROP POLICY IF EXISTS "Admins full access on products" ON public.products;
CREATE POLICY "Admins full access on products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. TECHNICIANS TABLE
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.technicians TO authenticated;
GRANT ALL ON public.technicians TO service_role;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop techs" ON public.technicians;
CREATE POLICY "shop techs" ON public.technicians FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

DROP POLICY IF EXISTS "Admins full access on technicians" ON public.technicians;
CREATE POLICY "Admins full access on technicians" ON public.technicians FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('stock','manual','office')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_type TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop sales" ON public.sales;
CREATE POLICY "shop sales" ON public.sales FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

DROP POLICY IF EXISTS "Admins full access on sales" ON public.sales;
CREATE POLICY "Admins full access on sales" ON public.sales FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger: decrement stock on sale
CREATE OR REPLACE FUNCTION public.decrement_stock_on_sale()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.source = 'stock' AND NEW.product_id IS NOT NULL THEN
    UPDATE public.products SET qty = GREATEST(qty - NEW.qty, 0) WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS sales_decrement_stock ON public.sales;
CREATE TRIGGER sales_decrement_stock AFTER INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_sale();

REVOKE ALL ON FUNCTION public.decrement_stock_on_sale() FROM PUBLIC, anon, authenticated;

-- 7. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone TEXT,
  service_type TEXT NOT NULL,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  address TEXT,
  is_filter_change BOOLEAN NOT NULL DEFAULT false,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_service_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop services" ON public.services;
CREATE POLICY "shop services" ON public.services FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

DROP POLICY IF EXISTS "Admins full access on services" ON public.services;
CREATE POLICY "Admins full access on services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger: auto-set 90-day next filter service date
CREATE OR REPLACE FUNCTION public.set_next_service_date()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.is_filter_change AND NEW.next_service_date IS NULL THEN
    NEW.next_service_date := NEW.service_date + INTERVAL '3 months';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS services_next_date ON public.services;
CREATE TRIGGER services_next_date BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_next_service_date();

REVOKE ALL ON FUNCTION public.set_next_service_date() FROM PUBLIC, anon, authenticated;

-- 8. SERVICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_items TO authenticated;
GRANT ALL ON public.service_items TO service_role;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop service items" ON public.service_items;
CREATE POLICY "shop service items" ON public.service_items FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

DROP POLICY IF EXISTS "Admins full access on service_items" ON public.service_items;
CREATE POLICY "Admins full access on service_items" ON public.service_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. EMI PLANS TABLE
CREATE TABLE IF NOT EXISTS public.emi_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone TEXT,
  model TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  down_payment NUMERIC(12,2) NOT NULL DEFAULT 0,
  tenure_months INTEGER NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emi_plans TO authenticated;
GRANT ALL ON public.emi_plans TO service_role;
ALTER TABLE public.emi_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop emi" ON public.emi_plans;
CREATE POLICY "shop emi" ON public.emi_plans FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

DROP POLICY IF EXISTS "Admins full access on emi_plans" ON public.emi_plans;
CREATE POLICY "Admins full access on emi_plans" ON public.emi_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
