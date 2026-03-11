-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  email TEXT,
  google_maps_url TEXT,
  rating DECIMAL(3,1),
  reviews_count INTEGER,
  category TEXT CHECK (category IN ('guinguette', 'bar', 'peniche', 'club', 'tiers-lieu', 'restaurant musical', 'festival spot', 'autre')),
  status TEXT NOT NULL DEFAULT 'to_contact' CHECK (status IN ('to_contact', 'contacted', 'discussion', 'booked', 'no_response', 'not_interested')),
  notes TEXT,
  last_contact_date DATE,
  next_followup_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint to avoid duplicates
CREATE UNIQUE INDEX IF NOT EXISTS venues_name_city_idx ON venues (name, city);

-- Index for common queries
CREATE INDEX IF NOT EXISTS venues_status_idx ON venues (status);
CREATE INDEX IF NOT EXISTS venues_city_idx ON venues (city);
CREATE INDEX IF NOT EXISTS venues_next_followup_idx ON venues (next_followup_date);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - optional but good practice
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (or service_role bypasses RLS)
CREATE POLICY "Allow all for authenticated" ON venues
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow service_role full access (used by backend)
CREATE POLICY "Allow service_role full access" ON venues
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
