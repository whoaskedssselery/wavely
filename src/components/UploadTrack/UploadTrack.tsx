import { trackSchema, type TrackForm, AUDIO_MIME_TYPES, IMAGE_MIME_TYPES } from '@/schemas/tracks.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadTrack } from '@/api/tracks.ts'
import type { UploadProps } from '@/types/utils.ts'
import './UploadTrack.scss'

const UploadTrack = (props: UploadProps) => {
	const {
		onClose,
	} = props
	
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TrackForm>({
		mode: 'onBlur',
		resolver: zodResolver(trackSchema)
	})
	
	const queryClient = useQueryClient()
	const { user } = useAuthStore()
	
	const [serverError, setServerError] = useState<string | null>(null)
	const [audioFileName, setAudioFileName] = useState('')
	const [coverFileName, setCoverFileName] = useState('')
	
	if (!user) return null
	
	const { mutate, isPending } = useMutation({
		mutationFn: (data: TrackForm) => uploadTrack({ data, userId: user.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tracks', user.id] })
			onClose()
		},
		onError: error => setServerError(error.message),
	})
	
	const onSubmit = (data: TrackForm) => {
		mutate(data)
	}
	
	return (
		<section
			className="upload-track"
		>
			<div className="upload-track__card">
				<h2 className="upload-track__title">Добавить трек</h2>
				<form
					className="upload-track__form"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="upload-track__field">
						<label htmlFor="titleInput" className="upload-track__label">
							Название трека<span className="upload-track__required">*</span>
						</label>
						<input
							type="text"
							className="upload-track__input"
							{...register('title')}
							id="titleInput"
							autoComplete="off"
						/>
						{errors.title && <p className="upload-track__error">{errors.title.message}</p>}
					</div>
					<div className="upload-track__field">
						<label htmlFor="artistInput" className="upload-track__label">
							Автор<span className="upload-track__required">*</span>
						</label>
						<input
							type="text"
							className="upload-track__input"
							{...register('artist')}
							id="artistInput"
							autoComplete="off"
						/>
						{errors.artist && <p className="upload-track__error">{errors.artist.message}</p>}
					</div>
					<div className="upload-track__field">
						<label htmlFor="audioFileInput" className="upload-track__label">
							Трек<span className="upload-track__required">*</span>
						</label>
						<label
							className={`upload-track__dropzone${audioFileName ? ' upload-track__dropzone--filled' : ''}`}
							htmlFor="audioFileInput"
						>
							<svg className="upload-track__dropzone-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<span className="upload-track__dropzone-text">
								{audioFileName || 'Нажмите, чтобы выбрать аудиофайл'}
							</span>
							<input
								type="file"
								className="upload-track__file-input"
								{...register('audioFile', {
									onChange: (e) => setAudioFileName(e.target.files?.[0]?.name ?? ''),
								})}
								id="audioFileInput"
								accept={AUDIO_MIME_TYPES.join(',')}
							/>
						</label>
						{errors.audioFile && <p className="upload-track__error">{errors.audioFile.message}</p>}
					</div>
					<div className="upload-track__field">
						<label htmlFor="coverFileInput" className="upload-track__label">Обложка</label>
						<label
							className={`upload-track__dropzone${coverFileName ? ' upload-track__dropzone--filled' : ''}`}
							htmlFor="coverFileInput"
						>
							<svg className="upload-track__dropzone-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<span className="upload-track__dropzone-text">
								{coverFileName || 'Нажмите, чтобы выбрать обложку'}
							</span>
							<input
								type="file"
								className="upload-track__file-input"
								{...register('coverFile', {
									onChange: (e) => setCoverFileName(e.target.files?.[0]?.name ?? ''),
								})}
								id="coverFileInput"
								accept={IMAGE_MIME_TYPES.join(',')}
							/>
						</label>
						{errors.coverFile && <p className="upload-track__error">{errors.coverFile.message}</p>}
					</div>
					<button className="upload-track__submit-button" type="submit" disabled={isPending}>{isPending ? "Загружаем трек" : "Загрузить трек"}</button>
				</form>
				{serverError && <p className="upload-track__error">{serverError}</p>}
			</div>
		</section>
	)
}

export default UploadTrack