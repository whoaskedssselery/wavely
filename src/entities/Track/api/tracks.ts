import { getAudioDuration } from '@/entities/Track/lib/media.ts'
import type { Track, UploadTrackParams } from '@/entities/Track/model/types.ts'
import { CACHE_ONE_YEAR } from '@/shared/api/cache.ts'
import { cleanupFiles, removeFileIfUnused } from '@/shared/api/storage.ts'
import compressCover from '@/shared/lib/compressImage.ts'
import { supabase } from '@/shared/lib/supabase.ts'

export const fetchTracks = async (userId: string): Promise<Track[]> => {
	const { data, error: fetchError } = await supabase
		.from('tracks')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })

	if (fetchError) {
		throw fetchError
	}

	return data
}

export const uploadTrack = async ({ data, userId }: UploadTrackParams): Promise<void> => {
	const audioFile = data.audioFile[0]
	let coverPath: string | null = null
	let duration: number
	const audioExtension = audioFile.name.split('.').pop()
	const audioPath = `${userId}/${Date.now()}.${audioExtension}`

	const { error: uploadError } = await supabase.storage
		.from('audio')
		.upload(audioPath, audioFile, { cacheControl: CACHE_ONE_YEAR })

	if (uploadError) {
		throw uploadError
	}

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

export const getTrackAudioUrl = async (audioPath: string): Promise<string> => {
	const { data, error: getUrlError } = await supabase.storage
		.from('audio')
		.createSignedUrl(audioPath, 3600)

	if (getUrlError) {
		throw getUrlError
	}

	return data.signedUrl
}

export const deleteTrack = async (trackId: string): Promise<void> => {
	const { data: removeData, error: removeError } = await supabase
		.from('tracks')
		.delete()
		.eq('id', trackId)
		.select()

	if (removeError) {
		throw removeError
	}

	if (removeData.length === 0) {
		throw new Error('Трек уже удалён')
	}

	await removeFileIfUnused('audio', removeData[0].audio_path)
	await removeFileIfUnused('covers', removeData[0].cover_path)
}
