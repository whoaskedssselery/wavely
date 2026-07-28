import { useEffect, useRef } from 'react'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'

const useSyncPersistedQueue = (tracks: PlayableTrack[] | undefined, skip = false) => {
	const { currentTrack, syncQueue, resyncShuffleHistory } = usePlayerStore()
	const hasSyncedQueue = useRef(false)

	useEffect(() => {
		if (hasSyncedQueue.current) return
		if (skip) return
		if (!tracks || !currentTrack) return
		if (usePlayerStore.getState().queue.length > 0) return

		const index = tracks.findIndex((track) => track.id === currentTrack.id)
		if (index !== -1) {
			syncQueue(tracks, index)
			hasSyncedQueue.current = true
			resyncShuffleHistory()
		}
	}, [tracks, currentTrack, syncQueue, resyncShuffleHistory, skip])
}

export default useSyncPersistedQueue
