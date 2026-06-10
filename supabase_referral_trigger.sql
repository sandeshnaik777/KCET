-- ============================================================
-- REFERRAL BONUS TRIGGER
-- Runs server-side (SECURITY DEFINER) so it bypasses RLS.
-- When a new profile is inserted with a referred_by code,
-- it automatically adds 25 credits to the referrer's balance.
-- ============================================================

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.add_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER           -- runs as DB owner, bypasses RLS
SET search_path = public
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.profiles
    SET credits = credits + 25
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Drop old trigger if it exists (safe re-run)
DROP TRIGGER IF EXISTS trigger_referral_bonus ON public.profiles;

-- 3. Attach trigger — fires after every new profile INSERT
CREATE TRIGGER trigger_referral_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.add_referral_bonus();
