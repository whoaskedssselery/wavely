import {
	type ChangeEvent,
	type MouseEvent,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { formatDuration } from '@/utils/formatDuration.ts'

interface PlayerSeekBarProps {
	audioRef: RefObject<HTMLAudioElement | null>
	isPlaying: boolean
	duration: number | null
	initialProgress: number
	trackId: string
	onSeek: (time: number) => void
}

const PlayerSeekBar = ({
	audioRef,
	isPlaying,
	duration,
	initialProgress,
	trackId,
	onSeek,
}: PlayerSeekBarProps) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const isDraggingRef = useRef(false)
	const [seekHover, setSeekHover] = useState<{ percent: number; time: number } | null>(null)

	const applyVisual = useCallback(
		(time: number) => {
			const input = inputRef.current
			if (!input) return
			input.value = String(time)
			input.style.setProperty('--progress', `${duration ? (time / duration) * 100 : 0}%`)
		},
		[duration],
	)

	useEffect(() => {
		applyVisual(initialProgress)
	}, [trackId, applyVisual])

	useEffect(() => {
		if (!isPlaying) return

		let rafId: number
		let lastMediaTime = -1
		let lastSyncAt = 0

		const tick = () => {
			const audio = audioRef.current
			if (audio && !isDraggingRef.current) {
				if (audio.currentTime !== lastMediaTime) {
					lastMediaTime = audio.currentTime
					lastSyncAt = performance.now()
				}

				const canExtrapolate =
					!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
				const elapsed = canExtrapolate
					? ((performance.now() - lastSyncAt) / 1000) * audio.playbackRate
					: 0

				const time = lastMediaTime + elapsed
				applyVisual(duration ? Math.min(time, duration) : time)
			}
			rafId = requestAnimationFrame(tick)
		}

		rafId = requestAnimationFrame(tick)

		return () => cancelAnimationFrame(rafId)
	}, [isPlaying, audioRef, applyVisual, duration])

	const commitSeek = (time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time
		}
		applyVisual(time)
		onSeek(time)
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const time = Number(e.target.value)
		if (isDraggingRef.current) {
			applyVisual(time)
		} else {
			commitSeek(time)
		}
	}

	const handleSeekHover = (e: MouseEvent<HTMLInputElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const percent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
		const time = duration ? (percent / 100) * duration : 0
		setSeekHover({ percent, time })
	}

	return (
		<div className="player__progress">
			<input
				type="range"
				className="player__seek-input"
				ref={inputRef}
				min={0}
				max={duration ?? 0}
				step="any"
				defaultValue={initialProgress}
				onChange={handleChange}
				onPointerDown={() => {
					isDraggingRef.current = true
				}}
				onPointerUp={(e) => {
					isDraggingRef.current = false
					commitSeek(Number(e.currentTarget.value))
				}}
				onPointerCancel={() => {
					isDraggingRef.current = false
				}}
				onMouseMove={handleSeekHover}
				onMouseLeave={() => setSeekHover(null)}
			/>
			{seekHover && (
				<span className="player__progress-tooltip" style={{ left: `${seekHover.percent}%` }}>
					{formatDuration(Math.round(seekHover.time))}
				</span>
			)}
		</div>
	)
}

export default PlayerSeekBar
