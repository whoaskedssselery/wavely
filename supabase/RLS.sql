ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles - SELECT" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles - INSERT" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles - UPDATE" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Tracks - SELECT" ON tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Tracks - INSERT" ON tracks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tracks - UPDATE" ON tracks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Tracks - DELETE" ON tracks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Playlists - SELECT" ON playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Playlists - INSERT" ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Playlists - UPDATE" ON playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Playlists - DELETE" ON playlists FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Playlist_tracks - SELECT" ON playlist_tracks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM playlists
        WHERE playlists.id = playlist_id
        AND playlists.user_id = auth.uid()
    )
);
CREATE POLICY "Playlist_tracks - INSERT" ON playlist_tracks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_id
    AND playlists.user_id = auth.uid()
  )
);
CREATE POLICY "Playlist_tracks - UPDATE" ON playlist_tracks FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM playlists
        WHERE playlists.id = playlist_id
        AND playlists.user_id = auth.uid()
    )
);
CREATE POLICY "Playlist_tracks - DELETE" ON playlist_tracks FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM playlists
        WHERE playlists.id = playlist_id
        AND playlists.user_id = auth.uid()
    )
);