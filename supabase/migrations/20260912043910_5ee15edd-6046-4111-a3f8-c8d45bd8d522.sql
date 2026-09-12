-- roles
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active categories" ON public.categories FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku text NOT NULL UNIQUE,
  description text,
  specifications text,
  price numeric(12,2),
  moq integer NOT NULL DEFAULT 1 CHECK (moq >= 1),
  stock_status text NOT NULL DEFAULT 'available' CHECK (stock_status IN ('available','stock_out')),
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- product images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage product images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- visitors
CREATE TABLE public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  first_visit timestamptz NOT NULL DEFAULT now(),
  last_visit timestamptz NOT NULL DEFAULT now(),
  visit_count integer NOT NULL DEFAULT 1
);
GRANT SELECT ON public.visitors TO authenticated;
GRANT ALL ON public.visitors TO service_role;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read visitors" ON public.visitors FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- whatsapp enquiries
CREATE TABLE public.whatsapp_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  enquiry_type text NOT NULL DEFAULT 'product',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.whatsapp_enquiries TO anon;
GRANT SELECT, INSERT ON public.whatsapp_enquiries TO authenticated;
GRANT ALL ON public.whatsapp_enquiries TO service_role;
ALTER TABLE public.whatsapp_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone log whatsapp enquiry" ON public.whatsapp_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read whatsapp enquiries" ON public.whatsapp_enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- bulk order inquiries
CREATE TABLE public.bulk_order_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text,
  product_sku text,
  company_name text,
  required_quantity integer NOT NULL CHECK (required_quantity >= 1),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_location text,
  message text,
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','In Progress','Completed','Cancelled')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bulk_order_inquiries TO anon;
GRANT SELECT, INSERT, UPDATE ON public.bulk_order_inquiries TO authenticated;
GRANT ALL ON public.bulk_order_inquiries TO service_role;
ALTER TABLE public.bulk_order_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submit bulk inquiry" ON public.bulk_order_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read bulk inquiries" ON public.bulk_order_inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update bulk inquiries" ON public.bulk_order_inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER bulk_inquiries_updated_at BEFORE UPDATE ON public.bulk_order_inquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- site settings (single row)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'ZUCUR MART',
  whatsapp_number text NOT NULL DEFAULT '919000000000',
  email text,
  phone text,
  address text,
  business_hours text,
  default_whatsapp_message text,
  currency text NOT NULL DEFAULT 'INR',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- visitor registration helper (public capture without exposing the visitor log)
