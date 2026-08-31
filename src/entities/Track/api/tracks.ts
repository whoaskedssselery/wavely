import { getAudioDuration } from '@/entities/Track/lib/media.ts'
import type { Track, UploadTrackParams } from '@/entities/Track/model/types.ts'
import { CACHE_ONE_YEAR } from '@/shared/api/cache.ts'
import { cleanupFiles, removeFileIfUnused } from '@/shared/api/storage.ts'
import compressCover from '@/shared/lib/compressImage.ts'
import { supabase } from '@/shared/lib/supabase.ts'
import { throwOnError, unwrap } from '@/shared/lib/unwrap.ts'

export const fetchTracks = async (userId: string): Promise<Track[]> => {
	return unwrap(
		supabase.from('tracks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
	)
}

export const uploadTrack = async ({ data, userId }: UploadTrackParams): Promise<void> => {
	const audioFile = data.audioFile[0]
	let coverPath: string | null = null
	let duration: number
	const audioExtension = audioFile.name.split('.').pop()
	const audioPath = `${userId}/${Date.now()}.${audioExtension}`

	await throwOnError(
		supabase.storage.from('audio').upload(audioPath, audioFile, { cacheControl: CACHE_ONE_YEAR }),
	)

	if (data.coverFile && data.coverFile.length > 0) {
		const coverFile = await compressCover(data.coverFile[0])
		const coverExtension = coverFile.name.split('.').pop()
		coverPath = `${userId}/${Date.now()}.${coverExtension}`

		const { error: uploadError } = await supabase.storage
			.from('covers')
			.upload(coverPath, coverFile, { cacheControl: CACHE_ONE_YEAR })

		if (uploadError) {
			await cleanupFiles({ audioPath })
			throw uploadError
		}
	}

	try {
		duration = Math.round(await getAudioDuration(audioFile))
		if (!Number.isFinite(duration)) throw new Error('non-finite duration')
	} catch {
		await cleanupFiles({ audioPath, coverPath })
		throw new Error('Не удалось прочитать длительность трека')
	}

	const { error: submitError } = await supabase.from('tracks').insert({
		user_id: userId,
		title: data.title,
		artist: data.artist,
		duration,
		audio_path: audioPath,
		cover_path: coverPath,
	})

	if (submitError) {
		await cleanupFiles({ audioPath, coverPath })
		throw submitError
	}
}

export const TRACK_AUDIO_URL_STALE_TIME = 5.5 * 60 * 60 * 1000

export const getTrackAudioUrl = async (audioPath: string): Promise<string> => {
	const data = await unwrap(supabase.storage.from('audio').createSignedUrl(audioPath, 21600))
	return data.signedUrl
}

export const deleteTrack = async (trackId: string): Promise<void> => {
	const removeData = await unwrap(supabase.from('tracks').delete().eq('id', trackId).select())

	if (removeData.length === 0) {
		throw new Error('Трек уже удалён')
	}

	await removeFileIfUnused('audio', removeData[0].audio_path)
	await removeFileIfUnused('covers', removeData[0].cover_path)
}
