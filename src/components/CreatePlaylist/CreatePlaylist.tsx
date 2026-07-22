import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { uploadPlaylist } from '@/api/playlists.ts'
import { IMAGE_MIME_TYPES, type PlaylistForm, playlistSchema } from '@/schemas/playlists.ts'
import { useAuthStore } from '@/store/authStore.ts'
import type { UploadProps } from '@/types/utils.ts'
import './CreatePlaylist.scss'

const CreatePlaylist = (props: UploadProps) => {
	const { onClose } = props

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<PlaylistForm>({
		mode: 'onBlur',
		resolver: zodResolver(playlistSchema),
	})

	const descriptionLength = watch('description')?.length ?? 0

	const queryClient = useQueryClient()
	const { user } = useAuthStore()

	const [serverError, setServerError] = useState<string | null>(null)
	const [coverFileName, setCoverFileName] = useState('')

	const { mutate, isPending } = useMutation({
		mutationFn: (data: PlaylistForm) => uploadPlaylist({ data, userId: user!.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['playlists', user!.id] })
			onClose()
		},
		onError: (error) => setServerError(error.message),
	})

	if (!user) return null

	const authorFallback =
		user.user_metadata?.full_name ?? user.user_metadata?.user_name ?? user.email ?? 'Аноним'

	const onSubmit = (data: PlaylistForm) => {
		mutate({ ...data, author: data.author?.trim() || authorFallback })
	}

	return (
		<section className="create-playlist">
			<div className="create-playlist__card">
				<h2 className="create-playlist__title">Создать плейлист</h2>
				<form className="create-playlist__form" onSubmit={handleSubmit(onSubmit)}>
					<div className="create-playlist__field">
						<label htmlFor="titleInput" className="create-playlist__label">
							Название<span className="create-playlist__required">*</span>
						</label>
						<input
							type="text"
							className="create-playlist__input"
							{...register('title')}
							id="titleInput"
							autoComplete="off"
						/>
						{errors.title && <p className="create-playlist__error">{errors.title.message}</p>}
					</div>
					<div className="create-playlist__field">
						<label htmlFor="descriptionInput" className="create-playlist__label">
							Описание
						</label>
						<textarea
							className="create-playlist__textarea"
							{...register('description')}
							id="descriptionInput"
							rows={3}
							maxLength={64}
						/>
						{descriptionLength >= 64 && (
							<p className="create-playlist__error">Достигнут лимит — 64 символа</p>
						)}
						{errors.description && (
							<p className="create-playlist__error">{errors.description.message}</p>
						)}
					</div>
					<div className="create-playlist__field">
						<label htmlFor="authorInput" className="create-playlist__label">
							Автор
						</label>
						<input
							type="text"
							className="create-playlist__input"
							{...register('author')}
							id="authorInput"
							placeholder={authorFallback}
							autoComplete="off"
						/>
						{errors.author && <p className="create-playlist__error">{errors.author.message}</p>}
					</div>
					<div className="create-playlist__field">
						<label htmlFor="coverFileInput" className="create-playlist__label">
							Обложка
						</label>
						<label
							className={`create-playlist__dropzone${coverFileName ? ' create-playlist__dropzone--filled' : ''}`}
							htmlFor="coverFileInput"
						>
							<svg
								aria-hidden="true"
								className="create-playlist__dropzone-icon"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									d="M12 16V4M12 4l-4 4M12 4l4 4"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span className="create-playlist__dropzone-text">
								{coverFileName || 'Нажмите, чтобы выбрать обложку'}
							</span>
							<input
								type="file"
								className="create-playlist__file-input"
								{...register('coverFile', {
									onChange: (e) => setCoverFileName(e.target.files?.[0]?.name ?? ''),
								})}
								id="coverFileInput"
								accept={IMAGE_MIME_TYPES.join(',')}
							/>
						</label>
						{errors.coverFile && (
							<p className="create-playlist__error">{errors.coverFile.message}</p>
						)}
					</div>
					<button className="create-playlist__submit-button" type="submit" disabled={isPending}>
						{isPending ? 'Создаем плейлист' : 'Создать плейлист'}
					</button>
				</form>
				{serverError && <p className="create-playlist__error">{serverError}</p>}
			</div>
		</section>
	)
}

export default CreatePlaylist
