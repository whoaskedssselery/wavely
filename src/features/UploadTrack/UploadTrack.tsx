import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { uploadTrack } from '@/entities/Track/api/tracks.ts'
import {
	AUDIO_MIME_TYPES,
	IMAGE_MIME_TYPES,
	type TrackForm,
	trackSchema,
} from '@/features/UploadTrack/model/schema.ts'
import useAuthedUser from '@/shared/lib/useAuthedUser.ts'
import type { UploadProps } from '@/shared/types/utils.ts'
import { UploadIcon } from '@/shared/ui/icons'
import './UploadTrack.scss'

const UploadTrack = (props: UploadProps) => {
	const { onClose } = props

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TrackForm>({
		mode: 'onBlur',
		resolver: zodResolver(trackSchema),
	})

	const queryClient = useQueryClient()
	const user = useAuthedUser()

	const [serverError, setServerError] = useState<string | null>(null)
	const [audioFileName, setAudioFileName] = useState('')
	const [coverFileName, setCoverFileName] = useState('')

	const { mutate, isPending } = useMutation({
		mutationFn: (data: TrackForm) => uploadTrack({ data, userId: user.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tracks', user.id] })
			onClose()
		},
		onError: (error) => setServerError(error.message),
	})

	const onSubmit = (data: TrackForm) => {
		mutate(data)
	}

	return (
		<section className="upload-track">
			<div className="upload-track__card">
				<h2 className="upload-track__title">Добавить трек</h2>
				<form className="upload-track__form" onSubmit={handleSubmit(onSubmit)}>
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
							<span className="upload-track__dropzone-icon">
								<UploadIcon />
							</span>
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
						<label htmlFor="coverFileInput" className="upload-track__label">
							Обложка
						</label>
						<label
							className={`upload-track__dropzone${coverFileName ? ' upload-track__dropzone--filled' : ''}`}
							htmlFor="coverFileInput"
						>
							<span className="upload-track__dropzone-icon">
								<UploadIcon />
							</span>
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
					<button className="upload-track__submit-button" type="submit" disabled={isPending}>
						{isPending ? 'Загружаем трек' : 'Загрузить трек'}
					</button>
				</form>
				{serverError && <p className="upload-track__error">{serverError}</p>}
			</div>
		</section>
	)
}

export default UploadTrack
