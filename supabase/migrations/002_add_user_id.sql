-- Add user_id to venues
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Index for user_id queries
CREATE INDEX IF NOT EXISTS venues_user_id_idx ON venues (user_id);

-- Update unique constraint to be scoped per user
DROP INDEX IF EXISTS venues_name_city_idx;
CREATE UNIQUE INDEX IF NOT EXISTS venues_name_city_user_idx ON venues (name, city, user_id);

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON venues;
DROP POLICY IF EXISTS "Allow service_role full access" ON venues;

-- RLS : each user sees only their own venues
CREATE POLICY "Users can select own venues" ON venues
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own venues" ON venues
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own venues" ON venues
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own venues" ON venues
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- service_role bypasses RLS entirely (used by NestJS backend)
-- No explicit policy needed for service_role
