DROP POLICY "public read active categories" ON public.categories;
CREATE POLICY "public read active categories" ON public.categories FOR SELECT TO anon, authenticated USING (active);
DROP POLICY "public read active products" ON public.products;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (active);

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated, service_role;