
-- SHOPS: one shop per owner
CREATE TABLE public.shops (
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
CREATE POLICY "own shop rw" ON public.shops FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- helper: current user's shop id
CREATE OR REPLACE FUNCTION public.current_shop_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT id FROM public.shops WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- auto-create shop on signup
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

-- PRODUCTS
CREATE TABLE public.products (
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
CREATE POLICY "shop products" ON public.products FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

-- TECHNICIANS
CREATE TABLE public.technicians (
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
CREATE POLICY "shop techs" ON public.technicians FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

-- SALES
CREATE TABLE public.sales (
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
CREATE POLICY "shop sales" ON public.sales FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

-- decrement stock on stock-source sale
CREATE OR REPLACE FUNCTION public.decrement_stock_on_sale()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.source = 'stock' AND NEW.product_id IS NOT NULL THEN
    UPDATE public.products SET qty = GREATEST(qty - NEW.qty, 0) WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER sales_decrement_stock AFTER INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_sale();

-- SERVICES
CREATE TABLE public.services (
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
CREATE POLICY "shop services" ON public.services FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

CREATE OR REPLACE FUNCTION public.set_next_service_date()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.is_filter_change AND NEW.next_service_date IS NULL THEN
    NEW.next_service_date := NEW.service_date + INTERVAL '3 months';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER services_next_date BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_next_service_date();

-- SERVICE ITEMS
CREATE TABLE public.service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_items TO authenticated;
GRANT ALL ON public.service_items TO service_role;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop service items" ON public.service_items FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());

-- EMI PLANS
CREATE TABLE public.emi_plans (
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
CREATE POLICY "shop emi" ON public.emi_plans FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id()) WITH CHECK (shop_id = public.current_shop_id());
