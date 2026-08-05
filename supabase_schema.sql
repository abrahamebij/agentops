-- ====================================================================
-- AGENTOPS PROTOCOL: SUPABASE DATABASE MIGRATION & STORAGE SETUP
-- ====================================================================

-- 1. STORAGE BUCKET FOR USER AVATARS / PROFILE PICS
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to avatar profile pictures
CREATE POLICY "Public Avatar Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own profile avatar
CREATE POLICY "Users can upload their avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their avatar
CREATE POLICY "Users can update their avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );


-- 2. USER PROFILES TABLE (Web3 Wallet Onboarding)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'Operator',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- 3. EXECUTIONS TABLE (Multi-Agent Onchain Runs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.executions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  trigger_description TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  amount_eth TEXT NOT NULL,
  amount_usd TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('EXECUTE', 'REJECT')),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'rejected', 'running')),
  executed BOOLEAN NOT NULL DEFAULT FALSE,
  keeperhub_tx_hash TEXT,
  keeperhub_tx_link TEXT,
  gas_used_wei TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view executions"
  ON public.executions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert executions"
  ON public.executions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- 4. AGENT VERDICTS AUDIT LOG TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id TEXT REFERENCES public.executions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'reject')),
  confidence NUMERIC(3, 2) NOT NULL,
  reasons JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_verdicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agent verdicts"
  ON public.agent_verdicts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert agent verdicts"
  ON public.agent_verdicts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- 5. POLICY RULES GOVERNANCE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_tx_usd NUMERIC(10, 2) DEFAULT 50.00,
  min_confidence NUMERIC(3, 2) DEFAULT 0.85,
  required_approvals INT DEFAULT 2,
  allowed_chain_id INT DEFAULT 11155111,
  allowed_actions JSONB DEFAULT '["transfer", "contractCall", "yieldOpt", "rebalance"]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their policy rules"
  ON public.policy_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their policy rules"
  ON public.policy_rules FOR ALL
  USING (auth.uid() = user_id);
