import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { recordTrackPlay } from '@/entities/Track/api/trackPlays.ts'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { TRACK_PLAY_THRESHOLD_MAX, TRACK_PLAY_THRESHOLD_RATIO } from '@/shared/constants/player.ts'

const useRecordTrackPlay = () => {
	const currentTrack = usePlayerStore((state) => state.currentTrack)
	const progress = usePlayerStore((state) => state.progress)
	const { user } = useAuthStore()
	const queryClient = useQueryClient()

	const sessionRef = useRef<{ audioPath: string; lastProgress: number; recorded: boolean } | null>(
		null,
	)

	const { mutate } = useMutation({
		mutationFn: recordTrackPlay,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorite-track', user?.id] }),
	})

	useEffect(() => {
		if (!currentTrack) {
			sessionRef.current = null
			return
		}

		let session = sessionRef.current
		if (
			!session ||
			session.audioPath !== currentTrack.audio_path ||
			progress < session.lastProgress
		) {
			session = { audioPath: currentTrack.audio_path, lastProgress: progress, recorded: false }
		}
		session.lastProgress = progress
		sessionRef.current = session

		const threshold = Math.min(
			TRACK_PLAY_THRESHOLD_MAX,
			(currentTrack.duration ?? TRACK_PLAY_THRESHOLD_MAX * 2) * TRACK_PLAY_THRESHOLD_RATIO,
		)

		if (!session.recorded && progress >= threshold) {
			session.recorded = true
			mutate(currentTrack)
		}
	}, [currentTrack, progress, mutate])
}

export default useRecordTrackPlay
