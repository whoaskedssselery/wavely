import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getTrackAudioUrl, TRACK_AUDIO_URL_STALE_TIME } from '@/entities/Track/api/tracks.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'

const usePrefetchNextTrack = () => {
	const { queue, queueIndex, shuffle, shuffleHistory, shuffleHistoryIndex, repeatMode } =
		usePlayerStore()
	const queryClient = useQueryClient()

	useEffect(() => {
		let nextTrack = null

		if (shuffle) {
			const shuffleAtEdge = shuffleHistoryIndex === shuffleHistory.length - 1
			if (!shuffleAtEdge) {
				nextTrack = shuffleHistory[shuffleHistoryIndex + 1]
			}
		} else if (queueIndex < queue.length - 1) {
			nextTrack = queue[queueIndex + 1]
		} else if (repeatMode !== 'off' && queue.length > 0) {
			nextTrack = queue[0]
		}

		if (!nextTrack) return

		queryClient.prefetchQuery({
			queryKey: ['track-audio-url', nextTrack.audio_path],
			queryFn: () => getTrackAudioUrl(nextTrack.audio_path),
			staleTime: TRACK_AUDIO_URL_STALE_TIME,
		})
	}, [queue, queueIndex, shuffle, shuffleHistory, shuffleHistoryIndex, repeatMode, queryClient])
}

export default usePrefetchNextTrack
