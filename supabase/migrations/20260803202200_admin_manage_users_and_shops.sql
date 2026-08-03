-- Admin RPC functions for shop user deletion and adding/updating existing shops

-- 1. RPC: Delete Shop and User from auth.users
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

  -- Delete auth user if found
  IF _owner_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = _owner_id;
  END IF;
END; $$;

REVOKE ALL ON FUNCTION public.delete_shop_and_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_shop_and_user(UUID) TO authenticated;

-- 2. RPC: Admin Create or Link Existing Shop
CREATE OR REPLACE FUNCTION public.admin_create_shop(
  _name TEXT,
  _email TEXT,
  _password TEXT DEFAULT 'password123',
  _contact TEXT DEFAULT NULL,
  _gst TEXT DEFAULT NULL,
  _address TEXT DEFAULT NULL,
  _logo_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  _new_user_id UUID := gen_random_uuid();
  _existing_user_id UUID;
  _new_shop_id UUID;
  _pass TEXT := COALESCE(NULLIF(_password, ''), 'password123');
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only admins can create shop accounts.';
  END IF;

  IF _email IS NULL OR _email = '' THEN
    RAISE EXCEPTION 'Shop email is required.';
  END IF;

  -- Check if user already exists in auth.users
  SELECT id INTO _existing_user_id FROM auth.users WHERE email = _email;

  IF _existing_user_id IS NOT NULL THEN
    -- User exists! Update password if provided
    IF _pass IS NOT NULL AND length(_pass) >= 6 THEN
      UPDATE auth.users
      SET encrypted_password = extensions.crypt(_pass, extensions.gen_salt('bf'))
      WHERE id = _existing_user_id;
    END IF;

    -- Check if shop already exists for this user
    SELECT id INTO _new_shop_id FROM public.shops WHERE owner_id = _existing_user_id;
    IF _new_shop_id IS NOT NULL THEN
      -- Update existing shop details
      UPDATE public.shops
      SET name = _name,
          email = _email,
          contact = COALESCE(_contact, contact),
          gst = COALESCE(_gst, gst),
          address = COALESCE(_address, address),
          logo_url = COALESCE(_logo_url, logo_url),
          updated_at = now()
      WHERE id = _new_shop_id;
      RETURN _new_shop_id;
    ELSE
      -- Insert shop for existing user
      INSERT INTO public.shops (owner_id, name, email, contact, gst, address, logo_url)
      VALUES (_existing_user_id, _name, _email, _contact, _gst, _address, _logo_url)
      RETURNING id INTO _new_shop_id;
      RETURN _new_shop_id;
    END IF;
  ELSE
    -- Create new user in auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', _new_user_id, 'authenticated', 'authenticated',
      _email, extensions.crypt(_pass, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(), _new_user_id, format('{"sub":"%s","email":"%s"}', _new_user_id, _email)::jsonb,
      'email', now(), now(), now(), _email
    );

    -- Insert new shop
    INSERT INTO public.shops (owner_id, name, email, contact, gst, address, logo_url)
    VALUES (_new_user_id, _name, _email, _contact, _gst, _address, _logo_url)
    ON CONFLICT (owner_id) DO UPDATE
      SET name = EXCLUDED.name,
          email = EXCLUDED.email,
          contact = EXCLUDED.contact,
          gst = EXCLUDED.gst,
          address = EXCLUDED.address,
          logo_url = EXCLUDED.logo_url
    RETURNING id INTO _new_shop_id;

    RETURN _new_shop_id;
  END IF;
END; $$;

REVOKE ALL ON FUNCTION public.admin_create_shop(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_shop(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
