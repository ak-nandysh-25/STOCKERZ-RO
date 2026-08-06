-- 1. Create RPC function to purge all non-admin users and their shop data
CREATE OR REPLACE FUNCTION public.purge_non_admin_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _deleted_count INTEGER := 0;
  _non_admin_user RECORD;
  _shop RECORD;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only admins can purge non-admin user accounts.';
  END IF;

  -- Find and delete all non-admin users
  FOR _non_admin_user IN
    SELECT u.id, u.email
    FROM auth.users u
    WHERE u.id NOT IN (
      SELECT ur.user_id FROM public.user_roles ur WHERE ur.role = 'admin'
    )
  LOOP
    -- Delete all shops and child data associated with owner_id or email
    FOR _shop IN 
      SELECT id FROM public.shops WHERE owner_id = _non_admin_user.id OR email = _non_admin_user.email 
    LOOP
      DELETE FROM public.sales WHERE shop_id = _shop.id;
      DELETE FROM public.services WHERE shop_id = _shop.id;
      DELETE FROM public.service_items WHERE shop_id = _shop.id;
      DELETE FROM public.products WHERE shop_id = _shop.id;
      DELETE FROM public.emi_plans WHERE shop_id = _shop.id;
      DELETE FROM public.technicians WHERE shop_id = _shop.id;
      DELETE FROM public.shops WHERE id = _shop.id;
    END LOOP;

    -- Delete user auth records
    DELETE FROM auth.identities WHERE user_id = _non_admin_user.id;
    DELETE FROM auth.users WHERE id = _non_admin_user.id;
    _deleted_count := _deleted_count + 1;
  END LOOP;

  RETURN _deleted_count;
END; $$;

REVOKE ALL ON FUNCTION public.purge_non_admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purge_non_admin_users() TO authenticated;

-- 2. Execute one-time immediate purge of all non-admin users in Supabase
DO $$
DECLARE
  _r RECORD;
  _s RECORD;
BEGIN
  FOR _r IN
    SELECT u.id, u.email
    FROM auth.users u
    WHERE u.id NOT IN (
      SELECT ur.user_id FROM public.user_roles ur WHERE ur.role = 'admin'
    )
  LOOP
    -- Delete child data and shop
    FOR _s IN SELECT id FROM public.shops WHERE owner_id = _r.id OR email = _r.email LOOP
      DELETE FROM public.sales WHERE shop_id = _s.id;
      DELETE FROM public.services WHERE shop_id = _s.id;
      DELETE FROM public.service_items WHERE shop_id = _s.id;
      DELETE FROM public.products WHERE shop_id = _s.id;
      DELETE FROM public.emi_plans WHERE shop_id = _s.id;
      DELETE FROM public.technicians WHERE shop_id = _s.id;
      DELETE FROM public.shops WHERE id = _s.id;
    END LOOP;

    -- Delete auth user
    DELETE FROM auth.identities WHERE user_id = _r.id;
    DELETE FROM auth.users WHERE id = _r.id;
  END LOOP;
END; $$;
