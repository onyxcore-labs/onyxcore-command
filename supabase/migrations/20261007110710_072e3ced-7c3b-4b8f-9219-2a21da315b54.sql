CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.founder_credentials (handle text PRIMARY KEY, passcode_hash text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.founder_credentials TO service_role;
ALTER TABLE public.founder_credentials ENABLE ROW LEVEL SECURITY;

INSERT INTO public.founder_credentials (handle, passcode_hash)
SELECT h, encode(extensions.digest(h || ':' || h, 'sha256'), 'hex') FROM unnest(ARRAY['ghambuna','shamba','maganga','mchele']) AS h;

CREATE TABLE public.security_audit (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), handle text NOT NULL, action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.security_audit TO anon, authenticated;
GRANT ALL ON public.security_audit TO service_role;
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team read" ON public.security_audit FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.project_ideas ADD COLUMN category text NOT NULL DEFAULT 'Hardware / IoT';