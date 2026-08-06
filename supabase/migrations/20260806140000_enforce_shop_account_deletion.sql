-- Enforce shop deletion cascade to auth.users and auth.identities
CREATE OR REPLACE FUNCTION public.delete_shop_and_user(_shop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _owner_id UUID;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only admins can delete shop accounts.';
  END IF;

  -- Find shop owner_id
  SELECT owner_id INTO _owner_id FROM public.shops WHERE id = _shop_id;

  -- Delete shop and child records
  DELETE FROM public.sales WHERE shop_id = _shop_id;
  DELETE FROM public.services WHERE shop_id = _shop_id;
  DELETE FROM public.service_items WHERE shop_id = _shop_id;
  DELETE FROM public.products WHERE shop_id = _shop_id;
  DELETE FROM public.emi_plans WHERE shop_id = _shop_id;
  DELETE FROM public.technicians WHERE shop_id = _shop_id;
  DELETE FROM public.shops WHERE id = _shop_id;

  -- Delete auth user and identities if found
  IF _owner_id IS NOT NULL THEN
    DELETE FROM auth.identities WHERE user_id = _owner_id;
    DELETE FROM auth.users WHERE id = _owner_id;
  END IF;
END; $$;

REVOKE ALL ON FUNCTION public.delete_shop_and_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_shop_and_user(UUID) TO authenticated;
