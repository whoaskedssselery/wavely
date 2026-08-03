import type { CSSProperties } from 'react'
import audioRef from '@/features/PlayerControls/model/audioRef.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import usePlayerNav from '@/features/PlayerControls/model/usePlayerNav.ts'
import { PREV_RESTART_THRESHOLD } from '@/shared/constants/player.ts'
import CoverImage from '@/shared/ui/CoverImage'
import './MobilePlayer.scss'
import PlayerSeekBar from './PlayerSeekBar.tsx'

const MobilePlayer = () => {
	const {
		currentTrack,
		isPlaying,
		progress,
		repeatMode,
		setProgress,
		togglePlay,
		playNext,
		playPrev,
		toggleShuffle,
		cycleRepeatMode,
		shuffle,
		volume,
		setVolume,
	} = usePlayerStore()

	const { canGoPrev, canGoNext } = usePlayerNav()

	if (!currentTrack) return null

	const handlePrev = () => {
		if (audioRef.current && audioRef.current.currentTime > PREV_RESTART_THRESHOLD) {
			audioRef.current.currentTime = 0
		}

		playPrev()
	}

	const handleVolumeChange = (nextVolume: number) => {
		setVolume(Math.min(1, Math.max(0, nextVolume)))
	}

	return (
		<section className="mobile-player">
			<div className="mobile-player__row">
				<div className="mobile-player__summary">
					<CoverImage
						coverPath={currentTrack.cover_path}
						alt={currentTrack.title}
						className="mobile-player__cover"
						kind="track"
						priority
					/>
					<div className="mobile-player__info">
						<span className="mobile-player__title">{currentTrack.title}</span>
						<span className="mobile-player__artist">{currentTrack.artist}</span>
					</div>
				</div>
				<div className="mobile-player__controls">
					<button
						type="button"
						className="mobile-player__prev-button"
						onClick={handlePrev}
						aria-label="Предыдущий трек"
						disabled={!canGoPrev}
					>
						<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M5 6h2v12H5zM19 6L8 12l11 6z" />
						</svg>
					</button>
					<button
						type="button"
						className="mobile-player__play-button"
						onClick={togglePlay}
						aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
					>
						{isPlaying ? (
							<svg
								aria-hidden="true"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
							</svg>
						) : (
							<svg
								aria-hidden="true"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M8 5v14l11-7z" />
							</svg>
						)}
					</button>
					<button
						type="button"
						className="mobile-player__next-button"
						onClick={() => playNext(true)}
						aria-label="Следующий трек"
						disabled={!canGoNext}
					>
						<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17 6h2v12h-2zM5 6l11 6-11 6z" />
						</svg>
					</button>
				</div>
				<div className="mobile-player__extra">
					<button
						type="button"
						className={`mobile-player__repeat-button ${repeatMode !== 'off' ? 'mobile-player__repeat-button--active' : ''}`}
						aria-label="Повтор"
						onClick={cycleRepeatMode}
					>
						<svg
							aria-hidden="true"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
						</svg>
						{repeatMode === 'one' && <span className="mobile-player__repeat-badge">1</span>}
					</button>
					<button
						type="button"
						className={`mobile-player__shuffle-button ${shuffle ? 'mobile-player__shuffle-button--active' : ''}`}
						aria-label="Перемешать"
						onClick={toggleShuffle}
					>
						<svg
							aria-hidden="true"
							width="20"
							height="20"
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
					<div className="mobile-player__volume">
						<button type="button" className="player__volume-button" aria-label="Громкость">
							<svg
								aria-hidden="true"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M3 9v6h4l5 5V4L7 9H3z" />
								<path
									d="M16 8.5a4.5 4.5 0 0 1 0 7"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
								/>
							</svg>
						</button>
						<div className="mobile-player__volume-popover">
							<div
								className="player__volume-track"
								style={{ '--volume': `${volume * 100}%` } as CSSProperties}
							>
								<input
									type="range"
									className="player__volume-slider"
									aria-label="Уровень громкости"
									min={0}
									max={1}
									step={0.01}
									value={volume}
									onChange={(e) => handleVolumeChange(Number(e.target.value))}
								/>
								<span className="player__volume-tooltip">{Math.round(volume * 100)}%</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="mobile-player__seek">
				<PlayerSeekBar
					audioRef={audioRef}
					isPlaying={isPlaying}
					duration={currentTrack.duration}
					initialProgress={progress}
					trackId={currentTrack.id}
					onSeek={setProgress}
				/>
			</div>
		</section>
	)
}

export default MobilePlayer
