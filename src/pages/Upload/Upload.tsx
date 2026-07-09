import { motion } from 'framer-motion'
import { trackSchema, type TrackForm } from '@/schemas/tracks.ts'
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
	
	if (!user) return null
	
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
				return
			}
		}
		
		const {error: submitError} = await supabase.from('tracks').insert({
			user_id: user.id,
			title: data.title,
			audio_path: audioPath,
			cover_path: coverPath,
		})
		
		if (submitError) {
			setServerError(submitError.message)
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
			<h2 className="upload__title">Добавить трек</h2>
			<form
				className="upload__form"
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="upload__field">
					<label htmlFor="titleInput" className="upload__label">Название трека</label>
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
					<label htmlFor="audioFileInput" className="upload__label">Трек</label>
					<input
						type="file"
						className="upload__input"
						{...register('audioFile')}
						id="audioFileInput"
					/>
					{errors.audioFile && <p className="upload__error">{errors.audioFile.message}</p>}
				</div>
				<div className="upload__field">
					<label htmlFor="coverFileInput" className="upload__label">Обложка</label>
					<input
						type="file"
						className="upload__input"
						{...register('coverFile')}
						id="coverFileInput"
					/>
					{errors.coverFile && <p className="upload__error">{errors.coverFile.message}</p>}
				</div>
				<button className="upload__submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Загружаем трек" : "Загрузить трек"}</button>
			</form>
			{serverError && <p className="upload__error">{serverError}</p>}
		</motion.section>
	)
}

export default Upload