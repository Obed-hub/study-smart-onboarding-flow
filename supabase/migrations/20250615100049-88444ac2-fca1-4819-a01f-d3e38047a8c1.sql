
-- Add full_name column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update the handle_new_user function to include full_name from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$
