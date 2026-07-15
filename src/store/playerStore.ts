import { create } from 'zustand/react'
import { persist } from 'zustand/middleware'
import type { Track } from '@/types/tracks.ts'

interface PlayerStore {
	currentTrack: Track | null
	isPlaying: boolean
	progress: number
	volume: number,
	queue: Track[],
	queueIndex: number,
	shuffle: boolean,
	shuffleHistory: Track[],
	shuffleHistoryIndex: number,
	repeatMode: 'off' | 'all' | 'one',
	playTrack: (track: Track, queue: Track[], queueIndex: number) => void
	syncQueue: (queue: Track[], queueIndex: number) => void
	togglePlay: () => void
	setProgress: (progress: number) => void
	setVolume: (volume: number) => void
	setIsPlaying: (isPlaying: boolean) => void
	playNext: (isManual?: boolean) => void
	playPrev: () => void
	toggleShuffle: () => void
	cycleRepeatMode: () => void
}

export const usePlayerStore = create<PlayerStore>()(
	persist((set) => ({
		currentTrack: null,
		isPlaying: false,
		progress: 0,
		volume: 1,
		queue: [],
		queueIndex: 0,
		shuffle: false,
		shuffleHistory: [],
		shuffleHistoryIndex: 0,
		repeatMode: 'off',
		playTrack: (track: Track, queue: Track[], queueIndex: number) => {
			set({ currentTrack: track, isPlaying: true, progress: 0, queue, queueIndex })
		},
		syncQueue: (queue: Track[], queueIndex: number) => { set({ queue, queueIndex })},
		togglePlay: () => set((state) => ({
			isPlaying: !state.isPlaying,
		})),
		setProgress: (currentProgress: number) => { set({ progress: currentProgress })},
		setVolume: (volume: number) => { set({ volume: volume })},
		setIsPlaying: (isPlaying: boolean) => { set({ isPlaying })},
		playNext: (isManual?: boolean) => set((state) => {
			const treatAsOff = state.repeatMode === 'off' && !isManual

			if (state.shuffle) {
				const atEdge = state.shuffleHistoryIndex === state.shuffleHistory.length - 1

				if (atEdge) {
					const remaining = state.queue.filter(track => !state.shuffleHistory.some(t => t.id === track.id))

					if (remaining.length === 0) {
						if (!treatAsOff) {
							const randomIndex = Math.floor(Math.random() * state.queue.length)
							const nextTrack = state.queue[randomIndex]

							return { shuffleHistory: [nextTrack], shuffleHistoryIndex: 0, currentTrack: nextTrack, progress: 0, isPlaying: true }
						} else {
							return { shuffleHistory: [], isPlaying: false }
						}
					} else {
						const randomIndex = Math.floor(Math.random() * remaining.length)
						const nextTrack = remaining[randomIndex]

						return { shuffleHistory: [...state.shuffleHistory, nextTrack], shuffleHistoryIndex: state.shuffleHistoryIndex + 1, currentTrack: nextTrack, progress: 0, isPlaying: true }
					}
				} else {
					return { currentTrack: state.shuffleHistory[state.shuffleHistoryIndex + 1], shuffleHistoryIndex: state.shuffleHistoryIndex + 1, progress: 0, isPlaying: true }
				}
			}

			if (treatAsOff) {
				if (state.queue.length - 1 > state.queueIndex) {
					return { currentTrack: state.queue[state.queueIndex + 1] , queueIndex: state.queueIndex + 1, progress: 0, isPlaying: true }
				} else {
					return { isPlaying: false }
				}
			} else {
				if (state.queue.length - 1 === state.queueIndex) {
					return { currentTrack: state.queue[0] , queueIndex: 0, progress: 0, isPlaying: true }
				} else {
					return { currentTrack: state.queue[state.queueIndex + 1], queueIndex: state.queueIndex + 1, progress: 0, isPlaying: true }
				}
			}
		}),
		playPrev: () => set((state) => {
				if (state.shuffle) {
					if (state.shuffleHistoryIndex > 0) {
						return { currentTrack: state.shuffleHistory[state.shuffleHistoryIndex - 1], shuffleHistoryIndex: state.shuffleHistoryIndex - 1, progress: 0 }
					} else {
						return { isPlaying: false }
					}
				} else {
					if (state.repeatMode === 'off') {
						if (state.queueIndex === 0) {
							return { isPlaying: false }
						} else {
							return { currentTrack: state.queue[state.queueIndex - 1], queueIndex: state.queueIndex - 1, progress: 0
							}
						}
					} else {
						if (state.queueIndex === 0) {
							return { currentTrack: state.queue[state.queue.length - 1], queueIndex: state.queue.length - 1, progress: 0 }
						} else {
							return { currentTrack: state.queue[state.queueIndex - 1], queueIndex: state.queueIndex - 1, progress: 0
							}
						}
					}
				}
			}),
		toggleShuffle: () => set((state) => {
			if (!state.shuffle) {
				if (state.currentTrack) {
					return { shuffle: true, shuffleHistory: [state.currentTrack], shuffleHistoryIndex: 0 }
				} else {
					return { shuffle: true, shuffleHistory: [], shuffleHistoryIndex: -1 }
				}
			} else {
				return {
					queueIndex: state.queue.findIndex(track => track.id === state.shuffleHistory[state.shuffleHistoryIndex].id),
					shuffle: false, shuffleHistory: [], shuffleHistoryIndex: 0
				}
			}
		}),
		cycleRepeatMode: () => set((state) => {
			const currentMode = state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off'
			
			return { repeatMode: currentMode }
		}),
	}),
		{
			name: 'player-store',
			partialize: state => ({
				currentTrack: state.currentTrack,
				progress: state.progress,
				volume: state.volume,
			})
		}
		)
)