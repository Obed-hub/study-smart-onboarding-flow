
-- Add/ensure 'is_premium' column exists in profiles (You already have it, so just a comment)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- Create a table to record Paystack events and link them to users
CREATE TABLE IF NOT EXISTS public.paystack_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  reference TEXT NOT NULL,
  raw_payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for the paystack_events table for future-proofing
ALTER TABLE public.paystack_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own Paystack events (optional)
CREATE POLICY "Users can view their paystack events"
  ON public.paystack_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

