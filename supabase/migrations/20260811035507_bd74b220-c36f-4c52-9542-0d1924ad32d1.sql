-- 1. Workflow columns
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS preview_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS body_md text NOT NULL DEFAULT '';

ALTER TABLE public.case_studies
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS preview_token uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS preview_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS reflection_md text NOT NULL DEFAULT '';

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft','review','scheduled','published'));
ALTER TABLE public.case_studies DROP CONSTRAINT IF EXISTS case_studies_status_check;
ALTER TABLE public.case_studies ADD CONSTRAINT case_studies_status_check CHECK (status IN ('draft','review','scheduled','published'));
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_status_check;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_status_check CHECK (status IN ('draft','review','scheduled','published'));

UPDATE public.posts SET status = CASE WHEN published THEN 'published' ELSE 'draft' END,
  published_at = COALESCE(published_at, CASE WHEN published THEN created_at END);
UPDATE public.case_studies SET status = CASE WHEN published THEN 'published' ELSE 'draft' END,
  published_at = COALESCE(published_at, CASE WHEN published THEN created_at END);
UPDATE public.journal_entries SET status = CASE WHEN published THEN 'published' ELSE 'draft' END,
  published_at = COALESCE(published_at, CASE WHEN published THEN created_at END);

-- 2. Revisions
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  slug text NOT NULL,
  snapshot jsonb NOT NULL,
  note text NOT NULL DEFAULT '',
  created_by uuid,
  created_by_email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.content_revisions TO authenticated;
GRANT ALL ON public.content_revisions TO service_role;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads revisions" ON public.content_revisions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin writes revisions" ON public.content_revisions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes revisions" ON public.content_revisions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS content_revisions_lookup ON public.content_revisions (table_name, slug, created_at DESC);

-- 3. Audit log
CREATE TABLE IF NOT EXISTS public.content_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  slug text NOT NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  actor_email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_audit_log TO authenticated;
GRANT ALL ON public.content_audit_log TO service_role;
ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads audit log" ON public.content_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin writes audit log" ON public.content_audit_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS content_audit_log_recent ON public.content_audit_log (created_at DESC);

-- 4. Scheduled publishing
CREATE OR REPLACE FUNCTION public.publish_due_content()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE total integer := 0; n integer;
BEGIN
  UPDATE public.posts SET status='published', published=true, published_at=now(), scheduled_for=NULL
    WHERE status='scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now();
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;

  UPDATE public.case_studies SET status='published', published=true, published_at=now(), scheduled_for=NULL
    WHERE status='scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now();
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;

  UPDATE public.journal_entries SET status='published', published=true, published_at=now(), scheduled_for=NULL
    WHERE status='scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now();
  GET DIAGNOSTICS n = ROW_COUNT; total := total + n;

  RETURN total;
END;
$$;
REVOKE ALL ON FUNCTION public.publish_due_content() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_due_content() TO service_role;