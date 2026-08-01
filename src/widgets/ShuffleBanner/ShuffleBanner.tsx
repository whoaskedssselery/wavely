import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import usePlayerNav from '@/features/PlayerControls/model/usePlayerNav.ts'
import useSyncPersistedQueue from '@/features/PlayerControls/model/useSyncPersistedQueue.ts'
import { fetchAllTracks } from '@/shared/api/library.ts'
import './ShuffleBanner.scss'

const ShuffleBanner = () => {
	const { user } = useAuthStore()
	const { data: allTracks } = useQuery({
		queryKey: ['all-tracks', user?.id],
		queryFn: () => fetchAllTracks(user!.id),
		enabled: !!user,
	})

	const { shuffle, toggleShuffle, playTrack, togglePlay, queue, isPlaying, playNext, playPrev } =
		usePlayerStore()

	useSyncPersistedQueue(allTracks)

	const { canGoPrev, canGoNext } = usePlayerNav()

	const isShuffleQueueActive =
		allTracks !== undefined &&
		queue.length === allTracks.length &&
		queue.every((track, index) => track.id === allTracks[index].id)

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
		<div className="shuffle-banner">
			<button type="button" className="shuffle-banner__info" onClick={onShuffleClick}>
				<h2 className="shuffle-banner__title">Вперемешку</h2>
				<p className="shuffle-banner__subtitle">Коллекция и плейлисты в случайном порядке</p>
			</button>
			<div className="shuffle-banner__controls">
				<button
					type="button"
					className="shuffle-banner__nav"
					aria-label="Предыдущий трек"
					disabled={!isShuffleQueueActive || !canGoPrev}
					onClick={playPrev}
				>
					<svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
						<path d="M5 6h2v12H5zM19 6L8 12l11 6z" />
					</svg>
				</button>
				<button
					type="button"
					className="shuffle-banner__play"
					aria-label={isActive ? 'Пауза' : 'Слушать вперемешку'}
					onClick={onShuffleClick}
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
					onClick={() => playNext(true)}
				>
					<svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17 6h2v12h-2zM5 6l11 6-11 6z" />
					</svg>
				</button>
			</div>
		</div>
	)
}

export default ShuffleBanner
