import type { PlayableTrack } from '@/entities/Track/model/types.ts'

interface ShuffleNextState {
	queue: PlayableTrack[]
	shuffleHistory: PlayableTrack[]
	shuffleHistoryIndex: number
	repeatMode: 'off' | 'all' | 'one'
}

interface ShufflePrevState {
	shuffleHistory: PlayableTrack[]
	shuffleHistoryIndex: number
}

export const getNextShuffleTrack = (state: ShuffleNextState) => {
	const atEdge = state.shuffleHistoryIndex === state.shuffleHistory.length - 1

	if (!atEdge) {
		return {
			currentTrack: state.shuffleHistory[state.shuffleHistoryIndex + 1],
			shuffleHistoryIndex: state.shuffleHistoryIndex + 1,
			progress: 0,
			isPlaying: true,
		}
	}

	const remaining = state.queue.filter(
		(track) => !state.shuffleHistory.some((historyTrack) => historyTrack.id === track.id),
	)

	if (remaining.length > 0) {
		const randomIndex = Math.floor(Math.random() * remaining.length)
		const nextTrack = remaining[randomIndex]

		return {
			shuffleHistory: [...state.shuffleHistory, nextTrack],
			shuffleHistoryIndex: state.shuffleHistoryIndex + 1,
			currentTrack: nextTrack,
			progress: 0,
			isPlaying: true,
		}
	}

	if (state.repeatMode !== 'off') {
		const randomIndex = Math.floor(Math.random() * state.queue.length)
		const nextTrack = state.queue[randomIndex]

		return {
			shuffleHistory: [nextTrack],
			shuffleHistoryIndex: 0,
			currentTrack: nextTrack,
			progress: 0,
			isPlaying: true,
		}
	}

	return { shuffleHistory: [], shuffleHistoryIndex: -1, isPlaying: false }
}

export const getPrevShuffleTrack = (state: ShufflePrevState) => {
	if (state.shuffleHistoryIndex > 0) {
		return {
			currentTrack: state.shuffleHistory[state.shuffleHistoryIndex - 1],
			shuffleHistoryIndex: state.shuffleHistoryIndex - 1,
			progress: 0,
		}
	}

	return { isPlaying: false }
}
