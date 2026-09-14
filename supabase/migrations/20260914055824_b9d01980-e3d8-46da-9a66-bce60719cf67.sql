ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discounted_price numeric;

ALTER TABLE public.products
  ADD CONSTRAINT products_discounted_price_check
  CHECK (
    discounted_price IS NULL
    OR (discounted_price >= 0 AND (price IS NULL OR discounted_price <= price))
  );

CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image text NOT NULL,
  title text,
  description text,
  button_text text,
  button_link text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active banners" ON public.banners
  FOR SELECT TO anon, authenticated USING (active);

CREATE POLICY "admins manage banners" ON public.banners
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS banners_order_idx ON public.banners (active, display_order);
CREATE INDEX IF NOT EXISTS whatsapp_enquiries_created_idx ON public.whatsapp_enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS whatsapp_enquiries_visitor_idx ON public.whatsapp_enquiries (visitor_id);