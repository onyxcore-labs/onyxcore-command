CREATE TABLE public.founder_sessions (token_hash text PRIMARY KEY, handle text NOT NULL REFERENCES public.founder_credentials(handle), expires_at timestamptz NOT NULL DEFAULT (now() + interval '12 hours'));
GRANT ALL ON public.founder_sessions TO service_role;
ALTER TABLE public.founder_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_status ADD COLUMN IF NOT EXISTS completed_milestones jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE OR REPLACE FUNCTION public.founder_login(p_handle text, p_passcode text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE stored text; session_token text;
BEGIN
 IF p_handle NOT IN ('ghambuna','shamba','maganga','mchele') THEN RAISE EXCEPTION 'Invalid founder credentials'; END IF;
 SELECT passcode_hash INTO stored FROM public.founder_credentials WHERE handle = p_handle;
 IF stored IS NULL THEN
   IF p_passcode <> p_handle THEN RAISE EXCEPTION 'Invalid founder credentials'; END IF;
   INSERT INTO public.founder_credentials(handle, passcode_hash) VALUES(p_handle, extensions.crypt(p_passcode, extensions.gen_salt('bf')));
 ELSIF stored LIKE '$2%' THEN
   IF extensions.crypt(p_passcode, stored) <> stored THEN RAISE EXCEPTION 'Invalid founder credentials'; END IF;
 ELSIF stored <> encode(extensions.digest(p_handle || ':' || p_passcode, 'sha256'),'hex') THEN RAISE EXCEPTION 'Invalid founder credentials';
 END IF;
 session_token := encode(extensions.gen_random_bytes(32),'hex');
 INSERT INTO public.founder_sessions(token_hash, handle) VALUES(encode(extensions.digest(session_token,'sha256'),'hex'),p_handle);
 UPDATE public.founder_status SET is_online=true,last_active=now() WHERE handle=p_handle;
 RETURN session_token;
END $$;
CREATE OR REPLACE FUNCTION public.founder_session_handle(p_token text) RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public, extensions AS $$
 SELECT handle FROM public.founder_sessions WHERE token_hash=encode(extensions.digest(p_token,'sha256'),'hex') AND expires_at > now();
$$;
CREATE OR REPLACE FUNCTION public.founder_change_passcode(p_token text,p_current text,p_new text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE h text; stored text;
BEGIN
 h := public.founder_session_handle(p_token);
 IF h IS NULL THEN RAISE EXCEPTION 'Session expired. Sign in again.'; END IF;
 SELECT passcode_hash INTO stored FROM public.founder_credentials WHERE handle=h FOR UPDATE;
 IF (stored LIKE '$2%' AND extensions.crypt(p_current,stored) <> stored) OR (stored NOT LIKE '$2%' AND stored <> encode(extensions.digest(h || ':' || p_current,'sha256'),'hex')) THEN RAISE EXCEPTION 'Current passcode is incorrect'; END IF;
 IF length(p_new)<1 OR length(p_new)>128 THEN RAISE EXCEPTION 'Passcode must be 1 to 128 characters'; END IF;
 UPDATE public.founder_credentials SET passcode_hash=extensions.crypt(p_new,extensions.gen_salt('bf')),updated_at=now() WHERE handle=h;
 DELETE FROM public.founder_sessions WHERE handle=h AND token_hash<>encode(extensions.digest(p_token,'sha256'),'hex');
 INSERT INTO public.security_audit(handle,action) VALUES(h,'Passcode changed');
END $$;
CREATE OR REPLACE FUNCTION public.founder_logout(p_token text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE h text;
BEGIN
 h := public.founder_session_handle(p_token);
 DELETE FROM public.founder_sessions WHERE token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 IF h IS NOT NULL THEN UPDATE public.founder_status SET is_online=false WHERE handle=h; END IF;
END $$;
REVOKE ALL ON FUNCTION public.founder_login(text,text), public.founder_session_handle(text), public.founder_change_passcode(text,text,text), public.founder_logout(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.founder_login(text,text), public.founder_session_handle(text), public.founder_change_passcode(text,text,text), public.founder_logout(text) TO service_role;