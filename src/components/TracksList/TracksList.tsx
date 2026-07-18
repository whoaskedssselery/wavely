import { type MouseEvent, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { usePlayerStore } from '@/store/playerStore.ts'
import type { PlayableTrack } from '@/types/tracks.ts'
import type { ActiveTrackModal, TracksListProps } from '@/types/utils.ts'
import { formatDuration } from '@/utils/formatDuration.ts'
import './TracksList.scss'
import AddToPlaylist from '@/components/AddToPlaylist'
import DeleteTrack from '@/components/DeleteTrack'
import Modal from '@/components/Modal'
import TrackMenu from '@/components/TrackMenu'

const TracksList = (props: TracksListProps) => {
	const { tracks, isLoading, error, variant, playlistId } = props

	const { currentTrack, isPlaying, playTrack, syncQueue, resyncShuffleHistory, togglePlay } =
		usePlayerStore()

	const [openMenuTrackId, setOpenMenuTrackId] = useState<string>()
	const [activeTrackModal, setActiveTrackModal] = useState<ActiveTrackModal>()

	const hasSyncedQueue = useRef(false)

	const onTrackClick = (track: PlayableTrack) => {
		if (currentTrack === null || currentTrack !== track) {
			if (tracks) {
				const index = tracks.findIndex((t) => t.id === track.id)
				playTrack(track, tracks, index)
			}
		} else {
			togglePlay()
		}
	}

	const onDeleted = () => {
		setOpenMenuTrackId(undefined)
		setActiveTrackModal(undefined)
	}

	const onAdded = () => {
		setOpenMenuTrackId(undefined)
		setActiveTrackModal(undefined)
	}

	const handleMenu = (event: MouseEvent, trackId: string) => {
		event.stopPropagation()

		if (trackId === openMenuTrackId) {
			setOpenMenuTrackId(undefined)
		} else {
			setOpenMenuTrackId(trackId)
		}
	}

	const onMenuClick = (
		event: MouseEvent,
		type: 'delete' | 'add-to-playlist',
		track: PlayableTrack,
	) => {
		event.stopPropagation()
		setActiveTrackModal({ type, track })
	}

	useEffect(() => {
		if (hasSyncedQueue.current) return
		if (!tracks || !currentTrack) return

		const index = tracks.findIndex((t) => t.id === currentTrack.id)
		if (index !== -1) {
			syncQueue(tracks, index)
			hasSyncedQueue.current = true
			resyncShuffleHistory()
		}
	}, [tracks, currentTrack, syncQueue, resyncShuffleHistory])

	useEffect(() => {
		if (!openMenuTrackId) return

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpenMenuTrackId(undefined)
			}
		}

		document.addEventListener('keydown', handleEscape)

		return () => document.removeEventListener('keydown', handleEscape)
	}, [openMenuTrackId])

	return (
		<>
			<section className={`tracks-list ${(tracks?.length ?? 0) > 4 ? 'tracks-list--two-col' : ''}`}>
				{openMenuTrackId && (
					<div
						className="tracks-list__overlay"
						aria-hidden="true"
						onClick={() => setOpenMenuTrackId(undefined)}
					/>
				)}
				{isLoading && <p className="tracks-list__loading">Загружаем треки</p>}
				{error && <p className="tracks-list__error">Не удалось загрузить данные</p>}
				{tracks && tracks.length === 0 && (
					<p className="tracks-list__warning">Вы не добавили еще ни одного трека</p>
				)}
				{tracks?.map((track) => {
					const isActive = currentTrack?.id === track.id && isPlaying

					return (
						<div
							className={`tracks-list__card ${openMenuTrackId === track.id ? 'tracks-list__card--menu-open' : ''}`}
							key={track.id}
							role="button"
							tabIndex={0}
							onClick={() => onTrackClick(track)}
							onKeyDown={(event) => {
								if (event.target !== event.currentTarget) return
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault()
									onTrackClick(track)
								}
							}}
						>
							<div className="tracks-list__image-wrap">
								{isActive && <span className="tracks-list__pulse" />}
								{track.cover_path ? (
									<img
										className="tracks-list__image"
										src={
											supabase.storage.from('covers').getPublicUrl(track.cover_path).data.publicUrl
										}
										alt={track.title}
									/>
								) : (
									<svg
										aria-hidden="true"
										className="tracks-list__image tracks-list__image--placeholder"
										width="44"
										height="44"
										viewBox="0 0 24 24"
										fill="none"
									>
										<circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
										<circle cx="12" cy="12" r="3" fill="currentColor" />
									</svg>
								)}
								<button
									type="button"
									className="tracks-list__play"
									aria-label={isActive ? 'Пауза' : 'Воспроизвести'}
									onClick={(event: MouseEvent) => {
										event.stopPropagation()
										onTrackClick(track)
									}}
								>
									{isActive ? (
										<svg
											aria-hidden="true"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
										</svg>
									) : (
										<svg
											aria-hidden="true"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M8 5v14l11-7z" />
										</svg>
									)}
								</button>
							</div>
							<h3 className="tracks-list__title">{track.title}</h3>
							<span className="tracks-list__artist">{track.artist}</span>
							<div className="tracks-list__meta">
								<span className="tracks-list__duration">{formatDuration(track.duration)}</span>
								<button
									type="button"
									className="tracks-list__menu"
									aria-label="Меню трека"
									onClick={(event) => handleMenu(event, track.id)}
								>
									<svg
										aria-hidden="true"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<circle cx="3" cy="12" r="2.6" />
										<circle cx="12" cy="12" r="2.6" />
										<circle cx="21" cy="12" r="2.6" />
									</svg>
								</button>
								{openMenuTrackId === track.id && (
									<TrackMenu
										variant={variant}
										onDelete={(event) => onMenuClick(event, 'delete', track)}
										onAddToPlaylist={(event) => onMenuClick(event, 'add-to-playlist', track)}
									/>
								)}
							</div>
						</div>
					)
				})}
			</section>
			<Modal
				isOpen={activeTrackModal?.type === 'delete'}
				onClose={() => setActiveTrackModal(undefined)}
			>
				{activeTrackModal && (
					<DeleteTrack
						track={activeTrackModal.track}
						variant={variant}
						playlistId={playlistId}
						onClose={() => setActiveTrackModal(undefined)}
						onDeleted={onDeleted}
					/>
				)}
			</Modal>
			<Modal
				isOpen={activeTrackModal?.type === 'add-to-playlist'}
				onClose={() => setActiveTrackModal(undefined)}
			>
				{activeTrackModal && (
					<AddToPlaylist
						track={activeTrackModal.track}
						onClose={() => setActiveTrackModal(undefined)}
						onAdded={onAdded}
					/>
				)}
			</Modal>
		</>
	)
}

export default TracksList
