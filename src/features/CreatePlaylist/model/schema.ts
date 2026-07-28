import { z } from 'zod'

const MAX_FILE_SIZE = 100 * 1024 * 1024
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const playlistSchema = z.object({
	title: z.string().min(1, 'У плейлиста должно быть название!'),
	description: z.string().max(64, 'Описание не должно превышать 64 символа!').optional(),
	author: z.string().max(64, 'Имя автора не должно превышать 64 символа!').optional(),
	coverFile: z
		.instanceof(FileList)
		.refine(
			(files) => IMAGE_MIME_TYPES.includes(files[0]?.type) || files.length === 0,
			'Неверный формат файла!',
		)
		.refine(
			(files) => files[0]?.size <= MAX_FILE_SIZE || files.length === 0,
			'Размер обложки не должен превышать 100Мб!',
		)
		.optional(),
})

export type PlaylistForm = z.infer<typeof playlistSchema>
