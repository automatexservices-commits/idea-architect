-- Migration: add billing payments table

CREATE TABLE IF NOT EXISTS public.billing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('pro', 'enterprise', 'custom')),
  amount_in_paise integer NOT NULL CHECK (amount_in_paise >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  order_id text NOT NULL UNIQUE,
  payment_id text NOT NULL UNIQUE,
  receipt text NOT NULL,
  method text,
  upi_id text,
  signature text NOT NULL,
  notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_payments_user_id_paid_at
  ON public.billing_payments (user_id, paid_at DESC);

ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY billing_payments_select_own
  ON public.billing_payments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY billing_payments_insert_own
  ON public.billing_payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY billing_payments_update_own
  ON public.billing_payments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
