-- Private previews previously required the service-role key on the app server.
-- Move the token check into the database instead: the preview_token itself is
-- the credential, so a SECURITY DEFINER lookup keyed on (slug, token) can be
-- exposed to the publishable key without weakening access control.
CREATE OR REPLACE FUNCTION public.get_preview_row(_table text, _slug text, _token uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF _table NOT IN ('posts', 'case_studies', 'journal_entries') THEN
    RETURN NULL;
  END IF;
  EXECUTE format(
    'SELECT to_jsonb(t) FROM public.%I t WHERE t.slug = $1 AND t.preview_token = $2',
    _table
  )
  INTO result
  USING _slug, _token;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_preview_row(text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_preview_row(text, text, uuid) TO anon, authenticated, service_role;
