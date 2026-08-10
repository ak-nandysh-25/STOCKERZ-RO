-- Migration: Remove all admin users from public.user_roles, public.shops, auth.identities, and auth.users

DO $$
DECLARE
  _rec RECORD;
BEGIN
  -- 1. Find and delete all admin users by user_roles
  FOR _rec IN 
    SELECT DISTINCT user_id 
    FROM public.user_roles 
    WHERE role = 'admin'
  LOOP
    DELETE FROM public.service_items WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.user_id);
    DELETE FROM public.services WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.user_id);
    DELETE FROM public.sales WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.user_id);
    DELETE FROM public.products WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.user_id);
    DELETE FROM public.emi_plans WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.user_id);
    DELETE FROM public.technicians WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.user_id);
    DELETE FROM public.shops WHERE owner_id = _rec.user_id;
    DELETE FROM public.user_roles WHERE user_id = _rec.user_id;
    DELETE FROM auth.identities WHERE user_id = _rec.user_id;
    DELETE FROM auth.users WHERE id = _rec.user_id;
  END LOOP;

  -- 2. Also cleanup any remaining admin emails
  FOR _rec IN 
    SELECT id 
    FROM auth.users 
    WHERE lower(email) IN ('aknandysh26@gmail.com', 'konandysh26@gmail.com', 'konandysh25@gmail.com') 
       OR lower(email) LIKE '%admin%'
  LOOP
    DELETE FROM public.service_items WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.id);
    DELETE FROM public.services WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.id);
    DELETE FROM public.sales WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.id);
    DELETE FROM public.products WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.id);
    DELETE FROM public.emi_plans WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.id);
    DELETE FROM public.technicians WHERE shop_id IN (SELECT id FROM public.shops WHERE owner_id = _rec.id);
    DELETE FROM public.shops WHERE owner_id = _rec.id;
    DELETE FROM public.user_roles WHERE user_id = _rec.id;
    DELETE FROM auth.identities WHERE user_id = _rec.id;
    DELETE FROM auth.users WHERE id = _rec.id;
  END LOOP;
END $$;
