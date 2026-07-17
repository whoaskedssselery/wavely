import { useEffect, useRef, type MouseEvent } from 'react'
import { usePlayerStore } from '@/store/playerStore.ts'
import { formatDuration } from '@/utils/formatDuration.ts'
import { supabase } from '@/lib/supabase.ts'
import type {TracksListProps} from '@/types/utils.ts'
import type { Track } from '@/types/tracks.ts'
import './TracksList.scss'

const TracksList = (props: TracksListProps) => {
	const {
		tracks,
		isLoading,
		error,
	} = props
	
	const {
		currentTrack,
		isPlaying,
		playTrack,
		syncQueue,
		togglePlay,
	} = usePlayerStore()
	const hasSyncedQueue = useRef(false)
	
	const onTrackClick = (track: Track) => {
		if (currentTrack === null || currentTrack !== track) {
			if (tracks) {
				const index = tracks.findIndex(t => t.id === track.id)
				playTrack(track, tracks, index)
			}
		} else {
			togglePlay()
		}
	}
	
	useEffect(() => {
		if (hasSyncedQueue.current) return
		if (!tracks || !currentTrack) return
		
		const index = tracks.findIndex(t => t.id === currentTrack.id)
		if (index !== -1) {
			syncQueue(tracks, index)
			hasSyncedQueue.current = true
		}
	}, [tracks, currentTrack, syncQueue])

	return (
		<section
			className={`tracks-list ${(tracks?.length ?? 0) > 4 ? 'tracks-list--two-col' : ''}`}
		>
			{isLoading && <p className="tracks-list__loading">Загружаем треки</p>}
			{error && <p className="tracks-list__error">Не удалось загрузить данные</p>}
			{tracks && tracks.length === 0 && <p className="tracks-list__warning">Вы не добавили еще ни одного трека</p>}
			{tracks && tracks.map((track) => {
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