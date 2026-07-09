import { z } from "zod"

const MAX_FILE_SIZE = 100 * 1024 * 1024
const AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const trackSchema = z.object({
	title: z.string().min(1, 'У трека должно быть название!'),
	audioFile: z
		.instanceof(FileList)
		.refine(files => files.length > 0, 'Выберите файл!')
		.refine(files => AUDIO_MIME_TYPES.includes(files[0]?.type), 'Неверный формат файла!')
		.refine(files => files[0]?.size <= MAX_FILE_SIZE, 'Размер трека не должен превышать 100Мб!'),
	coverFile: z
		.instanceof(FileList)
		.refine(files => IMAGE_MIME_TYPES.includes(files[0]?.type) || files.length === 0, 'Неверный формат файла!')
		.refine(files => files[0]?.size <= MAX_FILE_SIZE || files.length === 0, 'Размер обложки не должен превышать 100Мб!')
		.optional()
})

export type TrackForm = z.infer<typeof trackSchema>
