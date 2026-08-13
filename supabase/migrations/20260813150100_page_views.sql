-- Privacy-friendly first-party analytics: one row per page view, no cookies,
-- no user identifiers. Anyone can record a view; only the admin can read.
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone records a view" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(path) <= 300 AND (referrer IS NULL OR char_length(referrer) <= 300));
CREATE POLICY "Admin reads views" ON public.page_views
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX page_views_recent ON public.page_views (created_at DESC);
CREATE INDEX page_views_by_path ON public.page_views (path, created_at DESC);

-- Aggregated report so the studio never pulls raw rows.
CREATE OR REPLACE FUNCTION public.page_view_summary(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  since timestamptz := now() - make_interval(days => GREATEST(LEAST(_days, 365), 1));
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM page_views WHERE created_at >= since),
    'byPath', COALESCE((
      SELECT jsonb_agg(row ORDER BY (row->>'views')::bigint DESC)
      FROM (
        SELECT jsonb_build_object('path', path, 'views', count(*)) AS row
        FROM page_views WHERE created_at >= since
        GROUP BY path ORDER BY count(*) DESC LIMIT 50
      ) top_paths
    ), '[]'::jsonb),
    'byDay', COALESCE((
      SELECT jsonb_agg(row ORDER BY row->>'day')
      FROM (
        SELECT jsonb_build_object('day', to_char(created_at, 'YYYY-MM-DD'), 'views', count(*)) AS row
        FROM page_views WHERE created_at >= since
        GROUP BY to_char(created_at, 'YYYY-MM-DD')
      ) days
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.page_view_summary(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.page_view_summary(integer) TO authenticated, service_role;
