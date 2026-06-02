CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'pro')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  idea text NOT NULL,
  description text,
  stack_recommendation jsonb NOT NULL DEFAULT '{}'::jsonb,
  generation_state text NOT NULL DEFAULT 'idle' CHECK (generation_state IN ('idle', 'generating', 'ready', 'failed')),
  current_stage text NOT NULL DEFAULT 'created',
  download_count integer NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  last_generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('prd', 'system_design', 'architecture')),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
  current_version_id uuid,
  latest_checksum text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, document_type)
);

CREATE TABLE public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL CHECK (version_number > 0),
  content_markdown text NOT NULL,
  file_format text NOT NULL DEFAULT 'md' CHECK (file_format IN ('md', 'pdf', 'json')),
  file_name text NOT NULL,
  checksum text NOT NULL,
  ai_model text,
  prompt_version text NOT NULL DEFAULT 'v1',
  token_usage jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version_number)
);

ALTER TABLE public.documents
  ADD CONSTRAINT documents_current_version_fkey
  FOREIGN KEY (current_version_id)
  REFERENCES public.document_versions(id)
  ON DELETE SET NULL;

CREATE TABLE public.usage_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'pro')),
  lifetime_generations integer NOT NULL DEFAULT 0 CHECK (lifetime_generations >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  route text NOT NULL,
  method text NOT NULL,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  message text NOT NULL,
  status_code integer,
  duration_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_id_created_at ON public.projects (user_id, created_at DESC);
CREATE INDEX idx_projects_generation_state ON public.projects (generation_state);
CREATE INDEX idx_documents_project_id_type ON public.documents (project_id, document_type);
CREATE INDEX idx_documents_user_id_created_at ON public.documents (user_id, created_at DESC);
CREATE INDEX idx_document_versions_document_id_version ON public.document_versions (document_id, version_number DESC);
CREATE INDEX idx_document_versions_checksum ON public.document_versions (checksum);
CREATE INDEX idx_usage_limits_role ON public.usage_limits (role);
CREATE INDEX idx_api_logs_user_id_created_at ON public.api_logs (user_id, created_at DESC);
CREATE INDEX idx_api_logs_route_created_at ON public.api_logs (route, created_at DESC);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER usage_limits_updated_at
  BEFORE UPDATE ON public.usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY users_insert_own
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY users_update_own
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY projects_select_own
  ON public.projects
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY projects_insert_own
  ON public.projects
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update_own
  ON public.projects
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_delete_own
  ON public.projects
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY documents_select_own
  ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.documents.project_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY documents_insert_own
  ON public.documents
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.documents.project_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY documents_update_own
  ON public.documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.documents.project_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.documents.project_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY documents_delete_own
  ON public.documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = public.documents.project_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY document_versions_select_own
  ON public.document_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = public.document_versions.document_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY document_versions_insert_own
  ON public.document_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = public.document_versions.document_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY document_versions_update_own
  ON public.document_versions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = public.document_versions.document_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = public.document_versions.document_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY document_versions_delete_own
  ON public.document_versions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.id = public.document_versions.document_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY usage_limits_select_own
  ON public.usage_limits
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY usage_limits_insert_own
  ON public.usage_limits
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY usage_limits_update_own
  ON public.usage_limits
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY api_logs_select_own
  ON public.api_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY api_logs_insert_own
  ON public.api_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Increment lifetime generations for a user. This enforces a lifetime counter
-- and does NOT perform any daily resets. It will insert a usage_limits
-- row for the user if missing, then increment `lifetime_generations`.
CREATE OR REPLACE FUNCTION public.increment_lifetime_generations(
  p_user_id uuid,
  p_units integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_row public.usage_limits%ROWTYPE;
BEGIN
  SELECT COALESCE(role, 'free') INTO v_role FROM public.users WHERE id = p_user_id;

  -- Ensure a usage_limits row exists for the user
  INSERT INTO public.usage_limits (user_id, role, lifetime_generations)
  VALUES (p_user_id, v_role, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        updated_at = now();

  SELECT * INTO v_row FROM public.usage_limits WHERE user_id = p_user_id FOR UPDATE;

  UPDATE public.usage_limits
     SET lifetime_generations = lifetime_generations + p_units,
         role = v_role,
         updated_at = now()
   WHERE user_id = p_user_id
   RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'allowed', true,
    'role', v_row.role,
    'limit', CASE WHEN v_row.role = 'pro' THEN 100 ELSE 3 END,
    'used', v_row.lifetime_generations,
    'remaining', GREATEST(CASE WHEN v_row.role = 'pro' THEN 100 ELSE 3 END - v_row.lifetime_generations, 0)
  );
END;
$$;

-- Spec history table to record generated spec bundles for users
CREATE TABLE public.spec_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  idea_input text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_spec_history_user_id_created_at ON public.spec_history (user_id, created_at DESC);
