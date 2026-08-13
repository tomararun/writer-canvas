-- Lets the public sign-in page know whether the single admin seat is claimed,
-- so it can stop offering account creation. Exposes only a boolean — no user
-- data. (Also disable public sign-ups in the Supabase dashboard for defence
-- in depth; see DEPLOYMENT.md.)
CREATE OR REPLACE FUNCTION public.admin_seat_taken()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;

REVOKE ALL ON FUNCTION public.admin_seat_taken() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_seat_taken() TO anon, authenticated, service_role;
