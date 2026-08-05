-- Create storage bucket 'shop-logos' if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-logos',
  'shop-logos',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable public read access for shop-logos
DROP POLICY IF EXISTS "Public Read Shop Logos" ON storage.objects;
CREATE POLICY "Public Read Shop Logos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'shop-logos');

-- Allow authenticated users to upload their own shop logos
DROP POLICY IF EXISTS "Authenticated Upload Shop Logos" ON storage.objects;
CREATE POLICY "Authenticated Upload Shop Logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shop-logos');

-- Allow authenticated users to update their own shop logos
DROP POLICY IF EXISTS "Authenticated Update Shop Logos" ON storage.objects;
CREATE POLICY "Authenticated Update Shop Logos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'shop-logos');

-- Allow authenticated users to delete their shop logos
DROP POLICY IF EXISTS "Authenticated Delete Shop Logos" ON storage.objects;
CREATE POLICY "Authenticated Delete Shop Logos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'shop-logos');
