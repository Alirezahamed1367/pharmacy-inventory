-- Migration: Ensure default admin user (not superadmin) exists
-- تاریخ: 2025-10-04
-- Creates an admin user with a default password if it does not already exist.
-- NOTE: Password: Admin@123 (bcrypt hash pre-generated)

DO $$
DECLARE
  existing uuid;
BEGIN
  SELECT id INTO existing FROM public.users WHERE username = 'admin' LIMIT 1;
  IF existing IS NULL THEN
    INSERT INTO public.users (username, password_hash, full_name, role, is_active)
    VALUES ('admin', '$2a$10$JoaGk0O/KOEx4lI1q8vZ3O4Ehv8H8J8VhVBAc5bkcqwR6Gms6cF/2', 'System Admin', 'admin', true);
  END IF;
END $$;

SELECT '✅ Default admin user ensured' AS status;
