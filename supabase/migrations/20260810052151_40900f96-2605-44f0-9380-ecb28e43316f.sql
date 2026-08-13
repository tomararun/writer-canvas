CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  dek text NOT NULL DEFAULT '',
  date date NOT NULL DEFAULT current_date,
  category text NOT NULL DEFAULT 'Essays',
  tags text[] NOT NULL DEFAULT '{}',
  reading_time integer NOT NULL DEFAULT 5,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  body text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  client text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  background text NOT NULL DEFAULT '',
  problem text NOT NULL DEFAULT '',
  process jsonb NOT NULL DEFAULT '[]',
  implementation text[] NOT NULL DEFAULT '{}',
  outcomes text NOT NULL DEFAULT '',
  metrics jsonb NOT NULL DEFAULT '[]',
  learnings text[] NOT NULL DEFAULT '{}',
  gallery jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  topic text NOT NULL DEFAULT '',
  reflection text[] NOT NULL DEFAULT '{}',
  resources jsonb NOT NULL DEFAULT '[]',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  blurb text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Live',
  link text,
  case_study text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.posts, public.case_studies, public.journal_entries, public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts, public.case_studies, public.journal_entries, public.projects, public.subscribers TO authenticated;
GRANT INSERT ON public.subscribers TO anon;
GRANT ALL ON public.posts, public.case_studies, public.journal_entries, public.projects, public.subscribers TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published posts" ON public.posts FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Admin reads all posts" ON public.posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin writes posts" ON public.posts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public reads published case studies" ON public.case_studies FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Admin reads all case studies" ON public.case_studies FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin writes case studies" ON public.case_studies FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public reads published journal" ON public.journal_entries FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Admin reads all journal" ON public.journal_entries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin writes journal" ON public.journal_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public reads projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin writes projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin reads subscribers" ON public.subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin deletes subscribers" ON public.subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER posts_touch BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER case_studies_touch BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER journal_touch BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();