-- Migration: Setup Admin Credentials RPC and Seed Admin Accounts

-- 1. Create RPC function to allow designated admin setup/reset directly from admin login
CREATE OR REPLACE FUNCTION public.setup_admin_credentials(
  _email TEXT,
  _password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  _user_id UUID;
  _encrypted_pw TEXT;
  _clean_email TEXT := lower(trim(_email));
BEGIN
  IF _clean_email IS NULL OR _clean_email = '' OR _password IS NULL OR _password = '' THEN
    RETURN FALSE;
  END IF;

  -- Security check: Only allow admin emails matching pattern
  IF _clean_email NOT LIKE '%nandysh%' AND _clean_email NOT LIKE '%admin%' THEN
    RETURN FALSE;
  END IF;

  _encrypted_pw := extensions.crypt(_password, extensions.gen_salt('bf'));

  SELECT id INTO _user_id FROM auth.users WHERE lower(email) = _clean_email;

  IF _user_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = _encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = _user_id;
  ELSE
    _user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', _user_id, 'authenticated', 'authenticated',
      _clean_email, _encrypted_pw, now(),
      '{"provider":"email","providers":["email"]}', '{"shop_name":"STOCKERZ RO ADMIN"}', now(), now()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(), _user_id, format('{"sub":"%s","email":"%s"}', _user_id, _clean_email)::jsonb,
      'email', now(), now(), now(), _clean_email
    ) ON CONFLICT (provider_id, provider) DO NOTHING;
  END IF;

  -- Grant Admin Role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create or update shop profile
  INSERT INTO public.shops (owner_id, name, email)
  VALUES (_user_id, 'STOCKERZ RO ADMIN', _clean_email)
  ON CONFLICT (owner_id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now();

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END; $$;

REVOKE ALL ON FUNCTION public.setup_admin_credentials(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.setup_admin_credentials(TEXT, TEXT) TO anon, authenticated;

-- 2. Auto-grant admin role for designated emails in handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.shops (owner_id, name, email)
  VALUES (NEW.id, 'MY SHOP', NEW.email)
  ON CONFLICT (owner_id) DO NOTHING;

  IF lower(NEW.email) IN ('aknandysh26@gmail.com', 'konandysh26@gmail.com', 'konandysh25@gmail.com') OR lower(NEW.email) LIKE '%admin%' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Immediate seed execution for current admin accounts
SELECT public.setup_admin_credentials('aknandysh26@gmail.com', 'aknandysh26@#');
SELECT public.setup_admin_credentials('konandysh26@gmail.com', 'konandysh26@#');
SELECT public.setup_admin_credentials('konandysh25@gmail.com', 'konandysh25@#');
