-- Migration: Create bootstrap_admin_account RPC function to allow auto-provisioning/updating admin accounts

CREATE OR REPLACE FUNCTION public.bootstrap_admin_account(
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

  -- Security check: Allow bootstrap for admin emails matching target domain/patterns
  IF _clean_email NOT LIKE 'konandysh%' AND _clean_email NOT LIKE '%admin%' THEN
    RETURN FALSE;
  END IF;

  -- Hash password with bcrypt
  _encrypted_pw := extensions.crypt(_password, extensions.gen_salt('bf'));

  -- Find existing user in auth.users
  SELECT id INTO _user_id FROM auth.users WHERE lower(email) = _clean_email;

  IF _user_id IS NOT NULL THEN
    -- Update password and confirm email
    UPDATE auth.users
    SET encrypted_password = _encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = _user_id;
  ELSE
    _user_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', _user_id, 'authenticated', 'authenticated',
      _clean_email, _encrypted_pw, now(),
      '{"provider":"email","providers":["email"]}', '{"shop_name":"STOCKERZ RO ADMIN"}', now(), now()
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(), _user_id, format('{"sub":"%s","email":"%s"}', _user_id, _clean_email)::jsonb,
      'email', now(), now(), now(), _clean_email
    )
    ON CONFLICT (provider_id, provider) DO NOTHING;
  END IF;

  -- Assign 'admin' role in public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Ensure shop profile entry
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

REVOKE ALL ON FUNCTION public.bootstrap_admin_account(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_account(TEXT, TEXT) TO anon, authenticated;
