-- ============================================================
-- Tourbook — Supabase Database Schema
-- Run this in the Supabase SQL editor to set up your database
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Tables
-- ============================================================

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  is_public     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logged concerts
CREATE TABLE shows (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artist_name           TEXT NOT NULL,
  artist_mbid           TEXT,                  -- MusicBrainz ID (from Setlist.fm)
  artist_setlistfm_id   TEXT,
  venue_name            TEXT NOT NULL,
  venue_city            TEXT NOT NULL,
  venue_state           TEXT,
  venue_country         TEXT NOT NULL,
  venue_lat             DOUBLE PRECISION,
  venue_lng             DOUBLE PRECISION,
  show_date             DATE NOT NULL,
  setlist_id            TEXT,                  -- Setlist.fm setlist ID
  overall_rating        SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
  sound_rating          SMALLINT CHECK (sound_rating BETWEEN 1 AND 5),
  crowd_rating          SMALLINT CHECK (crowd_rating BETWEEN 1 AND 5),
  setlist_rating        SMALLINT CHECK (setlist_rating BETWEEN 1 AND 5),
  venue_rating          SMALLINT CHECK (venue_rating BETWEEN 1 AND 5),
  other_acts            TEXT,                  -- Other acts on the bill (free text, optionally auto-filled)
  notes                 TEXT,
  is_public             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration for existing databases:
-- ALTER TABLE shows ADD COLUMN other_acts TEXT;
-- Or if you already ran the previous migration: ALTER TABLE shows RENAME COLUMN openers TO other_acts;

-- Songs from a show's setlist
CREATE TABLE setlist_songs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id         UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  song_name       TEXT NOT NULL,
  position        SMALLINT NOT NULL,
  is_encore       BOOLEAN NOT NULL DEFAULT false,
  is_highlighted  BOOLEAN NOT NULL DEFAULT false
);

-- Photos attached to a show (stored in Supabase Storage)
CREATE TABLE show_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id       UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social follows
CREATE TABLE follows (
  follower_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- Artist genre cache (populated from Setlist.fm/MusicBrainz tags)
CREATE TABLE artist_genres (
  artist_mbid   TEXT PRIMARY KEY,
  artist_name   TEXT NOT NULL,
  genres        TEXT[] NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX shows_user_id_idx       ON shows(user_id);
CREATE INDEX shows_show_date_idx     ON shows(show_date DESC);
CREATE INDEX shows_artist_mbid_idx   ON shows(artist_mbid);
CREATE INDEX setlist_songs_show_idx  ON setlist_songs(show_id);
CREATE INDEX follows_follower_idx    ON follows(follower_id);
CREATE INDEX follows_following_idx   ON follows(following_id);

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Use explicitly chosen username as-is; only append UUID suffix for auto-generated fallbacks
  IF NEW.raw_user_meta_data->>'username' IS NOT NULL AND NEW.raw_user_meta_data->>'username' != '' THEN
    generated_username := NEW.raw_user_meta_data->>'username';
  ELSE
    generated_username := COALESCE(
      NULLIF(regexp_replace(split_part(COALESCE(NEW.email, ''), '@', 1), '[^a-zA-Z0-9_]', '', 'g'), ''),
      'user'
    ) || '_' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1), 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_photos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_genres ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles viewable when public or own"
  ON profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Shows
CREATE POLICY "Shows viewable when public or own"
  ON shows FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own shows"
  ON shows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shows"
  ON shows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shows"
  ON shows FOR DELETE
  USING (auth.uid() = user_id);

-- Setlist songs (visible when parent show is visible)
CREATE POLICY "Songs visible when show is visible"
  ON setlist_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shows
      WHERE shows.id = setlist_songs.show_id
        AND (shows.is_public = true OR shows.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage songs for their shows"
  ON setlist_songs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM shows
      WHERE shows.id = setlist_songs.show_id
        AND shows.user_id = auth.uid()
    )
  );

-- Show photos (visible when parent show is visible)
CREATE POLICY "Photos visible when show is visible"
  ON show_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shows
      WHERE shows.id = show_photos.show_id
        AND (shows.is_public = true OR shows.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage photos for their shows"
  ON show_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM shows
      WHERE shows.id = show_photos.show_id
        AND shows.user_id = auth.uid()
    )
  );

-- Follows
CREATE POLICY "Follows are publicly viewable"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON follows FOR ALL
  USING (auth.uid() = follower_id);

-- Artist genres (read-only for all authenticated users)
CREATE POLICY "Artist genres readable by all"
  ON artist_genres FOR SELECT
  USING (true);

-- ============================================================
-- Storage bucket for show photos
-- ============================================================
-- Run this separately after creating the bucket in the Supabase dashboard:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('show-photos', 'show-photos', true);

CREATE POLICY "Users can upload their own show photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'show-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own show photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'show-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
