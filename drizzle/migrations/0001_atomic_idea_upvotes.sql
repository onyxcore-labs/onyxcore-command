CREATE OR REPLACE FUNCTION public.upvote_project_idea(p_id uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$ UPDATE public.project_ideas SET upvotes = upvotes + 1 WHERE id = p_id; $$;
REVOKE ALL ON FUNCTION public.upvote_project_idea(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upvote_project_idea(uuid) TO anon, authenticated, service_role;