import { supabase } from '@/lib/supabase.ts'

export const removeFileIfUnused = async (
	bucket: 'audio' | 'covers',
	path: string | null,
): Promise<void> => {
	const column = bucket === 'audio' ? 'audio_path' : 'cover_path'

	if (!path) return

	const { data: tracksData, error: tracksError } = await supabase
		.from('tracks')
		.select('*')
		.eq(column, path)

	if (tracksError) {
		throw tracksError
	}

	const { data: playlistTracksData, error: playlistTracksError } = await supabase
		.from('playlist_tracks')
		.select('*')
		.eq(column, path)

	if (playlistTracksError) {
		throw playlistTracksError
	}

	if (tracksData.length === 0 && playlistTracksData.length === 0) {
		const { error: removeError } = await supabase.storage.from(bucket).remove([path])

		if (removeError) {
			console.error(removeError)
		}
	}
}
