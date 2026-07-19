import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { getTrackAudioUrl } from '@/api/tracks.ts'
import { supabase } from '@/lib/supabase.ts'
import { usePlayerStore } from '@/store/playerStore.ts'
import PlayerSeekBar from './PlayerSeekBar.tsx'
import './Player.scss'

const Player = () => {
	const {
		currentTrack,
		isPlaying,
		volume,
		progress,
		repeatMode,
		shuffle,
		shuffleHistoryIndex,
		queueIndex,
		setProgress,
		setVolume,
		setIsPlaying,
		togglePlay,
		playNext,
		playPrev,
		toggleShuffle,
		cycleRepeatMode,
	} = usePlayerStore()

	const audioRef = useRef<HTMLAudioElement>(null)

	const [readyTrackId, setReadyTrackId] = useState<string | null>(null)

	useEffect(() => {
		if (!currentTrack) return

		const loadTrack = async () => {
			if (audioRef.current) {
				setReadyTrackId(null)
				audioRef.current.src = await getTrackAudioUrl(currentTrack.audio_path)
				audioRef.current.currentTime = progress
				audioRef.current.volume = volume
				setReadyTrackId(currentTrack.id)
			}
			return
		}

		loadTrack()
	}, [currentTrack])

	useEffect(() => {
		if (!audioRef.current) return

		if (isPlaying && readyTrackId === currentTrack?.id) {
			audioRef.current.play().catch(() => setIsPlaying(false))
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

	const canGoPrev = shuffle ? shuffleHistoryIndex > 0 : repeatMode !== 'off' || queueIndex > 0

	return (
		<section className="player">
			<audio
				className="player__audio"
				ref={audioRef}
				onEnded={() => {
					if (audioRef.current) {
						if (repeatMode === 'one') {
							audioRef.current.currentTime = 0
							audioRef.current.play().catch(() => setIsPlaying(false))
						} else {
							playNext()
						}
					}
				}}
			/>
			<div className="player__row">
				<div className="player__meta">
					{currentTrack.cover_path ? (
						<img
							className="player__logo"
							src={
								supabase.storage.from('covers').getPublicUrl(currentTrack.cover_path).data.publicUrl
							}
							alt={currentTrack.title}
						/>
					) : (
						<svg
							aria-hidden="true"
							className="player__logo player__logo--placeholder"
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
					<div className="player__info">
						<h3 className="player__title">{currentTrack.title}</h3>
						<span className="player__artist">{currentTrack.artist}</span>
					</div>
				</div>
				<div className="player__controls">
					<button
						type="button"
						className="player__prev-button"
						onClick={playPrev}
						aria-label="Предыдущий трек"
						disabled={!canGoPrev}
					>
						<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M6 6h2v12H6zM20 6L9 12l11 6z" />
						</svg>
					</button>
					<button
						type="button"
						className="player__play-button"
						onClick={togglePlay}
						aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
					>
						{isPlaying ? (
							<svg
								aria-hidden="true"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
							</svg>
						) : (
							<svg
								aria-hidden="true"
								width="20"
								height="20"
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
					>
						<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M16 6h2v12h-2zM4 6l11 6-11 6z" />
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
						<div className="player__volume-popover">
							<div
								className="player__volume-track"
								style={{ '--volume': `${volume * 100}%` } as CSSProperties}
							>
								<input
									type="range"
									className="player__volume-slider"
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
			<PlayerSeekBar
				audioRef={audioRef}
				isPlaying={isPlaying}
				duration={currentTrack.duration}
				initialProgress={progress}
				trackId={currentTrack.id}
				onSeek={setProgress}
			/>
		</section>
	)
}

export default Player
