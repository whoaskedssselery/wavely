import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'

const usePlayerNav = () => {
	const { shuffle, shuffleHistory, shuffleHistoryIndex, repeatMode, queue, queueIndex } =
		usePlayerStore()

	const canGoPrev = shuffle ? shuffleHistoryIndex > 0 : repeatMode !== 'off' || queueIndex > 0

	const shuffleAtEdge = shuffleHistoryIndex === shuffleHistory.length - 1
	const shuffleRemaining = queue.filter((track) => !shuffleHistory.some((t) => t.id === track.id))
	const canGoNext = shuffle
		? !shuffleAtEdge || shuffleRemaining.length > 0 || repeatMode !== 'off'
		: repeatMode !== 'off' || queueIndex < queue.length - 1

	return { canGoPrev, canGoNext }
}

export default usePlayerNav
