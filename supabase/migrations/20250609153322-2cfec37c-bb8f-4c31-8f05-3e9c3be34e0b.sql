
-- Add is_premium column to existing profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Create storage bucket for PDF uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for study materials (only if they don't exist)
DO $$ 
BEGIN
  -- Check and create storage policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload own study materials'
  ) THEN
    CREATE POLICY "Users can upload own study materials" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view own study materials'
  ) THEN
    CREATE POLICY "Users can view own study materials" ON storage.objects
      FOR SELECT USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own study materials'
  ) THEN
    CREATE POLICY "Users can delete own study materials" ON storage.objects
      FOR DELETE USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
