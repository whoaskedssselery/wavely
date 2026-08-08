import type {
	Playlist,
	PlaylistTrack,
	UploadPlaylistParams,
} from '@/entities/Playlist/model/types.ts'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'
import { CACHE_ONE_YEAR } from '@/shared/api/cache.ts'
import { cleanupFiles, removeFileIfUnused } from '@/shared/api/storage.ts'
import compressCover from '@/shared/lib/compressImage.ts'
import { supabase } from '@/shared/lib/supabase.ts'
import { throwOnError, unwrap } from '@/shared/lib/unwrap.ts'
import type { ArrayToUpdate } from '@/shared/types/utils.ts'

export const fetchPlaylists = async (userId: string): Promise<Playlist[]> => {
	return unwrap(
		supabase
			.from('playlists')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false }),
	)
}

export const fetchPlaylist = async (playlistId: string): Promise<Playlist | null> => {
	const data = await unwrap(supabase.from('playlists').select('*').eq('id', playlistId))
	return data[0] ?? null
}

export const fetchPlaylistTracks = async (playlistId: string): Promise<PlaylistTrack[]> => {
	return unwrap(
		supabase
			.from('playlist_tracks')
			.select('*')
			.eq('playlist_id', playlistId)
			.order('position', { ascending: false }),
	)
}

export const fetchAllPlaylistTracks = async (userId: string): Promise<PlaylistTrack[]> => {
	return unwrap(
		supabase.from('playlist_tracks').select('*, playlists!inner(user_id)').eq('playlists.user_id', userId),
	)
}

export const uploadPlaylist = async ({ data, userId }: UploadPlaylistParams): Promise<void> => {
	let coverPath: string | null = null

	if (data.coverFile && data.coverFile.length > 0) {
		const coverFile = await compressCover(data.coverFile[0])
		const coverExtension = coverFile.name.split('.').pop()
		coverPath = `${userId}/${Date.now()}.${coverExtension}`

		const { error: uploadError } = await supabase.storage
			.from('covers')
			.upload(coverPath, coverFile, { cacheControl: CACHE_ONE_YEAR })

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
	const maxData = await unwrap(
		supabase
			.from('playlist_tracks')
			.select('position')
			.eq('playlist_id', playlistId)
			.order('position', { ascending: false })
			.limit(1),
	)

	await throwOnError(
		supabase.from('playlist_tracks').insert({
			playlist_id: playlistId,
			title: data.title,
			artist: data.artist,
			duration: data.duration,
			audio_path: data.audio_path,
			cover_path: data.cover_path,
			position: maxData[0] ? maxData[0].position + 1 : 1,
		}),
	)
}

export const removeTrackFromPlaylist = async (playlistTrackId: string): Promise<void> => {
	const removeData = await unwrap(
		supabase.from('playlist_tracks').delete().eq('id', playlistTrackId).select(),
	)

	if (removeData.length === 0) {
		throw new Error('Трек уже удалён из плейлиста')
	}

	await removeFileIfUnused('audio', removeData[0].audio_path)
	await removeFileIfUnused('covers', removeData[0].cover_path)
}

export const fetchPlaylistIdsWithTrack = async (audioPath: string): Promise<string[]> => {
	const data = await unwrap(
		supabase.from('playlist_tracks').select('playlist_id').eq('audio_path', audioPath),
	)

	return data.map((row) => row.playlist_id)
}

export const updatePlaylistDescription = async (
	playlistId: string,
	description: string,
): Promise<void> => {
	await throwOnError(
		supabase
			.from('playlists')
			.update({ description: description || null })
			.eq('id', playlistId),
	)
}

export const deletePlaylist = async (playlistId: string): Promise<void> => {
	const tracksData = await unwrap(
		supabase.from('playlist_tracks').select('audio_path, cover_path').eq('playlist_id', playlistId),
	)

	const deleteData = await unwrap(
		supabase.from('playlists').delete().select().eq('id', playlistId),
	)

	if (deleteData.length === 0) {
		throw new Error('Плейлист уже удалён')
	}

	await removeFileIfUnused('covers', deleteData[0].cover_path)

	for (const track of tracksData) {
		await removeFileIfUnused('audio', track.audio_path)
		await removeFileIfUnused('covers', track.cover_path)
	}
}

export const updatePlaylistTitle = async (playlistId: string, title: string): Promise<void> => {
	await throwOnError(supabase.from('playlists').update({ title }).eq('id', playlistId))
}

export const updatePlaylistCover = async (
	playlistId: string,
	userId: string,
	coverFile: File,
	oldCoverPath: string | null,
): Promise<void> => {
	const compressedCover = await compressCover(coverFile)
	const coverExtension = compressedCover.name.split('.').pop()
	const newCoverPath = `${userId}/${Date.now()}.${coverExtension}`

	await throwOnError(
		supabase.storage
			.from('covers')
			.upload(newCoverPath, compressedCover, { cacheControl: CACHE_ONE_YEAR }),
	)

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

	await throwOnError(supabase.rpc('reorder_playlist_tracks', { updates: arrayToUpdate }))
}
