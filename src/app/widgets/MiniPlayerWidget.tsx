import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { formatDuration } from '@/entities/Track/lib/formatDuration.ts'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'
import useAuthListener from '@/features/Auth/model/useAuthListener.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import useDisplayedProgress from '@/features/PlayerControls/model/useDisplayedProgress.ts'
import usePlayerNav from '@/features/PlayerControls/model/usePlayerNav.ts'
import { fetchAllTracks } from '@/shared/api/library.ts'
import { PREV_RESTART_THRESHOLD } from '@/shared/constants/player.ts'
import CoverImage from '@/shared/ui/CoverImage'
import PlayerSeekBar from '@/widgets/Player/PlayerSeekBar.tsx'
import '@/features/Theme/model/themeStore.ts'
import './MiniPlayerWidget.scss'

const MiniPlayerWidget = () => {
	useAuthListener()

	const {
		currentTrack,
		isPlaying,
		progress,
		repeatMode,
		shuffle,
		queue,
		seekTo,
		togglePlay,
		playNext,
		playPrev,
		playTrack,
		toggleShuffle,
		cycleRepeatMode,
	} = usePlayerStore()

	const displayedProgress = useDisplayedProgress(progress, isPlaying)

	const { canGoPrev, canGoNext } = usePlayerNav()

	const { user } = useAuthStore()
	const { data: allTracks } = useQuery({
		queryKey: ['all-tracks', user?.id],
		queryFn: () => fetchAllTracks(user!.id),
		enabled: !!user,
	})

	const isShuffleQueueActive =
		allTracks !== undefined &&
		allTracks.length > 0 &&
		queue.length === allTracks.length &&
		queue.every((track, index) => track.id === allTracks[index].id)

	const handleShufflePlay = () => {
		if (isShuffleQueueActive) {
			togglePlay()
			return
		}
		if (!allTracks || allTracks.length === 0) return

		const randomIndex = Math.floor(Math.random() * allTracks.length)
		playTrack(allTracks[randomIndex], allTracks, randomIndex)
		if (!shuffle) toggleShuffle()
	}

	const handlePrev = () => {
		if (progress > PREV_RESTART_THRESHOLD) seekTo(0)
		playPrev()
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') window.electronAPI?.hideWidget()
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

	return (
		<div className="mini-player">
			<div className="mini-player__drag-region" />

			<button
				type="button"
				className="mini-player__close"
				aria-label="Закрыть мини-плеер"
				onClick={() => window.electronAPI?.hideWidget()}
			>
				<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none">
					<path
						d="M6 6l12 12M18 6L6 18"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</svg>
			</button>

			<div className="mini-player__head">
				<div className="mini-player__cover">
					{currentTrack ? (
						<CoverImage
							coverPath={currentTrack.cover_path}
							alt={currentTrack.title}
							className="mini-player__cover-image"
							kind="track"
							priority
						/>
					) : (
						<div className="mini-player__cover-placeholder">
							<svg
								aria-hidden="true"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
							</svg>
						</div>
					)}
				</div>
				<div className="mini-player__info">
					<span className="mini-player__title">{currentTrack?.title ?? 'Ничего не играет'}</span>
					<span className="mini-player__artist">
						{currentTrack?.artist ?? 'Включите трек или нажмите «вперемешку»'}
					</span>
				</div>
			</div>

			<div className="mini-player__progress">
				<span className="mini-player__time">{formatDuration(Math.round(displayedProgress))}</span>
				{currentTrack ? (
					<PlayerSeekBar
						progress={progress}
						isPlaying={isPlaying}
						duration={currentTrack.duration}
						trackId={currentTrack.id}
						onSeek={seekTo}
					/>
				) : (
					<div className="mini-player__progress-idle" />
				)}
				<span className="mini-player__time">{formatDuration(currentTrack?.duration ?? 0)}</span>
			</div>

			<div className="mini-player__controls">
				<button
					type="button"
					className={`mini-player__toggle ${shuffle ? 'mini-player__toggle--active' : ''}`}
					aria-label="Перемешать"
					aria-pressed={shuffle}
					onClick={() => toggleShuffle()}
				>
					<svg
						aria-hidden="true"
						width="19"
						height="19"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
					</svg>
				</button>

				<button
					type="button"
					className="mini-player__nav"
					aria-label="Предыдущий трек"
					disabled={!canGoPrev}
					onClick={handlePrev}
				>
					<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
						<path d="M5 6h2v12H5zM19 6L8 12l11 6z" />
					</svg>
				</button>

				<button
					type="button"
					className="mini-player__play"
					aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
					disabled={!currentTrack}
					onClick={() => togglePlay()}
				>
					{isPlaying ? (
						<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
						</svg>
					) : (
						<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>

				<button
					type="button"
					className="mini-player__nav"
					aria-label="Следующий трек"
					disabled={!canGoNext}
					onClick={() => playNext(true)}
				>
					<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17 6h2v12h-2zM5 6l11 6-11 6z" />
					</svg>
				</button>

				<button
					type="button"
					className={`mini-player__toggle ${repeatMode !== 'off' ? 'mini-player__toggle--active' : ''}`}
					aria-label="Повтор"
					onClick={() => cycleRepeatMode()}
				>
					<svg
						aria-hidden="true"
						width="19"
						height="19"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
					</svg>
					{repeatMode === 'one' && <span className="mini-player__repeat-badge">1</span>}
				</button>

				<button
					type="button"
					className={`mini-player__shuffle-play ${isShuffleQueueActive && isPlaying ? 'mini-player__shuffle-play--active' : ''}`}
					aria-label={isShuffleQueueActive && isPlaying ? 'Пауза' : 'Слушать вперемешку'}
					disabled={!allTracks || allTracks.length === 0}
					onClick={handleShufflePlay}
				>
					{isShuffleQueueActive && isPlaying ? (
						<svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
							<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
						</svg>
					) : (
						<svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>
			</div>
		</div>
	)
}

export default MiniPlayerWidget
