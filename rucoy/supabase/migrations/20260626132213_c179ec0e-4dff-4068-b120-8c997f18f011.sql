CREATE TABLE public.save_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_index INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  character_class TEXT NOT NULL,
  skin INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  gold INTEGER NOT NULL DEFAULT 0,
  playtime INTEGER NOT NULL DEFAULT 0,
  save_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, slot_index)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.save_slots TO authenticated;
GRANT ALL ON public.save_slots TO service_role;

ALTER TABLE public.save_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own save slots"
  ON public.save_slots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_save_slots_updated_at
  BEFORE UPDATE ON public.save_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();