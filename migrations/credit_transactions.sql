-- ===========================================
-- CREDIT TRANSACTIONS TABLE
-- ===========================================

-- Safely drop existing policies and triggers if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'credit_transactions') THEN
    DROP POLICY IF EXISTS "Users can view their own credit transactions" ON public.credit_transactions;
    DROP POLICY IF EXISTS "Users can insert their own credit transactions" ON public.credit_transactions;
    DROP POLICY IF EXISTS "Users can update their own credit transactions" ON public.credit_transactions;
    DROP POLICY IF EXISTS "Users can delete their own credit transactions" ON public.credit_transactions;
  END IF;
END $$;

-- Create credit_transactions table for tracking credit usage
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('image', 'video', 'system')),
  job_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- positive for credits added, negative for credits used
  reason TEXT NOT NULL, -- description of the transaction
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_job_type ON public.credit_transactions(job_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_job_id ON public.credit_transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);

-- Enable Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit transactions" ON public.credit_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit transactions" ON public.credit_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update user credits when transaction is created
CREATE OR REPLACE FUNCTION public.update_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's credit balance
  UPDATE public.profiles 
  SET credits = credits + NEW.amount,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update user credits
CREATE TRIGGER update_user_credits_trigger
  AFTER INSERT ON public.credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_credits();

-- Function to deduct credits for a job
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_job_type TEXT,
  p_job_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Insert the credit transaction
  INSERT INTO public.credit_transactions (
    user_id, job_type, job_id, amount, reason
  ) VALUES (
    p_user_id, p_job_type, p_job_id, -p_amount, p_reason
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits for a job completion or system credit
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_job_type TEXT,
  p_job_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Insert the credit transaction
  INSERT INTO public.credit_transactions (
    user_id, job_type, job_id, amount, reason
  ) VALUES (
    p_user_id, p_job_type, p_job_id, p_amount, p_reason
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
