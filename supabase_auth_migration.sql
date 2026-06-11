-- ============================================================
-- KCET Platform: Auth + Referral System
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id             uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email          text,
  referral_code  text        UNIQUE NOT NULL,
  referred_by    text,        -- referral code of person who referred them
  credits        integer     NOT NULL DEFAULT 50,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone can read profiles (needed to validate referral codes)
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

-- Users can insert their own profile on signup
CREATE POLICY "profiles_own_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile (credit refresh, etc.)
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
