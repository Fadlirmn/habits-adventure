-- 1. BUAT TABEL PROFILES (UNTUK STATS RPG USER)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  hp INT DEFAULT 100 NOT NULL,
  mp INT DEFAULT 50 NOT NULL,
  xp INT DEFAULT 0 NOT NULL,
  level INT DEFAULT 1 NOT NULL,
  gold INT DEFAULT 100 NOT NULL,
  inventory JSONB DEFAULT '[]'::jsonb NOT NULL,
  unlocked_kanji JSONB DEFAULT '[]'::jsonb NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS untuk Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger untuk membuat profile baru otomatis saat user signup/login pertama kali
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, hp, mp, xp, level, gold, inventory, unlocked_kanji)
  VALUES (new.id, 100, 50, 0, 1, 100, '[]'::jsonb, '[]'::jsonb)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. MIGRASI TABEL QUESTS (UNTUK MULTI-TENANT)
-- Tambahkan kolom user_id
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Sesuaikan RLS untuk Quests agar mendukung global quest dan custom quest milik sendiri
DROP POLICY IF EXISTS "Allow public read access" ON public.quests;
DROP POLICY IF EXISTS "Allow public insert access" ON public.quests;
DROP POLICY IF EXISTS "Allow public update access" ON public.quests;
DROP POLICY IF EXISTS "Allow public delete access" ON public.quests;

CREATE POLICY "Allow read global and own quests" ON public.quests
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow insert own quests" ON public.quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update own quests" ON public.quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow delete own quests" ON public.quests
  FOR DELETE USING (auth.uid() = user_id);


-- 3. MIGRASI TABEL QUEST COMPLETIONS
-- Tambahkan kolom user_id
ALTER TABLE public.quest_completions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ubah unik constraint agar unik per user + quest + tanggal
ALTER TABLE public.quest_completions DROP CONSTRAINT IF EXISTS quest_completions_quest_id_completed_date_key;
ALTER TABLE public.quest_completions ADD CONSTRAINT quest_completions_user_quest_date_key UNIQUE (user_id, quest_id, completed_date);

-- Sesuaikan RLS untuk Quest Completions
DROP POLICY IF EXISTS "Allow public read access" ON public.quest_completions;
DROP POLICY IF EXISTS "Allow public insert access" ON public.quest_completions;
DROP POLICY IF EXISTS "Allow public delete access" ON public.quest_completions;

CREATE POLICY "Allow read own completions" ON public.quest_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own completions" ON public.quest_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete own completions" ON public.quest_completions
  FOR DELETE USING (auth.uid() = user_id);
