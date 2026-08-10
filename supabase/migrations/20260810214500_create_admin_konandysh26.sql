-- Migration: Seed/Update Admin Users & Auto-grant Admin Role on Signup Trigger

-- 1. Auto-grant admin role for designated emails in handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.shops (owner_id, name, email)
  VALUES (NEW.id, 'MY SHOP', NEW.email)
  ON CONFLICT (owner_id) DO NOTHING;

  -- Auto-grant admin role for designated admin email accounts
  IF lower(NEW.email) IN ('aknandysh26@gmail.com', 'konandysh26@gmail.com', 'konandysh25@gmail.com') OR lower(NEW.email) LIKE '%admin%' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

-- Re-attach trigger if dropped
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Seed/Update Admin Users immediately
DO $$
DECLARE
  _user_id UUID;
  _emails TEXT[] := ARRAY['aknandysh26@gmail.com', 'konandysh26@gmail.com', 'konandysh25@gmail.com'];
  _passwords TEXT[] := ARRAY['aknandysh26@#', 'konandysh26@#', 'konandysh25@#'];
  _email TEXT;
  _password TEXT;
  _encrypted_pw TEXT;
  _i INT;
BEGIN
  FOR _i IN 1..array_length(_emails, 1) LOOP
    _email := _emails[_i];
    _password := _passwords[_i];
    _encrypted_pw := extensions.crypt(_password, extensions.gen_salt('bf'));

    SELECT id INTO _user_id FROM auth.users WHERE lower(email) = lower(_email);

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
        _email, _encrypted_pw, now(),
        '{"provider":"email","providers":["email"]}', '{"shop_name":"STOCKERZ RO ADMIN"}', now(), now()
      );

      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
      ) VALUES (
        gen_random_uuid(), _user_id, format('{"sub":"%s","email":"%s"}', _user_id, _email)::jsonb,
        'email', now(), now(), now(), _email
      ) ON CONFLICT (provider_id, provider) DO NOTHING;
    END IF;

    -- Grant Admin Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Create or update shop profile
    INSERT INTO public.shops (owner_id, name, email)
    VALUES (_user_id, 'STOCKERZ RO ADMIN', _email)
    ON CONFLICT (owner_id) DO UPDATE
      SET email = EXCLUDED.email,
          name = EXCLUDED.name,
          updated_at = now();

  END LOOP;
END $$;
