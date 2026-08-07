import { type ChangeEvent, type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import { formatDuration } from '@/entities/Track/lib/formatDuration.ts'

interface PlayerSeekBarProps {
	progress: number
	isPlaying: boolean
	duration: number | null
	trackId: string
	onSeek: (time: number) => void
}

const PlayerSeekBar = ({ progress, isPlaying, duration, trackId, onSeek }: PlayerSeekBarProps) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const isDraggingRef = useRef(false)
	const [seekHover, setSeekHover] = useState<{ percent: number; time: number } | null>(null)
	const lastSyncRef = useRef({ progress, at: performance.now() })

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
		applyVisual(progress)
	}, [trackId, applyVisual])

	useEffect(() => {
		lastSyncRef.current = { progress, at: performance.now() }
		if (!isDraggingRef.current) applyVisual(progress)
	}, [progress, applyVisual])

	useEffect(() => {
		if (!isPlaying) return

		let rafId: number

		const tick = () => {
			if (!isDraggingRef.current) {
				const { progress: lastProgress, at } = lastSyncRef.current
				const time = lastProgress + (performance.now() - at) / 1000
				applyVisual(duration ? Math.min(time, duration) : time)
			}
			rafId = requestAnimationFrame(tick)
		}

		rafId = requestAnimationFrame(tick)

		return () => cancelAnimationFrame(rafId)
	}, [isPlaying, applyVisual, duration])

	const commitSeek = (time: number) => {
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
				aria-label="Перемотка трека"
				ref={inputRef}
				min={0}
				max={duration ?? 0}
				step="any"
				defaultValue={progress}
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
