import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { fetchAllTracks } from '@/api/tracks.ts'
import { useAuthStore } from '@/store/authStore.ts'
import { usePlayerStore } from '@/store/playerStore.ts'
import './ShuffleBanner.scss'

const ShuffleBanner = () => {
	const { user } = useAuthStore()
	const { data: allTracks } = useQuery({
		queryKey: ['all-tracks', user?.id],
		queryFn: () => fetchAllTracks(user!.id),
		enabled: !!user,
	})

	const {
		shuffle,
		toggleShuffle,
		playTrack,
		togglePlay,
		queue,
		queueIndex,
		isPlaying,
		playNext,
		playPrev,
		shuffleHistory,
		shuffleHistoryIndex,
		repeatMode,
		currentTrack,
		syncQueue,
		resyncShuffleHistory,
	} = usePlayerStore()

	const hasSyncedQueue = useRef(false)

	useEffect(() => {
		if (hasSyncedQueue.current) return
		if (!allTracks || !currentTrack) return
		if (usePlayerStore.getState().queue.length > 0) return

		const index = allTracks.findIndex((track) => track.id === currentTrack.id)
		if (index !== -1) {
			syncQueue(allTracks, index)
			hasSyncedQueue.current = true
			resyncShuffleHistory()
		}
	}, [allTracks, currentTrack, syncQueue, resyncShuffleHistory])

	const isShuffleQueueActive =
		allTracks !== undefined &&
		queue.length === allTracks.length &&
		queue.every((track, index) => track.id === allTracks[index].id)
	const canGoPrev = shuffle ? shuffleHistoryIndex > 0 : repeatMode !== 'off' || queueIndex > 0

	const shuffleAtEdge = shuffleHistoryIndex === shuffleHistory.length - 1
	const shuffleRemaining = queue.filter((track) => !shuffleHistory.some((t) => t.id === track.id))
	const canGoNext = !shuffleAtEdge || shuffleRemaining.length > 0 || repeatMode !== 'off'

	const onShuffleClick = () => {
		if (isShuffleQueueActive) {
			togglePlay()
			return
		}

		if (!allTracks || allTracks.length === 0) return
		const randomIndex = Math.floor(Math.random() * allTracks.length)
		playTrack(allTracks[randomIndex], allTracks, randomIndex)
		if (!shuffle) toggleShuffle()
	}

	const isActive = isShuffleQueueActive && isPlaying

	return (
		<div
			className="shuffle-banner"
			role="button"
			tabIndex={0}
			onClick={onShuffleClick}
			onKeyDown={(event) => {
				if (event.target !== event.currentTarget) return
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					onShuffleClick()
				}
			}}
		>
			<div className="shuffle-banner__info">
				<span className="shuffle-banner__eyebrow">Слушать всё</span>
				<h2 className="shuffle-banner__title">Вперемешку</h2>
				<p className="shuffle-banner__subtitle">Коллекция и плейлисты в случайном порядке</p>
			</div>
			<div className="shuffle-banner__controls">
				<button
					type="button"
					className="shuffle-banner__nav"
					aria-label="Предыдущий трек"
					disabled={!isShuffleQueueActive || !canGoPrev}
					onClick={(event) => {
						event.stopPropagation()
						playPrev()
					}}
				>
					<svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
						<path d="M6 6h2v12H6zM20 6L9 12l11 6z" />
					</svg>
				</button>
				<button
					type="button"
					className="shuffle-banner__play"
					aria-label={isActive ? 'Пауза' : 'Слушать вперемешку'}
				>
					{isActive ? (
						<svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
							<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
						</svg>
					) : (
						<svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>
				<button
					type="button"
					className="shuffle-banner__nav"
					aria-label="Следующий трек"
					disabled={!isShuffleQueueActive || !canGoNext}
					onClick={(event) => {
						event.stopPropagation()
						playNext(true)
					}}
				>
					<svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
						<path d="M16 6h2v12h-2zM4 6l11 6-11 6z" />
					</svg>
				</button>
			</div>
		</div>
	)
}

export default ShuffleBanner
