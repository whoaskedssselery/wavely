CREATE OR REPLACE FUNCTION reorder_playlist_tracks(updates jsonb)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE playlist_tracks AS pt
  SET position = (u->>'position')::int
  FROM jsonb_array_elements(updates) AS u
  WHERE pt.id = (u->>'id')::uuid;
$$;

GRANT EXECUTE ON FUNCTION reorder_playlist_tracks(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION record_track_play(
    p_audio_path TEXT,
    p_title TEXT,
    p_artist TEXT,
    p_cover_path TEXT
)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO track_play_counts (user_id, audio_path, title, artist, cover_path, play_count, last_played_at)
  VALUES (auth.uid(), p_audio_path, p_title, p_artist, p_cover_path, 1, now())
  ON CONFLICT (user_id, audio_path)
  DO UPDATE SET
    play_count = track_play_counts.play_count + 1,
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    cover_path = EXCLUDED.cover_path,
    last_played_at = EXCLUDED.last_played_at;
$$;

GRANT EXECUTE ON FUNCTION record_track_play(text, text, text, text) TO authenticated;
