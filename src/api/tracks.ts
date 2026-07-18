import { removeFileIfUnused } from '@/api/storage.ts'
import { supabase } from '@/lib/supabase.ts'
import type { Track, UploadTrackParams } from '@/types/tracks.ts'

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
	const audioPath = `${userId}/${Date.now()}-${audioFile.name}`

	const { error: uploadError } = await supabase.storage.from('audio').upload(audioPath, audioFile)

	if (uploadError) {
		throw uploadError
	}

	if (data.coverFile && data.coverFile.length > 0) {
		const coverFile = data.coverFile[0]
		coverPath = `${userId}/${Date.now()}-${coverFile.name}`

		const { error: uploadError } = await supabase.storage
			.from('covers')
			.upload(coverPath, coverFile)

		if (uploadError) {
			await cleanupUploadedFiles(audioPath, null)
			throw uploadError
		}
	}

	try {
		duration = Math.round(await getAudioDuration(audioFile))
	} catch {
		await cleanupUploadedFiles(audioPath, coverPath)
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
		await cleanupUploadedFiles(audioPath, coverPath)
		throw submitError
	}
}

const getAudioDuration = (file: File): Promise<number> => {
	return new Promise((resolve, reject) => {
		const audio = new Audio()
		const fileUrl = URL.createObjectURL(file)
		audio.src = fileUrl
		audio.addEventListener('loadedmetadata', () => {
			URL.revokeObjectURL(fileUrl)
			resolve(audio.duration)
		})
		audio.addEventListener('error', () => {
			reject(new Error('Не удалось прочитать метаданные аудиофайла'))
			URL.revokeObjectURL(fileUrl)
		})
	})
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

	await removeFileIfUnused('audio', removeData[0].audio_path)
	await removeFileIfUnused('covers', removeData[0].cover_path)
}

const cleanupUploadedFiles = async (audioPath: string, coverPath: string | null) => {
	const { error: audioCleanupError } = await supabase.storage.from('audio').remove([audioPath])
	if (audioCleanupError) console.error('Не получилось удалить аудио-файл:', audioCleanupError)

	if (coverPath) {
		const { error: coverCleanupError } = await supabase.storage.from('covers').remove([coverPath])
		if (coverCleanupError) console.error('Не получилось удалить обложку трека:', coverCleanupError)
	}
}