CREATE OR REPLACE FUNCTION public.register_visitor(_name text, _phone text, _email text DEFAULT NULL, _visitor_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF _visitor_id IS NOT NULL THEN
    UPDATE public.visitors SET last_visit = now(), visit_count = visit_count + 1 WHERE id = _visitor_id RETURNING id INTO v_id;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END IF;
  IF _name IS NULL OR length(btrim(_name)) < 2 OR _phone IS NULL OR length(btrim(_phone)) < 6 THEN
    RAISE EXCEPTION 'Name and phone are required';
  END IF;
  SELECT id INTO v_id FROM public.visitors WHERE phone = btrim(_phone) LIMIT 1;
  IF v_id IS NOT NULL THEN
    UPDATE public.visitors SET last_visit = now(), visit_count = visit_count + 1, name = btrim(_name),
      email = COALESCE(NULLIF(btrim(COALESCE(_email,'')),''), email) WHERE id = v_id;
    RETURN v_id;
  END IF;
  INSERT INTO public.visitors (name, phone, email)
  VALUES (left(btrim(_name),100), left(btrim(_phone),30), NULLIF(left(btrim(COALESCE(_email,'')),150),''))
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.register_visitor(text,text,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_visitor(text,text,text,uuid) TO anon, authenticated, service_role;

-- seed settings
INSERT INTO public.site_settings (business_name, whatsapp_number, email, phone, address, business_hours, default_whatsapp_message, currency)
VALUES ('ZUCUR MART','919000000000','sales@zucurmart.com','+91 90000 00000','Plot 42, Wholesale Trade Centre, Andheri East, Mumbai 400059','Mon-Sat: 9:00 AM - 7:00 PM','Hello ZUCUR MART, I would like to enquire about wholesale pricing.','INR');

-- seed categories
INSERT INTO public.categories (id, name, slug, description, image, display_order) VALUES
('11111111-1111-4111-8111-000000000001','Packaging Materials','packaging-materials','Corrugated boxes, tapes, stretch film and protective packaging for bulk dispatch.','https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=1200&q=80',1),
('11111111-1111-4111-8111-000000000002','Cleaning & Hygiene','cleaning-hygiene','Industrial floor cleaners, detergents, sanitizers and janitorial supplies.','https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80',2),
('11111111-1111-4111-8111-000000000003','Disposables','disposables','Paper cups, food containers, cutlery and takeaway packaging in wholesale cartons.','https://images.unsplash.com/photo-1595570184127-4d0a5b7c2a0c?auto=format&fit=crop&w=1200&q=80',3),
('11111111-1111-4111-8111-000000000004','Office & Stationery','office-stationery','Copier paper, files, pens and office consumables for corporate supply.','https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80',4),
('11111111-1111-4111-8111-000000000005','Kitchenware & HoReCa','kitchenware-horeca','Stainless steel kitchen tools, containers and hotel-grade tableware.','https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',5),
('11111111-1111-4111-8111-000000000006','Personal Care','personal-care','Bulk soaps, handwash, tissues and amenity kits for hospitality buyers.','https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=1200&q=80',6);

-- seed products
INSERT INTO public.products (id, category_id, name, slug, sku, description, specifications, price, moq, stock_status, featured) VALUES
('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000001','5-Ply Corrugated Shipping Box (18x12x10 in)','corrugated-box-18x12x10','ZM-PKG-1001','Heavy-duty 5-ply corrugated carton engineered for e-commerce and export dispatch. Supplied flat in bundles of 25.','Material: 5-ply kraft corrugated | Bursting strength: 16 kg/cm2 | Size: 18 x 12 x 10 inch | Pack: bundle of 25 | Colour: natural brown',68.00,100,'available',true),
('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-000000000001','BOPP Self-Adhesive Packing Tape 48mm x 65m','bopp-packing-tape-48mm','ZM-PKG-1002','Clear high-tack BOPP tape with consistent adhesion for carton sealing lines.','Width: 48 mm | Length: 65 m | Thickness: 45 micron | Pack: 6 rolls per shrink | Adhesive: acrylic',34.50,144,'available',true),
('22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-000000000001','Stretch Wrap Pallet Film 500mm (2.5 kg Roll)','stretch-wrap-film-500mm','ZM-PKG-1003','Machine-grade stretch film with 250% elongation for secure pallet containment.','Width: 500 mm | Roll weight: 2.5 kg | Thickness: 23 micron | Elongation: 250% | Core: 50 mm',245.00,24,'available',false),
('22222222-2222-4222-8222-000000000004','11111111-1111-4111-8111-000000000001','Air Bubble Wrap Roll 1m x 100m','bubble-wrap-roll-1m','ZM-PKG-1004','Protective bubble cushioning for fragile goods, uniform bubble formation.','Width: 1 m | Length: 100 m | Bubble: 10 mm | Material: LDPE | Pack: single roll',780.00,10,'stock_out',false),
('22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-000000000002','Industrial Floor Cleaner Concentrate 5L','floor-cleaner-concentrate-5l','ZM-CLN-2001','High-foam concentrate suitable for vitrified, marble and epoxy floors. Dilution 1:40.','Volume: 5 L | pH: 8.5 | Dilution: 1:40 | Fragrance: citrus | Pack: 4 cans per carton',420.00,20,'available',true),
('22222222-2222-4222-8222-000000000006','11111111-1111-4111-8111-000000000002','Alcohol Hand Sanitizer Gel 500ml','hand-sanitizer-gel-500ml','ZM-CLN-2002','70% IPA gel sanitizer with moisturiser, pump dispenser bottle.','Volume: 500 ml | Alcohol: 70% v/v | Form: gel | Pack: 24 bottles per carton | Shelf life: 24 months',115.00,48,'available',false),
('22222222-2222-4222-8222-000000000007','11111111-1111-4111-8111-000000000002','Heavy Duty Microfibre Cleaning Cloth (Pack of 12)','microfibre-cloth-pack-12','ZM-CLN-2003','Lint-free 380 GSM microfibre cloths for glass, steel and general surfaces.','GSM: 380 | Size: 40 x 40 cm | Pack: 12 pieces | Wash cycles: 300+ | Colours: assorted',260.00,25,'available',false),
('22222222-2222-4222-8222-000000000008','11111111-1111-4111-8111-000000000002','Toilet Bowl Cleaner Acid 5L','toilet-bowl-cleaner-5l','ZM-CLN-2004','Thickened acidic cleaner that removes hard water scale and stains.','Volume: 5 L | Active: HCl 10% | Pack: 4 cans per carton | Application: washroom deep clean',310.00,20,'available',false),
('22222222-2222-4222-8222-000000000009','11111111-1111-4111-8111-000000000003','Ripple Wall Paper Cup 250ml (Pack of 50)','ripple-paper-cup-250ml','ZM-DSP-3001','Double-wall ripple hot beverage cup, food-grade PE lined, leak resistant.','Capacity: 250 ml | Wall: ripple double | GSM: 300 | Pack: 50 cups | Carton: 20 packs',175.00,40,'available',true),
('22222222-2222-4222-8222-000000000010','11111111-1111-4111-8111-000000000003','Kraft Food Container 750ml with Lid (Pack of 50)','kraft-food-container-750ml','ZM-DSP-3002','Microwave-safe kraft bowl with PET lid for cloud kitchens and takeaway.','Capacity: 750 ml | Material: kraft board + PE | Lid: PET | Pack: 50 sets | Oil resistant: yes',465.00,20,'available',true),
('22222222-2222-4222-8222-000000000011','11111111-1111-4111-8111-000000000003','Wooden Cutlery Set - Spoon, Fork, Knife (Pack of 100)','wooden-cutlery-set-100','ZM-DSP-3003','Birchwood compostable cutlery, individually smooth-sanded, plastic free.','Material: birchwood | Length: 160 mm | Pack: 100 pieces | Compostable: yes',290.00,25,'available',false),
('22222222-2222-4222-8222-000000000012','11111111-1111-4111-8111-000000000003','Aluminium Foil Container 450ml with Lid (Pack of 100)','aluminium-container-450ml','ZM-DSP-3004','Rigid aluminium containers for hot food delivery, oven and airline safe.','Capacity: 450 ml | Gauge: 38 micron | Lid: paper board | Pack: 100 sets',540.00,20,'stock_out',false),
('22222222-2222-4222-8222-000000000013','11111111-1111-4111-8111-000000000004','A4 Copier Paper 75 GSM (Ream of 500)','a4-copier-paper-75gsm','ZM-OFF-4001','Bright white multipurpose copier paper for high-speed printers and copiers.','Size: A4 | GSM: 75 | Brightness: 102 | Sheets: 500 per ream | Carton: 5 reams',285.00,50,'available',true),
('22222222-2222-4222-8222-000000000014','11111111-1111-4111-8111-000000000004','Box File with Metal Clip (Pack of 10)','box-file-metal-clip-10','ZM-OFF-4002','Laminated board box files with metal clip and index label window.','Size: F/S | Board: 1200 GSM laminated | Pack: 10 files | Colours: blue, green, red',520.00,20,'available',false),
('22222222-2222-4222-8222-000000000015','11111111-1111-4111-8111-000000000004','Ball Pen Blue 0.7mm (Box of 50)','ball-pen-blue-50','ZM-OFF-4003','Smooth-flow ballpoint pens with tungsten carbide tip, long write-out.','Tip: 0.7 mm | Ink: blue oil based | Write length: 1800 m | Box: 50 pens',225.00,20,'available',false),
('22222222-2222-4222-8222-000000000016','11111111-1111-4111-8111-000000000005','Stainless Steel Storage Container 5L (Set of 4)','ss-storage-container-5l','ZM-KIT-5001','Food-grade SS 304 airtight containers for commercial kitchen storage.','Grade: SS 304 | Capacity: 5 L each | Lid: airtight steel | Set: 4 pieces',1650.00,10,'available',true),
('22222222-2222-4222-8222-000000000017','11111111-1111-4111-8111-000000000005','Melamine Dinner Plate 11 inch (Pack of 12)','melamine-dinner-plate-11','ZM-KIT-5002','Unbreakable hotel-grade melamine plates with glossy chip-resistant finish.','Diameter: 11 inch | Material: 100% melamine | Pack: 12 plates | Dishwasher safe: yes',960.00,10,'available',false),
('22222222-2222-4222-8222-000000000018','11111111-1111-4111-8111-000000000005','Commercial Chef Knife 10 inch','commercial-chef-knife-10','ZM-KIT-5003','Forged high-carbon stainless blade with non-slip moulded handle.','Blade: 10 inch high carbon SS | Hardness: 56 HRC | Handle: PP moulded | Pack: 6 pieces',480.00,12,'available',false),
('22222222-2222-4222-8222-000000000019','11111111-1111-4111-8111-000000000006','Hotel Amenity Soap Bar 25g (Pack of 100)','hotel-amenity-soap-25g','ZM-PER-6001','Wrapped guest soap bars with mild fragrance for hospitality amenity kits.','Weight: 25 g | Pack: 100 bars | Fragrance: white tea | Wrap: printed paper',690.00,20,'available',true),
('22222222-2222-4222-8222-000000000020','11111111-1111-4111-8111-000000000006','2-Ply Facial Tissue Box 100 Pulls (Pack of 24)','facial-tissue-100-pulls-24','ZM-PER-6002','Soft virgin pulp 2-ply facial tissues in printed dispenser boxes.','Ply: 2 | Pulls: 100 per box | Pack: 24 boxes | Pulp: 100% virgin',1080.00,10,'available',false);

-- seed product images
INSERT INTO public.product_images (product_id, image_url, display_order) VALUES
('22222222-2222-4222-8222-000000000001','https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000001','https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',1),
('22222222-2222-4222-8222-000000000002','https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000003','https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000004','https://images.unsplash.com/photo-1611269154421-4e6e0b1f0b0d?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000005','https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000006','https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000007','https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000008','https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000009','https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000010','https://images.unsplash.com/photo-1594179047519-f347310d3322?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000011','https://images.unsplash.com/photo-1584346133934-a3a4db9b5a17?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000012','https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000013','https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000014','https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000015','https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000016','https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000017','https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000018','https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000019','https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=1200&q=80',0),
('22222222-2222-4222-8222-000000000020','https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=80',0);