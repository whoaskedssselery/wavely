import { supabase } from '@/shared/lib/supabase.ts'
import { unwrap } from '@/shared/lib/unwrap.ts'

export const cleanupFiles = async (paths: {
	audioPath?: string | null
	coverPath?: string | null
}): Promise<void> => {
	const { audioPath, coverPath } = paths

	if (audioPath) {
		const { error } = await supabase.storage.from('audio').remove([audioPath])
		if (error) console.error('Не получилось удалить аудио-файл:', error)
	}

	if (coverPath) {
		const { error } = await supabase.storage.from('covers').remove([coverPath])
		if (error) console.error('Не получилось удалить обложку:', error)
	}
}

export const removeFileIfUnused = async (
	bucket: 'audio' | 'covers',
	path: string | null,
): Promise<void> => {
	const column = bucket === 'audio' ? 'audio_path' : 'cover_path'

	if (!path) return

	const tracksData = await unwrap(supabase.from('tracks').select('*').eq(column, path))
	const playlistTracksData = await unwrap(
		supabase.from('playlist_tracks').select('*').eq(column, path),
	)

	if (tracksData.length === 0 && playlistTracksData.length === 0) {
		const { error: removeError } = await supabase.storage.from(bucket).remove([path])

		if (removeError) {
			console.error(removeError)
		}
	}
}
