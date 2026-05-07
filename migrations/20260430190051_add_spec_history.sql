-- Migration: add spec_history table

CREATE TABLE IF NOT EXISTS public.spec_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  idea_input text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spec_history_user_id_created_at ON public.spec_history (user_id, created_at DESC);
