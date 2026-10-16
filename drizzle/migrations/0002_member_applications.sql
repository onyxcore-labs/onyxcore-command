CREATE TABLE public.member_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  email text NOT NULL,
  passcode_hash text NOT NULL,
  auth_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  decided_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.member_applications TO service_role;
ALTER TABLE public.member_applications ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX member_applications_pending_handle ON public.member_applications(handle) WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.member_apply(p_handle text, p_name text, p_role text, p_email text, p_passcode text, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions' AS $$
BEGIN
  IF p_handle !~ '^[a-z][a-z0-9_]{2,23}$' THEN RAISE EXCEPTION 'Handle must be 3-24 lowercase letters, numbers or _'; END IF;
  IF EXISTS (SELECT 1 FROM public.founder_status WHERE handle = p_handle) OR p_handle IN ('ghambuna','shamba','maganga','mchele') THEN RAISE EXCEPTION 'That handle is already taken'; END IF;
  IF EXISTS (SELECT 1 FROM public.member_applications WHERE status='pending' AND (handle=p_handle OR lower(email)=lower(p_email))) THEN RAISE EXCEPTION 'A request with that handle or email is already pending'; END IF;
  IF length(p_passcode) < 6 OR length(p_passcode) > 128 THEN RAISE EXCEPTION 'Passcode must be 6 to 128 characters'; END IF;
  INSERT INTO public.member_applications(handle, full_name, role, email, passcode_hash, auth_user_id)
  VALUES (p_handle, p_name, p_role, lower(p_email), extensions.crypt(p_passcode, extensions.gen_salt('bf')), p_user_id);
END $$;

CREATE OR REPLACE FUNCTION public.member_pending(p_token text)
RETURNS TABLE(id uuid, handle text, full_name text, role text, email text, verified boolean, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions' AS $$
BEGIN
  IF public.founder_session_handle(p_token) IS NULL THEN RAISE EXCEPTION 'Session expired. Sign in again.'; END IF;
  RETURN QUERY SELECT a.id, a.handle, a.full_name, a.role, a.email, (u.email_confirmed_at IS NOT NULL), a.created_at
  FROM public.member_applications a LEFT JOIN auth.users u ON u.id = a.auth_user_id
  WHERE a.status = 'pending' ORDER BY a.created_at;
END $$;

CREATE OR REPLACE FUNCTION public.member_decide(p_token text, p_id uuid, p_approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions' AS $$
DECLARE h text; a public.member_applications%ROWTYPE; confirmed timestamptz;
BEGIN
  h := public.founder_session_handle(p_token);
  IF h IS NULL THEN RAISE EXCEPTION 'Session expired. Sign in again.'; END IF;
  SELECT * INTO a FROM public.member_applications WHERE id = p_id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF p_approve THEN
    SELECT email_confirmed_at INTO confirmed FROM auth.users WHERE id = a.auth_user_id;
    IF confirmed IS NULL THEN RAISE EXCEPTION 'This person has not verified their email yet'; END IF;
    IF EXISTS (SELECT 1 FROM public.founder_status WHERE handle = a.handle) THEN RAISE EXCEPTION 'That handle is already taken'; END IF;
    INSERT INTO public.founder_status(handle, full_name, role) VALUES (a.handle, a.full_name, a.role);
    INSERT INTO public.founder_credentials(handle, passcode_hash) VALUES (a.handle, a.passcode_hash);
  END IF;
  UPDATE public.member_applications SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END, decided_by = h WHERE id = p_id;
  INSERT INTO public.security_audit(handle, action) VALUES (h, CASE WHEN p_approve THEN 'Approved member @' ELSE 'Rejected member @' END || a.handle);
END $$;

CREATE OR REPLACE FUNCTION public.founder_login(p_handle text, p_passcode text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions'
AS $function$
DECLARE stored text; session_token text;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.founder_status WHERE handle = p_handle) THEN RAISE EXCEPTION 'Invalid founder credentials'; END IF;
 SELECT passcode_hash INTO stored FROM public.founder_credentials WHERE handle = p_handle;
 IF stored IS NULL THEN
   IF p_handle NOT IN ('ghambuna','shamba','maganga','mchele') OR p_passcode <> p_handle THEN RAISE EXCEPTION 'Invalid founder credentials'; END IF;
   INSERT INTO public.founder_credentials(handle, passcode_hash) VALUES(p_handle, extensions.crypt(p_passcode, extensions.gen_salt('bf')));
 ELSIF stored LIKE '$2%' THEN
   IF extensions.crypt(p_passcode, stored) <> stored THEN RAISE EXCEPTION 'Invalid founder credentials'; END IF;
 ELSIF stored <> encode(extensions.digest(p_handle || ':' || p_passcode, 'sha256'),'hex') THEN RAISE EXCEPTION 'Invalid founder credentials';
 END IF;
 session_token := encode(extensions.gen_random_bytes(32),'hex');
 INSERT INTO public.founder_sessions(token_hash, handle) VALUES(encode(extensions.digest(session_token,'sha256'),'hex'),p_handle);
 UPDATE public.founder_status SET is_online=true,last_active=now() WHERE handle=p_handle;
 RETURN session_token;
END $function$;

REVOKE ALL ON FUNCTION public.member_apply(text,text,text,text,text,uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.member_pending(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.member_decide(text,uuid,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.member_apply(text,text,text,text,text,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.member_pending(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.member_decide(text,uuid,boolean) TO service_role;