CREATE POLICY "Audio - SELECT"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Audio - INSERT"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Audio - DELETE"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Covers - SELECT"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Covers - INSERT"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Covers - DELETE"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars - SELECT"
ON storage.objects FOR SELECT
                                  USING (
                                  bucket_id = 'avatars'
                                  AND auth.uid()::text = (storage.foldername(name))[1]
                                  );

CREATE POLICY "Avatars - INSERT"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars - DELETE"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);