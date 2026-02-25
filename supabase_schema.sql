-- 1. Profiles Table (Linked to Auth Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'developer' CHECK (role IN ('admin', 'developer', 'designer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'developer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Components Table
CREATE TABLE public.components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  default_code TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- 3. Comments Table (For Inbox and Component Docs)
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL DEFAULT 'Default',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- Row Level Security (RLS) Setup

-- Profiles: Anyone can read profiles. Users can update their own profile. Admins can update any.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Components: Anyone authenticated can read. Auth users can insert/update.
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Components are viewable by everyone." ON public.components FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create components." ON public.components FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update components." ON public.components FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete components." ON public.components FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comments: Anyone can read. Auth users can insert on their behalf.
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments." ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 4. ChangeLog Table (For tracking component edits)
CREATE TABLE public.changelog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  version_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ChangeLog RLS
ALTER TABLE public.changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Changelog is viewable by everyone." ON public.changelog FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert changelog." ON public.changelog FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Changelog cannot be updated or deleted." ON public.changelog FOR UPDATE USING (false);
CREATE POLICY "Changelog cannot be deleted." ON public.changelog FOR DELETE USING (false);
