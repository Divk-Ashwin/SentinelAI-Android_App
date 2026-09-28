CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  phone TEXT,
  display_name TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE TABLE public.blocked_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  phone TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_numbers TO authenticated;
GRANT ALL ON public.blocked_numbers TO service_role;
ALTER TABLE public.blocked_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own blocked" ON public.blocked_numbers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.starred_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  kind TEXT NOT NULL CHECK (kind IN ('conversation','message')),
  chat_id TEXT NOT NULL,
  message_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, chat_id, message_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.starred_items TO authenticated;
GRANT ALL ON public.starred_items TO service_role;
ALTER TABLE public.starred_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own starred" ON public.starred_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  sender TEXT NOT NULL,
  message_text TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.scam_reports TO authenticated;
GRANT ALL ON public.scam_reports TO service_role;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports select" ON public.scam_reports FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own reports insert" ON public.scam_reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own reports delete" ON public.scam_reports FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Tracks OTP send attempts for basic abuse limiting (service role only).
CREATE TABLE public.otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.otp_attempts TO service_role;
ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX otp_attempts_phone_idx ON public.otp_attempts (phone, created_at);