import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type MouseEvent } from 'react'
import { usePlayerStore } from '@/store/playerStore.ts'
import { getTrackAudioUrl } from '@/api/tracks.ts'
import { formatDuration } from '@/utils/formatDuration.ts'
import './Player.scss'
import {supabase} from '@/lib/supabase.ts'

const Player = () => {
	const {
		currentTrack,
		isPlaying,
		volume,
		progress,
		setProgress,
		setVolume,
		setIsPlaying,
		togglePlay
	} = usePlayerStore()
	
	const audioRef = useRef<HTMLAudioElement>(null)
	
	const [seekHover, setSeekHover] = useState<{ percent: number; time: number } | null>(null)
	const [isTrackReady, setIsTrackReady] = useState(false)
	
	useEffect(() => {
		if (!currentTrack) return
		
		const loadTrack = async () => {
			if (audioRef.current) {
				setIsTrackReady(false)
				audioRef.current.src = await getTrackAudioUrl(currentTrack.audio_path)
				audioRef.current.currentTime = progress
				setIsTrackReady(true)
			}
			return
		}
		
		loadTrack()
	}, [currentTrack])
	
	useEffect(() => {
		if (!audioRef.current) return
		
		if (isPlaying && isTrackReady) {
			audioRef.current.play().catch(() => setIsPlaying(false))
		} else {
			audioRef.current.pause()
		}
	}, [isPlaying, isTrackReady])
	
	useEffect(() => {
		if (!audioRef.current) return
		audioRef.current.volume = volume
	}, [volume])
	
	if (!currentTrack) return null

	const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
		const time = Number(e.target.value)
		if (audioRef.current) {
			audioRef.current.currentTime = time
		}
		setProgress(time)
	}

	const handleVolumeChange = (nextVolume: number) => {
		setVolume(Math.min(1, Math.max(0, nextVolume)))
	}

	const handleSeekHover = (e: MouseEvent<HTMLInputElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const percent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
		const time = currentTrack.duration ? (percent / 100) * currentTrack.duration : 0
		setSeekHover({ percent, time })
	}

	const progressPercent = currentTrack.duration ? (progress / currentTrack.duration) * 100 : 0

	return (
		<section
			className="player"
		>
			<audio
				className="player__audio"
				ref={audioRef}
				onTimeUpdate={() => {
					if (audioRef.current) {
						setProgress(audioRef.current.currentTime)
					}
				}}
			/>
			<div className="player__row">
			<div className="player__meta">
				{currentTrack.cover_path ? (
					<img
						className="player__logo"
						src={supabase.storage.from('covers').getPublicUrl(currentTrack.cover_path).data.publicUrl}
						alt={currentTrack.title}
					/>
				) : (
					<svg className="player__logo player__logo--placeholder" width="44" height="44" viewBox="0 0 24 24" fill="none">
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
					onClick={() => console.log("Нужен метод для пред трека")}
					aria-label="Предыдущий трек"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M6 6h2v12H6zM20 6L9 12l11 6z" />
					</svg>
				</button>
				<button
					type="button"
					className="player__play-button"
					onClick={togglePlay}
					aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
				>
					{isPlaying ? (
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
						</svg>
					) : (
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>
				<button
					type="button"
					className="player__next-button"
					onClick={() => console.log("Нужен метод для некст трека")}
					aria-label="Следующий трек"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M16 6h2v12h-2zM4 6l11 6-11 6z" />
					</svg>
				</button>
			</div>
			<div className="player__extra-buttons">
				<button type="button" className="player__shuffle-button" aria-label="Перемешать">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
					</svg>
				</button>
				<button type="button" className="player__repeat-button" aria-label="Повтор">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
					</svg>
				</button>
				<div className="player__volume">
					<button type="button" className="player__volume-button" aria-label="Громкость">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path d="M3 9v6h4l5 5V4L7 9H3z" />
							<path d="M16 8.5a4.5 4.5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
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
			<div className="player__progress">
				<input
					type="range"
					className="player__seek-input"
					min={0}
					max={currentTrack.duration ?? 0}
					step={1}
					value={progress}
					onChange={handleSeek}
					onMouseMove={handleSeekHover}
					onMouseLeave={() => setSeekHover(null)}
					style={{ '--progress': `${progressPercent}%` } as CSSProperties}
				/>
				{seekHover && (
					<span
						className="player__progress-tooltip"
						style={{ left: `${seekHover.percent}%` }}
					>
						{formatDuration(Math.round(seekHover.time))}
					</span>
				)}
			</div>
		</section>
	)
}

export default Player