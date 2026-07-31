import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { PREV_RESTART_THRESHOLD } from '@/shared/constants/player.ts'

const usePlayerNav = () => {
	const { progress, shuffle, shuffleHistory, shuffleHistoryIndex, repeatMode, queue, queueIndex } =
		usePlayerStore()

	const canGoPrev = shuffle
		? shuffleHistoryIndex > 0 || progress > PREV_RESTART_THRESHOLD
		: repeatMode !== 'off' || queueIndex > 0 || progress > PREV_RESTART_THRESHOLD

	const shuffleAtEdge = shuffleHistoryIndex === shuffleHistory.length - 1
	const shuffleRemaining = queue.filter((track) => !shuffleHistory.some((t) => t.id === track.id))
	const canGoNext = shuffle
		? !shuffleAtEdge || shuffleRemaining.length > 0 || repeatMode !== 'off'
		: repeatMode !== 'off' || queueIndex < queue.length - 1

	return { canGoPrev, canGoNext }
}

export default usePlayerNav
