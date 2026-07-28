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
