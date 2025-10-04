-- ایجاد جداول کنترل دسترسی مبتنی بر گروه
-- تاریخ: 2025-10-04
-- نویسنده: علیرضا حامد (طراحی و توسعه)

-- 1. جدول گروه‌های دسترسی
CREATE TABLE IF NOT EXISTS public.access_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.access_groups IS 'گروه‌های دسترسی که مجموعه‌ای از مجوزها و انبارها را تعریف می‌کنند';

-- 2. مجوزهای هر گروه
CREATE TABLE IF NOT EXISTS public.access_group_permissions (
  group_id UUID REFERENCES public.access_groups(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  PRIMARY KEY (group_id, permission_key)
);
COMMENT ON TABLE public.access_group_permissions IS 'کلیدهای مجوز ثبت‌شده برای هر گروه';

-- 3. انبارهای مجاز هر گروه
CREATE TABLE IF NOT EXISTS public.access_group_warehouses (
  group_id UUID REFERENCES public.access_groups(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, warehouse_id)
);
COMMENT ON TABLE public.access_group_warehouses IS 'انبارهای مجاز برای هر گروه دسترسی';

-- 4. انتساب گروه به کاربران
CREATE TABLE IF NOT EXISTS public.user_access_groups (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.access_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, group_id)
);
COMMENT ON TABLE public.user_access_groups IS 'گروه‌های تخصیص یافته به هر کاربر (اتحاد مجوزها)';

-- Seed اولیه گروه‌های سیستم در صورت نبود
DO $$
DECLARE
  sid UUID;
  wid UUID;
BEGIN
  -- مدیر کل سیستم
  SELECT id INTO sid FROM public.access_groups WHERE code = 'system_admin';
  IF sid IS NULL THEN
    INSERT INTO public.access_groups (name, code, description, is_system)
    VALUES ('مدیر کل سیستم','system_admin','دسترسی کامل به تمام بخش‌ها', true)
    RETURNING id INTO sid;
    -- مجوزهای کامل
    INSERT INTO public.access_group_permissions (group_id, permission_key)
    SELECT sid, perm FROM (
      VALUES
        ('view_dashboard'),('manage_drugs'),('manage_warehouses'),('view_inventory'),
        ('create_receipt'),('complete_receipt'),('create_transfer'),('complete_transfer'),
        ('manage_users'),('manage_roles'),('view_reports'),('sms_settings'),('system_settings')
    ) AS t(perm);
  END IF;

  -- مدیر انبار (گروه پایه)
  SELECT id INTO wid FROM public.access_groups WHERE code = 'warehouse_manager';
  IF wid IS NULL THEN
    INSERT INTO public.access_groups (name, code, description, is_system)
    VALUES ('مدیر انبار','warehouse_manager','مدیریت عملیات انبارهای مجاز', true)
    RETURNING id INTO wid;
    INSERT INTO public.access_group_permissions (group_id, permission_key)
    SELECT wid, perm FROM (
      VALUES
        ('view_dashboard'),('view_inventory'),('create_receipt'),('complete_receipt'),
        ('create_transfer'),('complete_transfer'),('manage_drugs')
    ) AS t(perm);
  END IF;
END $$;

SELECT '✅ Access control tables & seed applied' AS status;