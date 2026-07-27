
CREATE POLICY "logo read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "logo insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "logo update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "logo delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'shop-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
