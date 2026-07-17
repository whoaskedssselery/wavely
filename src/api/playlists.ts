import { supabase } from '@/lib/supabase.ts'
import { type Playlist, type UploadPlaylistParams, type PlaylistTrack } from '@/types/playlists.ts'

export const fetchPlaylists = async ( userId: string ): Promise<Playlist[]> => {
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
		.eq('playlist_id', playlistId )
		.order('position', { ascending: false })
	
	if (fetchError) {
		throw fetchError
	}
	
	return fetchData
}

export const uploadPlaylist = async ({ data, userId }: UploadPlaylistParams ): Promise<void> => {
	let coverPath : string | null = null
	
	if (data.coverFile && data.coverFile.length > 0) {
		const coverFile = data.coverFile[0]
		coverPath = `${userId}/${Date.now()}-${coverFile.name}`
		
		const { error: uploadError } = await supabase
			.storage
			.from('covers')
			.upload(coverPath, coverFile)
		
		if (uploadError) {
			await cleanupUploadedFiles(coverPath)
			throw uploadError
		}
	}
	
	const { error: submitError } = await supabase
		.from('playlists')
		.insert({
			user_id: userId,
			title: data.title,
			description: data.description ?? null,
			cover_path: coverPath
		})
	
	if (submitError) {
		await cleanupUploadedFiles(coverPath)
		throw submitError
	}
}

const cleanupUploadedFiles = async (coverPath: string | null) => {
	if (coverPath) {
		const { error: coverCleanupError } = await supabase.storage.from('covers').remove([coverPath])
		if (coverCleanupError) console.error('Не получилось удалить обложку плейлиста:', coverCleanupError)
	}
}