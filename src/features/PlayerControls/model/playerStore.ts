import { persist } from 'zustand/middleware'
import { create } from 'zustand/react'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'
import {
	getNextShuffleTrack,
	getPrevShuffleTrack,
} from '@/features/PlayerControls/model/shuffleQueue.ts'

interface PlayerStore {
	currentTrack: PlayableTrack | null
	isPlaying: boolean
	progress: number
	volume: number
	queue: PlayableTrack[]
	queueIndex: number
	shuffle: boolean
	shuffleHistory: PlayableTrack[]
	shuffleHistoryIndex: number
	repeatMode: 'off' | 'all' | 'one'
	playTrack: (track: PlayableTrack, queue: PlayableTrack[], queueIndex: number) => void
	syncQueue: (queue: PlayableTrack[], queueIndex: number) => void
	resyncShuffleHistory: () => void
	togglePlay: () => void
	setProgress: (progress: number) => void
	setVolume: (volume: number) => void
	setIsPlaying: (isPlaying: boolean) => void
	playNext: (isManual?: boolean) => void
	playPrev: () => void
	toggleShuffle: () => void
	cycleRepeatMode: () => void
	clearTrack: (trackId: string) => void
}

export const usePlayerStore = create<PlayerStore>()(
	persist(
		(set) => ({
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
			playTrack: (track: PlayableTrack, queue: PlayableTrack[], queueIndex: number) => {
				set((state) => ({
					currentTrack: track,
					isPlaying: true,
					progress: 0,
					queue,
					queueIndex,
					...(state.shuffle ? { shuffleHistory: [track], shuffleHistoryIndex: 0 } : {}),
				}))
			},
			syncQueue: (queue: PlayableTrack[], queueIndex: number) => {
				set({ queue, queueIndex })
			},
			resyncShuffleHistory: () =>
				set((state) => {
					if (!state.shuffle || !state.currentTrack) return {}
					return { shuffleHistory: [state.currentTrack], shuffleHistoryIndex: 0 }
				}),
			togglePlay: () =>
				set((state) => ({
					isPlaying: !state.isPlaying,
				})),
			setProgress: (currentProgress: number) => {
				set({ progress: currentProgress })
			},
			setVolume: (volume: number) => {
				set({ volume: volume })
			},
			setIsPlaying: (isPlaying: boolean) => {
				set({ isPlaying })
			},
			playNext: (isManual?: boolean) =>
				set((state) => {
					const treatAsOff = state.repeatMode === 'off' && !isManual

					if (state.shuffle) {
						return getNextShuffleTrack(state)
					}

					if (treatAsOff) {
						if (state.queue.length - 1 > state.queueIndex) {
							return {
								currentTrack: state.queue[state.queueIndex + 1],
								queueIndex: state.queueIndex + 1,
								progress: 0,
								isPlaying: true,
							}
						} else {
							return { isPlaying: false }
						}
					} else {
						if (state.queue.length - 1 === state.queueIndex) {
							return { currentTrack: state.queue[0], queueIndex: 0, progress: 0, isPlaying: true }
						} else {
							return {
								currentTrack: state.queue[state.queueIndex + 1],
								queueIndex: state.queueIndex + 1,
								progress: 0,
								isPlaying: true,
							}
						}
					}
				}),
			playPrev: () =>
				set((state) => {
					if (state.shuffle) {
						return getPrevShuffleTrack(state)
					} else {
						if (state.repeatMode === 'off') {
							if (state.queueIndex === 0) {
								return { isPlaying: false }
							} else {
								return {
									currentTrack: state.queue[state.queueIndex - 1],
									queueIndex: state.queueIndex - 1,
									progress: 0,
								}
							}
						} else {
							if (state.queueIndex === 0) {
								return {
									currentTrack: state.queue[state.queue.length - 1],
									queueIndex: state.queue.length - 1,
									progress: 0,
								}
							} else {
								return {
									currentTrack: state.queue[state.queueIndex - 1],
									queueIndex: state.queueIndex - 1,
									progress: 0,
								}
							}
						}
					}
				}),
			toggleShuffle: () =>
				set((state) => {
					if (!state.shuffle) {
						if (state.currentTrack) {
							return { shuffle: true, shuffleHistory: [state.currentTrack], shuffleHistoryIndex: 0 }
						} else {
							return { shuffle: true, shuffleHistory: [], shuffleHistoryIndex: -1 }
						}
					} else {
						const activeShuffledTrack = state.shuffleHistory[state.shuffleHistoryIndex]

						return {
							queueIndex: activeShuffledTrack
								? state.queue.findIndex((track) => track.id === activeShuffledTrack.id)
								: state.queueIndex,
							shuffle: false,
							shuffleHistory: [],
							shuffleHistoryIndex: 0,
						}
					}
				}),
			cycleRepeatMode: () =>
				set((state) => {
					const currentMode =
						state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off'

					return { repeatMode: currentMode }
				}),
			clearTrack: (trackId) =>
				set((state) => {
					if (state.currentTrack?.id === trackId) {
						return {
							currentTrack: null,
							isPlaying: false,
							progress: 0,
						}
					} else {
						return {}
					}
				}),
		}),
		{
			name: 'player-store',
			partialize: (state) => ({
				currentTrack: state.currentTrack,
				progress: state.progress,
				volume: state.volume,
				shuffle: state.shuffle,
				repeatMode: state.repeatMode,
			}),
		},
	),
)
