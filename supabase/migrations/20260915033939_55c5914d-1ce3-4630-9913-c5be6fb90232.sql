CREATE POLICY "admins upload catalogue images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catalogue' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins read catalogue images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'catalogue' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update catalogue images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'catalogue' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'catalogue' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete catalogue images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'catalogue' AND has_role(auth.uid(), 'admin'::app_role));