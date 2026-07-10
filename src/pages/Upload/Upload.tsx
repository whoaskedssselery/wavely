import { motion } from 'framer-motion'
import { trackSchema, type TrackForm, AUDIO_MIME_TYPES, IMAGE_MIME_TYPES } from '@/schemas/tracks.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore.ts'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase.ts'
import './Upload.scss'

const Upload = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<TrackForm>({
		mode: 'onBlur',
		resolver: zodResolver(trackSchema)
	})
	
	const { user } = useAuthStore()
	
	const navigate = useNavigate()
	const [serverError, setServerError] = useState<string | null>(null)
	const [audioFileName, setAudioFileName] = useState('')
	const [coverFileName, setCoverFileName] = useState('')
	
	if (!user) return null
	
	const getAudioDuration = (file: File): Promise<number> => {
		return new Promise((resolve,reject) => {
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
	
	const cleanupUploadedFiles = async (audioPath: string, coverPath: string | null) => {
		const { error: audioCleanupError } = await supabase.storage.from('audio').remove([audioPath])
		if (audioCleanupError) console.error('Failed to clean up audio file:', audioCleanupError)
		
		if (coverPath) {
			const { error: coverCleanupError } = await supabase.storage.from('covers').remove([coverPath])
			if (coverCleanupError) console.error('Failed to clean up cover file:', coverCleanupError)
		}
	}
	
	const onSubmit = async (data: TrackForm) => {
		const audioFile = data.audioFile[0]
		let coverPath: string | null = null
		const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`
		
			const { error: uploadError } =  await supabase.storage.from('audio').upload(audioPath, audioFile)
		
		if (uploadError) {
			setServerError(uploadError.message)
			return
		}
		
		if (data.coverFile && data.coverFile.length > 0) {
			const coverFile = data.coverFile[0]
			coverPath = `${user.id}/${Date.now()}-${coverFile.name}`
			
			const { error: uploadError } =  await supabase.storage.from('covers').upload(coverPath, coverFile)
			
			if (uploadError) {
				setServerError(uploadError.message)
				await cleanupUploadedFiles(audioPath, null)
				return
			}
		}
		
		try {
			const duration = Math.round(await getAudioDuration(audioFile))
			
			const {error: submitError} = await supabase.from('tracks').insert({
				user_id: user.id,
				title: data.title,
				artist: data.artist,
				duration,
				audio_path: audioPath,
				cover_path: coverPath,
			})
			
			if (submitError) {
				setServerError(submitError.message)
				await cleanupUploadedFiles(audioPath, coverPath)
				return
			}
		} catch (err) {
			setServerError('Не удалось прочитать длительность трека')
			await cleanupUploadedFiles(audioPath, coverPath)
			return
		}
		
		navigate('/')
	}
	
	return (
		<motion.section
			className="upload"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.2 }}
		>
			<div className="upload__card">
				<h2 className="upload__title">Добавить трек</h2>
				<form
					className="upload__form"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="upload__field">
						<label htmlFor="titleInput" className="upload__label">
							Название трека<span className="upload__required">*</span>
						</label>
						<input
							type="text"
							className="upload__input"
							{...register('title')}
							id="titleInput"
							autoComplete="off"
						/>
						{errors.title && <p className="upload__error">{errors.title.message}</p>}
					</div>
					<div className="upload__field">
						<label htmlFor="artistInput" className="upload__label">
							Автор<span className="upload__required">*</span>
						</label>
						<input
							type="text"
							className="upload__input"
							{...register('artist')}
							id="artistInput"
							autoComplete="off"
						/>
						{errors.artist && <p className="upload__error">{errors.artist.message}</p>}
					</div>
					<div className="upload__field">
						<label htmlFor="audioFileInput" className="upload__label">
							Трек<span className="upload__required">*</span>
						</label>
						<label
							className={`upload__dropzone${audioFileName ? ' upload__dropzone--filled' : ''}`}
							htmlFor="audioFileInput"
						>
							<svg className="upload__dropzone-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<span className="upload__dropzone-text">
								{audioFileName || 'Нажмите, чтобы выбрать аудиофайл'}
							</span>
							<input
								type="file"
								className="upload__file-input"
								{...register('audioFile', {
									onChange: (e) => setAudioFileName(e.target.files?.[0]?.name ?? ''),
								})}
								id="audioFileInput"
								accept={AUDIO_MIME_TYPES.join(',')}
							/>
						</label>
						{errors.audioFile && <p className="upload__error">{errors.audioFile.message}</p>}
					</div>
					<div className="upload__field">
						<label htmlFor="coverFileInput" className="upload__label">Обложка</label>
						<label
							className={`upload__dropzone${coverFileName ? ' upload__dropzone--filled' : ''}`}
							htmlFor="coverFileInput"
						>
							<svg className="upload__dropzone-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<span className="upload__dropzone-text">
								{coverFileName || 'Нажмите, чтобы выбрать обложку'}
							</span>
							<input
								type="file"
								className="upload__file-input"
								{...register('coverFile', {
									onChange: (e) => setCoverFileName(e.target.files?.[0]?.name ?? ''),
								})}
								id="coverFileInput"
								accept={IMAGE_MIME_TYPES.join(',')}
							/>
						</label>
						{errors.coverFile && <p className="upload__error">{errors.coverFile.message}</p>}
					</div>
					<button className="upload__submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Загружаем трек" : "Загрузить трек"}</button>
				</form>
				{serverError && <p className="upload__error">{serverError}</p>}
			</div>
		</motion.section>
	)
}

export default Upload