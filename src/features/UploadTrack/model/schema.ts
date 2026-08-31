import { z } from 'zod'

const MAX_FILE_SIZE = 300 * 1024 * 1024
export const AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const trackSchema = z.object({
	title: z.string().min(1, 'У трека должно быть название!'),
	artist: z.string().min(1, 'У трека должен быть автор!'),
	audioFile: z
		.instanceof(FileList)
		.refine((files) => files.length > 0, 'Выберите файл!')
		.refine((files) => AUDIO_MIME_TYPES.includes(files[0]?.type), 'Неверный формат файла!')
		.refine((files) => files[0]?.size <= MAX_FILE_SIZE, 'Размер трека не должен превышать 300Мб!'),
	coverFile: z
		.instanceof(FileList)
		.refine(
			(files) => IMAGE_MIME_TYPES.includes(files[0]?.type) || files.length === 0,
			'Неверный формат файла!',
		)
		.refine(
			(files) => files[0]?.size <= MAX_FILE_SIZE || files.length === 0,
			'Размер обложки не должен превышать 300Мб!',
		)
		.optional(),
})

export type TrackForm = z.infer<typeof trackSchema>
