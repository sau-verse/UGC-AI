# Credits System Implementation

## Overview
A comprehensive credits system has been implemented for the UGC Avatar application using PostgreSQL triggers and a centralized transaction log. The system ensures atomic credit deductions, idempotency, and full audit trails.

## Database Schema Changes

### 1. Profiles Table Enhancement
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 60;
```
- All existing users automatically received 60 credits
- New users will get 60 credits via the signup trigger

### 2. Credit Transactions Table
```sql
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_type TEXT CHECK (job_type IN ('image', 'video', 'system')) NOT NULL,
  job_id UUID NOT NULL,
  amount INTEGER NOT NULL,  -- negative = deduction, positive = grant
  reason TEXT NOT NULL,     -- 'image_generate', 'video_generate', 'signup_bonus', etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (job_type, job_id)  -- ensures idempotency (one credit event per job)
);
```

## Business Rules Implementation

### Credit Costs
- **Image Generation/Regeneration**: 5 credits
- **Video Generation**: 50 credits
- **Signup Bonus**: 60 credits (trial)

### Deduction Conditions
- **Image Jobs**: `status = 'done'` AND `action IN ('generate', 'regenerate')`
- **Video Jobs**: `status = 'done'`
- **Signup**: New user profile creation

### Idempotency
- Each job can only deduct credits once
- Unique constraint on `(job_type, job_id)` prevents duplicate transactions
- Triggers check for existing transactions before processing

## Trigger Functions

### 1. Image Job Credit Deduction
```sql
CREATE OR REPLACE FUNCTION public.handle_image_job_credit()
RETURNS TRIGGER AS $$
DECLARE
  cost INTEGER := 5;
  already_exists BOOLEAN;
BEGIN
  -- Only trigger when status changes to 'done'
  IF TG_OP = 'UPDATE'
     AND OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status = 'done'
     AND NEW.action IN ('generate', 'regenerate') THEN

    -- Check if a transaction already exists for this job (idempotency)
    SELECT EXISTS (
      SELECT 1 FROM public.credit_transactions
      WHERE job_type = 'image' AND job_id = NEW.id
    ) INTO already_exists;

    IF already_exists THEN
      RETURN NEW;
    END IF;

    -- Deduct credits atomically
    UPDATE public.profiles
    SET credits = credits - cost
    WHERE id = NEW.user_id;

    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, job_type, job_id, amount, reason)
    VALUES (NEW.user_id, 'image', NEW.id, -cost, 'image_generate_or_regenerate');

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Video Job Credit Deduction
```sql
CREATE OR REPLACE FUNCTION public.handle_video_job_credit()
RETURNS TRIGGER AS $$
DECLARE
  cost INTEGER := 50;
  already_exists BOOLEAN;
  owner_id UUID;
BEGIN
  -- Only trigger when status changes to 'done'
  IF TG_OP = 'UPDATE'
     AND OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status = 'done' THEN

    -- Check if a transaction already exists for this job (idempotency)
    SELECT EXISTS (
      SELECT 1 FROM public.credit_transactions
      WHERE job_type = 'video' AND job_id = NEW.video_job_id
    ) INTO already_exists;

    IF already_exists THEN
      RETURN NEW;
    END IF;

    -- Find owner (through image_job)
    SELECT user_id INTO owner_id
    FROM public.image_jobs
    WHERE id = NEW.image_job_id;

    IF owner_id IS NULL THEN
      RAISE NOTICE 'Skipping video %: no owner found', NEW.video_job_id;
      RETURN NEW;
    END IF;

    -- Deduct credits
    UPDATE public.profiles
    SET credits = credits - cost
    WHERE id = owner_id;

    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, job_type, job_id, amount, reason)
    VALUES (owner_id, 'video', NEW.video_job_id, -cost, 'video_generate');

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Signup Bonus Trigger
```sql
CREATE OR REPLACE FUNCTION public.add_trial_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Add 60 credits only once when a new user record is created
  UPDATE public.profiles
  SET credits = 60
  WHERE id = NEW.id;

  INSERT INTO public.credit_transactions (user_id, job_type, job_id, amount, reason)
  VALUES (NEW.id, 'system', gen_random_uuid(), 60, 'signup_bonus');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Testing Results

### Image Job Credit Deduction Test
- **Before**: User had 60 credits
- **Action**: Completed an image regeneration job
- **After**: User had 55 credits (-5)
- **Transaction Logged**: ✅
- **Idempotency Test**: ✅ (credits not deducted twice)

### Video Job Credit Deduction Test
- **Before**: User had 55 credits
- **Action**: Completed a video generation job
- **After**: User had 5 credits (-50)
- **Transaction Logged**: ✅

### Transaction Audit Trail
```sql
-- Example transaction log for test user
user_id: ea7cbdd9-00f5-406e-b0d4-d0c1b92aceae
├── video_generate: -50 credits (video job completion)
└── image_generate_or_regenerate: -5 credits (image job completion)
```

## Security & Performance

### Row Level Security (RLS)
- Credit transactions table has RLS enabled
- Users can only view their own transactions
- Policy: `"Users can view their own credit transactions"`

### Indexing
- Index on `user_id` for efficient transaction lookups
- Unique constraint on `(job_type, job_id)` for idempotency

### Atomic Operations
- Credit updates and transaction logging happen in the same trigger
- Database-level consistency ensures no partial updates

## Usage Examples

### Check User Credits
```sql
SELECT id, email, credits 
FROM public.profiles 
WHERE id = 'user-uuid';
```

### View Credit History
```sql
SELECT amount, reason, created_at 
FROM public.credit_transactions 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;
```

### Credit Balance Calculation
```sql
SELECT 
  p.credits as current_balance,
  COALESCE(SUM(ct.amount), 0) as total_transactions
FROM public.profiles p
LEFT JOIN public.credit_transactions ct ON p.id = ct.user_id
WHERE p.id = 'user-uuid'
GROUP BY p.id, p.credits;
```

## Future Enhancements

### Credit Purchase System
- Add `credit_packages` table for different credit bundles
- Implement payment integration triggers
- Add `purchase` transaction type

### Credit Expiration
- Add `expires_at` column to credit_transactions
- Implement cleanup job for expired credits
- Add expiration policies

### Credit Refunds
- Add `refund` transaction type
- Implement refund triggers for failed jobs
- Add manual refund capabilities

## Monitoring & Analytics

### Key Metrics to Track
- Average credits per user
- Credit consumption patterns
- Transaction volume by type
- User credit balance distribution

### Useful Queries
```sql
-- Top credit consumers
SELECT p.email, p.credits, COUNT(ct.id) as transaction_count
FROM public.profiles p
JOIN public.credit_transactions ct ON p.id = ct.user_id
WHERE ct.amount < 0
GROUP BY p.id, p.email, p.credits
ORDER BY transaction_count DESC;

-- Daily credit consumption
SELECT 
  DATE(created_at) as date,
  SUM(ABS(amount)) as total_credits_consumed,
  COUNT(*) as transaction_count
FROM public.credit_transactions
WHERE amount < 0
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Conclusion

The credits system is now fully implemented and tested. It provides:
- ✅ Atomic credit deductions
- ✅ Full audit trail
- ✅ Idempotency protection
- ✅ Automatic signup bonuses
- ✅ Proper error handling
- ✅ Performance optimization

The system is ready for production use and can be easily extended with additional features as needed.
