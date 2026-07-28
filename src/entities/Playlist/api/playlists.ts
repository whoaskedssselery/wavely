import type {
	Playlist,
	PlaylistTrack,
	UploadPlaylistParams,
} from '@/entities/playlist/model/types.ts'
import type { PlayableTrack } from '@/entities/track/model/types.ts'
import { cleanupFiles, removeFileIfUnused } from '@/shared/api/storage.ts'
import { supabase } from '@/shared/lib/supabase.ts'
import type { ArrayToUpdate } from '@/shared/types/utils.ts'

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

export const fetchPlaylist = async (playlistId: string): Promise<Playlist | null> => {
	const { data: fetchData, error: fetchError } = await supabase
		.from('playlists')
		.select('*')
		.eq('id', playlistId)

	if (fetchError) {
		throw fetchError
	}

	return fetchData[0] ?? null
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

export const fetchAllPlaylistTracks = async (userId: string): Promise<PlaylistTrack[]> => {
	const { data: fetchData, error: fetchError } = await supabase
		.from('playlist_tracks')
		.select('*, playlists!inner(user_id)')
		.eq('playlists.user_id', userId)

	if (fetchError) {
		throw fetchError
	}

	return fetchData
}

export const uploadPlaylist = async ({ data, userId }: UploadPlaylistParams): Promise<void> => {
	let coverPath: string | null = null

	if (data.coverFile && data.coverFile.length > 0) {
		const coverFile = data.coverFile[0]
		const coverExtension = coverFile.name.split('.').pop()
		coverPath = `${userId}/${Date.now()}.${coverExtension}`

		const { error: uploadError } = await supabase.storage
			.from('covers')
			.upload(coverPath, coverFile)

		if (uploadError) {
			await cleanupFiles({ coverPath })
			throw uploadError
		}
	}

	const { error: submitError } = await supabase.from('playlists').insert({
		user_id: userId,
		title: data.title,
		description: data.description ?? null,
		author: data.author ?? null,
		cover_path: coverPath,
	})

	if (submitError) {
		await cleanupFiles({ coverPath })
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

	if (removeData.length === 0) {
		throw new Error('Трек уже удалён из плейлиста')
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

export const updatePlaylistDescription = async (
	playlistId: string,
	description: string,
): Promise<void> => {
	const { error: updateError } = await supabase
		.from('playlists')
		.update({ description: description || null })
		.eq('id', playlistId)

	if (updateError) {
		throw updateError
	}
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

	if (deleteData.length === 0) {
		throw new Error('Плейлист уже удалён')
	}

	await removeFileIfUnused('covers', deleteData[0].cover_path)
}

export const updatePlaylistTitle = async (playlistId: string, title: string): Promise<void> => {
	const { error: updateError } = await supabase
		.from('playlists')
		.update({ title })
		.eq('id', playlistId)

	if (updateError) {
		throw updateError
	}
}

export const updatePlaylistCover = async (
	playlistId: string,
	userId: string,
	coverFile: File,
	oldCoverPath: string | null,
): Promise<void> => {
	const coverExtension = coverFile.name.split('.').pop()
	const newCoverPath = `${userId}/${Date.now()}.${coverExtension}`

	const { error: uploadError } = await supabase.storage
		.from('covers')
		.upload(newCoverPath, coverFile)

	if (uploadError) {
		throw uploadError
	}

	const { error: updateError } = await supabase
		.from('playlists')
		.update({ cover_path: newCoverPath })
		.eq('id', playlistId)

	if (updateError) {
		await supabase.storage.from('covers').remove([newCoverPath])
		throw updateError
	}

	if (oldCoverPath) {
		await supabase.storage.from('covers').remove([oldCoverPath])
	}
}

export const reorderPlaylistTracks = async (tracks: PlayableTrack[]): Promise<void> => {
	const arrayToUpdate: ArrayToUpdate = []

	tracks.forEach((track, index) => {
		const newPosition = tracks.length - index
		if (newPosition !== track.position) {
			arrayToUpdate.push({ id: track.id, position: newPosition })
		}
	})

	const { error: rpcError } = await supabase.rpc('reorder_playlist_tracks', {
		updates: arrayToUpdate,
	})

	if (rpcError) {
		throw rpcError
	}
}
