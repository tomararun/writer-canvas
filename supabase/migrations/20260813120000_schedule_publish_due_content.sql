-- Scheduled publishing was authored but never triggered: publish_due_content()
-- existed, yet nothing called it, so "Scheduled" entries stayed scheduled forever.
-- Run it inside the database every minute via pg_cron.
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('publish-due-content');
EXCEPTION WHEN OTHERS THEN
  NULL; -- job did not exist yet
END $$;

SELECT cron.schedule(
  'publish-due-content',
  '* * * * *',
  $$SELECT public.publish_due_content()$$
);

-- Allow the HTTP fallback hook (guarded by the publishable key) to trigger the
-- same routine without the service-role key. Safe to expose: it only publishes
-- entries that are already scheduled and due.
GRANT EXECUTE ON FUNCTION public.publish_due_content() TO anon, authenticated;
