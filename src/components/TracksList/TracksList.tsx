import { useQuery } from '@tanstack/react-query'
import { fetchTracks } from '@/api/tracks.ts'
import { supabase } from '@/lib/supabase.ts'
import { formatDuration } from '@/utils/formatDuration.ts'
import { useAuthStore } from '@/store/authStore.ts'
import { usePlayerStore } from '@/store/playerStore.ts'
import type { Track } from '@/types/tracks.ts'
import type { MouseEvent } from 'react'
import './TracksList.scss'

const TracksList = () => {
	const { user } = useAuthStore()
	const {
		currentTrack,
		isPlaying,
		playTrack,
		togglePlay,
	} = usePlayerStore()
	
	const onTrackClick = (track: Track) => {
		if (currentTrack === null || currentTrack !== track) {
			playTrack(track)
		} else {
			togglePlay()
		}
	}

	if (!user) {
		return null
	}

	const { data, isLoading, error } = useQuery({
		queryKey: ['tracks', user.id],
		queryFn: () => fetchTracks(user.id),
	})
	
	const dataToView = data?.slice(0, 8)
	
	return (
		<section
			className={`tracks-list ${(dataToView?.length ?? 0) > 4 ? 'tracks-list--two-col' : ''}`}
		>
			{isLoading && <p className="tracks-list__loading">Загружаем треки</p>}
			{error && <p className="tracks-list__error">Не удалось загрузить данные</p>}
			{dataToView && dataToView.length === 0 && <p className="tracks-list__warning">Вы не добавили еще ни одного трека</p>}
			{dataToView && dataToView.map((track) => {
				const isActive = currentTrack?.id === track.id && isPlaying

				return (
				<div className="tracks-list__card"
				     key={track.id}
				     onClick={() => onTrackClick(track)
				     }>
					<div className="tracks-list__image-wrap">
						{isActive && <span className="tracks-list__pulse" />}
						{track.cover_path ? (
							<img
								className="tracks-list__image"
								src={supabase.storage.from('covers').getPublicUrl(track.cover_path).data.publicUrl}
								alt={track.title}
							/>
						) : (
							<svg className="tracks-list__image tracks-list__image--placeholder" width="44" height="44" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
								<circle cx="12" cy="12" r="3" fill="currentColor" />
							</svg>
						)}
						<button
							type="button"
							className="tracks-list__play"
							aria-label={isActive ? "Пауза" : "Воспроизвести"}
							onClick={(event : MouseEvent) => {
								event.stopPropagation()
								onTrackClick(track)
							}}
						>
							{isActive ? (
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
								</svg>
							) : (
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M8 5v14l11-7z" />
								</svg>
							)}
						</button>
					</div>
					<h3 className="tracks-list__title">{track.title}</h3>
					<span className="tracks-list__artist">{track.artist}</span>
					<div className="tracks-list__meta">
						<span className="tracks-list__duration">{formatDuration(track.duration)}</span>
						<button type="button" className="tracks-list__menu" aria-label="Меню трека">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
								<circle cx="3" cy="12" r="2.6" />
								<circle cx="12" cy="12" r="2.6" />
								<circle cx="21" cy="12" r="2.6" />
							</svg>
						</button>
					</div>
				</div>
				)
			})}
		</section>
	)
}

export default TracksList