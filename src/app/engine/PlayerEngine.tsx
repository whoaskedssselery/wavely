import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getTrackAudioUrl, TRACK_AUDIO_URL_STALE_TIME } from '@/entities/Track/api/tracks.ts'
import useAuthListener from '@/features/Auth/model/useAuthListener.ts'
import audioRef from '@/features/PlayerControls/model/audioRef.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import useMediaSession from '@/features/PlayerControls/model/useMediaSession.ts'
import usePrefetchNextTrack from '@/features/PlayerControls/model/usePrefetchNextTrack.ts'
import useRecordTrackPlay from '@/features/PlayerControls/model/useRecordTrackPlay.ts'

const PlayerEngine = () => {
	useAuthListener()
	usePrefetchNextTrack()
	useRecordTrackPlay()
	useMediaSession()

	const { currentTrack, isPlaying, volume, repeatMode, setProgress, setIsPlaying, playNext } =
		usePlayerStore()

	const queryClient = useQueryClient()

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
			audioRef.current.currentTime = usePlayerStore.getState().progress
			audioRef.current.volume = usePlayerStore.getState().volume
			setReadyTrackId(trackId)
		}

		loadTrack()

		return () => {
			cancelled = true
		}
	}, [currentTrack, queryClient])

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
	}, [isPlaying, readyTrackId, currentTrack?.id, setIsPlaying])

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

	return (
		<audio
			ref={audioRef}
			onEnded={() => {
				if (!audioRef.current) return

				if (repeatMode === 'one') {
					audioRef.current.currentTime = 0
					audioRef.current.play().catch((error: DOMException) => {
						if (error.name === 'AbortError') return
						setIsPlaying(false)
					})
				} else {
					playNext()
				}
			}}
		/>
	)
}

export default PlayerEngine
