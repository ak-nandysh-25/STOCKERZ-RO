-- Create storage bucket 'shop-logos' if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-logos',
  'shop-logos',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']::text[];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up any conflicting old or existing policies
DROP POLICY IF EXISTS "Public Read Shop Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Shop Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Shop Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Shop Logos" ON storage.objects;
DROP POLICY IF EXISTS "logo read own" ON storage.objects;
DROP POLICY IF EXISTS "logo insert own" ON storage.objects;
DROP POLICY IF EXISTS "logo update own" ON storage.objects;
DROP POLICY IF EXISTS "logo delete own" ON storage.objects;

-- Allow public read access for shop-logos
CREATE POLICY "Public Read Shop Logos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'shop-logos');

-- Allow authenticated users to upload shop logos
CREATE POLICY "Authenticated Upload Shop Logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shop-logos');

-- Allow authenticated users to update shop logos
CREATE POLICY "Authenticated Update Shop Logos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'shop-logos');

-- Allow authenticated users to delete shop logos
CREATE POLICY "Authenticated Delete Shop Logos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'shop-logos');
