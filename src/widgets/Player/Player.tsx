import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { getTrackAudioUrl, TRACK_AUDIO_URL_STALE_TIME } from '@/entities/Track/api/tracks.ts'
import { formatDuration } from '@/entities/Track/lib/formatDuration.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import usePlayerNav from '@/features/PlayerControls/model/usePlayerNav.ts'
import usePrefetchNextTrack from '@/features/PlayerControls/model/usePrefetchNextTrack.ts'
import CoverImage from '@/shared/ui/CoverImage'
import PlayerSeekBar from './PlayerSeekBar.tsx'
import './Player.scss'
import { useQueryClient } from '@tanstack/react-query'
import { PREV_RESTART_THRESHOLD } from '@/shared/constants/player.ts'

const Player = () => {
	const {
		currentTrack,
		isPlaying,
		volume,
		progress,
		repeatMode,
		setProgress,
		setVolume,
		setIsPlaying,
		togglePlay,
		playNext,
		playPrev,
		toggleShuffle,
		cycleRepeatMode,
		shuffle,
	} = usePlayerStore()

	const { canGoPrev, canGoNext } = usePlayerNav()
	usePrefetchNextTrack()

	const queryClient = useQueryClient()

	const audioRef = useRef<HTMLAudioElement>(null)

	const [readyTrackId, setReadyTrackId] = useState<string | null>(null)

	useEffect(() => {
		if (!currentTrack) return

		let cancelled = false
		const trackId = currentTrack.id

		setReadyTrackId(null)

		const loadTrack = async () => {
			const url = await queryClient.fetchQuery({
				queryKey: ['track-audio-url', currentTrack.audio_path],
				queryFn: () => getTrackAudioUrl(currentTrack.audio_path),
				staleTime: TRACK_AUDIO_URL_STALE_TIME,
			})

			if (cancelled || !audioRef.current) return

			audioRef.current.src = url
			audioRef.current.currentTime = progress
			audioRef.current.volume = volume
			setReadyTrackId(trackId)
		}

		loadTrack()

		return () => {
			cancelled = true
		}
	}, [currentTrack])

	useEffect(() => {
		if (!audioRef.current) return

		if (isPlaying && readyTrackId === currentTrack?.id) {
			audioRef.current.play().catch((error: DOMException) => {
				if (error.name === 'AbortError') return
				setIsPlaying(false)
			})
		} else {
			audioRef.current.pause()
		}
	}, [isPlaying, readyTrackId, setIsPlaying])

	useEffect(() => {
		if (!audioRef.current) return
		audioRef.current.volume = volume
	}, [volume])

	useEffect(() => {
		if (!isPlaying) return

		const intervalId = setInterval(() => {
			if (audioRef.current) {
				setProgress(audioRef.current.currentTime)
			}
		}, 1000)

		return () => clearInterval(intervalId)
	}, [isPlaying, setProgress])

	if (!currentTrack) return null

	const handleVolumeChange = (nextVolume: number) => {
		setVolume(Math.min(1, Math.max(0, nextVolume)))
	}

	const handlePrev = () => {
		if (audioRef.current && audioRef.current.currentTime > PREV_RESTART_THRESHOLD) {
			audioRef.current.currentTime = 0
		}

		playPrev()
	}

	return (
		<section className="player">
			<audio
				className="player__audio"
				ref={audioRef}
				onEnded={() => {
					if (audioRef.current) {
						if (repeatMode === 'one') {
							audioRef.current.currentTime = 0
							audioRef.current.play().catch((error: DOMException) => {
								if (error.name === 'AbortError') return
								setIsPlaying(false)
							})
						} else {
							playNext()
						}
					}
				}}
			/>
			<div className="player__cover-wrap">
				<CoverImage
					coverPath={currentTrack.cover_path}
					alt={currentTrack.title}
					className="player__logo"
					kind="track"
					priority
				/>
			</div>
			<div className="player__info">
				<h3 className="player__title">{currentTrack.title}</h3>
				<span className="player__artist">{currentTrack.artist}</span>
			</div>
			<div className="player__progress-row">
				<span className="player__time">{formatDuration(Math.round(progress))}</span>
				<PlayerSeekBar
					audioRef={audioRef}
					isPlaying={isPlaying}
					duration={currentTrack.duration}
					initialProgress={progress}
					trackId={currentTrack.id}
					onSeek={setProgress}
				/>
				<span className="player__time">{formatDuration(currentTrack.duration)}</span>
			</div>
			<div className="player__controls">
				<button
					type="button"
					className="player__prev-button"
					onClick={handlePrev}
					aria-label="Предыдущий трек"
					disabled={!canGoPrev}
				>
					<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
						<path d="M5 6h2v12H5zM19 6L8 12l11 6z" />
					</svg>
				</button>
				<button
					type="button"
					className="player__play-button"
					onClick={togglePlay}
					aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
				>
					{isPlaying ? (
						<svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
							<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
						</svg>
					) : (
						<svg
							aria-hidden="true"
							className="player__play-icon"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>
				<button
					type="button"
					className="player__next-button"
					onClick={() => playNext(true)}
					aria-label="Следующий трек"
					disabled={!canGoNext}
				>
					<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17 6h2v12h-2zM5 6l11 6-11 6z" />
					</svg>
				</button>
			</div>
			<div className="player__extra-buttons">
				<button
					type="button"
					className={`player__shuffle-button ${shuffle ? 'player__shuffle-button--active' : ''}`}
					aria-label="Перемешать"
					onClick={toggleShuffle}
				>
					<svg
						aria-hidden="true"
						width="18"
						height="18"
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
					className={`player__repeat-button ${repeatMode !== 'off' ? 'player__repeat-button--active' : ''}`}
					aria-label="Повтор"
					onClick={cycleRepeatMode}
				>
					<svg
						aria-hidden="true"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
					</svg>
					{repeatMode === 'one' && <span className="player__repeat-badge">1</span>}
				</button>
				<div className="player__volume">
					<button type="button" className="player__volume-button" aria-label="Громкость">
						<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
					<div className="player__volume-popover">
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
		</section>
	)
}

export default Player
