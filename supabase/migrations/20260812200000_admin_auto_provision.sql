-- Create RPC function to automatically provision or update the system admin account safely

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.admin_ensure_account(_email text, _password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  _user_id uuid;
  _clean_email text := lower(trim(_email));
BEGIN
  -- Only allow execution for designated system admin email addresses
  IF _clean_email NOT IN ('konandysh26@gmail.com', 'aknandysh26@gmail.com') THEN
    RAISE EXCEPTION 'Access denied for email %', _clean_email;
  END IF;

  IF length(_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters.';
  END IF;

  -- Check if user exists in auth.users
  SELECT id INTO _user_id FROM auth.users WHERE lower(email) = _clean_email;

  IF _user_id IS NULL THEN
    _user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      _user_id,
      'authenticated',
      'authenticated',
      _clean_email,
      extensions.crypt(_password, extensions.gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      _user_id,
      format('{"sub":"%s","email":"%s"}', _user_id::text, _clean_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  ELSE
    -- Update password and confirm email for existing admin user
    UPDATE auth.users
    SET
      encrypted_password = extensions.crypt(_password, extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = _user_id;
  END IF;

  -- Assign admin role in public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END; $$;

-- Grant execution to anon (login page) and authenticated users
GRANT EXECUTE ON FUNCTION public.admin_ensure_account(text, text) TO anon, authenticated, service_role;
