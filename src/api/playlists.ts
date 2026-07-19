import { removeFileIfUnused } from '@/api/storage.ts'
import { supabase } from '@/lib/supabase.ts'
import type { Playlist, PlaylistTrack, UploadPlaylistParams } from '@/types/playlists.ts'
import type { PlayableTrack } from '@/types/tracks.ts'

export const fetchPlaylists = async (userId: string): Promise<Playlist[]> => {
	const { data: fetchData, error: fetchError } = await supabase
		.from('playlists')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })

	if (fetchError) {
		throw fetchError
	}

	return fetchData
}

export const fetchPlaylist = async (playlistId: string): Promise<Playlist> => {
	const { data: fetchData, error: fetchError } = await supabase
		.from('playlists')
		.select('*')
		.eq('id', playlistId)

	if (fetchError) {
		throw fetchError
	}

	return fetchData[0]
}

export const fetchPlaylistTracks = async (playlistId: string): Promise<PlaylistTrack[]> => {
	const { data: fetchData, error: fetchError } = await supabase
		.from('playlist_tracks')
		.select('*')
		.eq('playlist_id', playlistId)
		.order('position', { ascending: false })

	if (fetchError) {
		throw fetchError
	}

	return fetchData
}

export const uploadPlaylist = async ({ data, userId }: UploadPlaylistParams): Promise<void> => {
	let coverPath: string | null = null

	if (data.coverFile && data.coverFile.length > 0) {
		const coverFile = data.coverFile[0]
		coverPath = `${userId}/${Date.now()}-${coverFile.name}`

		const { error: uploadError } = await supabase.storage
			.from('covers')
			.upload(coverPath, coverFile)

		if (uploadError) {
			await cleanupUploadedFiles(coverPath)
			throw uploadError
		}
	}

	const { error: submitError } = await supabase.from('playlists').insert({
		user_id: userId,
		title: data.title,
		description: data.description ?? null,
		cover_path: coverPath,
	})

	if (submitError) {
		await cleanupUploadedFiles(coverPath)
		throw submitError
	}
}

export const addTrackToPlaylist = async (
	data: PlayableTrack,
	playlistId: string,
): Promise<void> => {
	const { data: maxData, error: maxDataError } = await supabase
		.from('playlist_tracks')
		.select('position')
		.eq('playlist_id', playlistId)
		.order('position', { ascending: false })
		.limit(1)

	if (maxDataError) {
		throw maxDataError
	}

	const { error: uploadError } = await supabase.from('playlist_tracks').insert({
		playlist_id: playlistId,
		title: data.title,
		artist: data.artist,
		duration: data.duration,
		audio_path: data.audio_path,
		cover_path: data.cover_path,
		position: maxData[0] ? maxData[0].position + 1 : 1,
	})

	if (uploadError) {
		throw uploadError
	}
}

export const removeTrackFromPlaylist = async (playlistTrackId: string): Promise<void> => {
	const { data: removeData, error: removeError } = await supabase
		.from('playlist_tracks')
		.delete()
		.eq('id', playlistTrackId)
		.select()

	if (removeError) {
		throw removeError
	}

	await removeFileIfUnused('audio', removeData[0].audio_path)
	await removeFileIfUnused('covers', removeData[0].cover_path)
}

export const fetchPlaylistIdsWithTrack = async (audioPath: string): Promise<string[]> => {
	const { data: fetchData, error: fetchError } = await supabase
		.from('playlist_tracks')
		.select('playlist_id')
		.eq('audio_path', audioPath)

	if (fetchError) {
		throw fetchError
	}

	return fetchData.map((row) => row.playlist_id)
}

export const deletePlaylist = async (playlistId: string): Promise<void> => {
	const { data: deleteData, error: deleteError } = await supabase
		.from('playlists')
		.delete()
		.select()
		.eq('id', playlistId)
	
	if (deleteError) {
		throw deleteError
	}
	
	await removeFileIfUnused('covers', deleteData[0].cover_path)
}

const cleanupUploadedFiles = async (coverPath: string | null) => {
	if (coverPath) {
		const { error: coverCleanupError } = await supabase.storage.from('covers').remove([coverPath])
		if (coverCleanupError)
			console.error('Не получилось удалить обложку плейлиста:', coverCleanupError)
	}
}
