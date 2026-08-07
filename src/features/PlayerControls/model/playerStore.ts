import { persist } from 'zustand/middleware'
import { create } from 'zustand/react'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'
import audioRef from '@/features/PlayerControls/model/audioRef.ts'
import {
	getNextShuffleTrack,
	getPrevShuffleTrack,
} from '@/features/PlayerControls/model/shuffleQueue.ts'
import { PREV_RESTART_THRESHOLD } from '@/shared/constants/player.ts'

interface PlayerState {
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
}

interface PlayerActions {
	playTrack: (track: PlayableTrack, queue: PlayableTrack[], queueIndex: number) => void
	syncQueue: (queue: PlayableTrack[], queueIndex: number) => void
	resyncShuffleHistory: () => void
	togglePlay: () => void
	pause: () => void
	setProgress: (progress: number) => void
	seekTo: (time: number) => void
	setVolume: (volume: number) => void
	setIsPlaying: (isPlaying: boolean) => void
	playNext: (isManual?: boolean) => void
	playPrev: () => void
	toggleShuffle: () => void
	cycleRepeatMode: () => void
	clearTrack: (trackId: string) => void
	reset: () => void
}

type PlayerStore = PlayerState & PlayerActions

const initialState: PlayerState = {
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
}

const windowRole = typeof window !== 'undefined' ? window.electronAPI?.windowRole : undefined
const isProxied = typeof window !== 'undefined' && !!window.electronAPI && windowRole !== 'engine'
const isEngine = typeof window !== 'undefined' && windowRole === 'engine'

type SetFn = (
	partial:
		| PlayerStore
		| Partial<PlayerStore>
		| ((state: PlayerStore) => PlayerStore | Partial<PlayerStore>),
) => void

const createRealActions = (set: SetFn): PlayerActions => ({
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
	pause: () => set({ isPlaying: false }),
	setProgress: (currentProgress: number) => {
		set({ progress: currentProgress })
	},
	seekTo: (time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time
		}
		set({ progress: time })
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
						isPlaying: state.isPlaying,
					}
				} else {
					return { isPlaying: false }
				}
			} else {
				if (state.queue.length - 1 === state.queueIndex) {
					return {
						currentTrack: state.queue[0],
						queueIndex: 0,
						progress: 0,
						isPlaying: state.isPlaying,
					}
				} else {
					return {
						currentTrack: state.queue[state.queueIndex + 1],
						queueIndex: state.queueIndex + 1,
						progress: 0,
						isPlaying: state.isPlaying,
					}
				}
			}
		}),
	playPrev: () =>
		set((state) => {
			if (state.progress > PREV_RESTART_THRESHOLD) {
				return { progress: 0 }
			}

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
	reset: () =>
		set({
			currentTrack: null,
			isPlaying: false,
			progress: 0,
			queue: [],
			queueIndex: 0,
			shuffle: false,
			shuffleHistory: [],
			shuffleHistoryIndex: 0,
			repeatMode: 'off',
		}),
})

const PROXIED_ACTION_ARITY = {
	playTrack: 3,
	syncQueue: 2,
	resyncShuffleHistory: 0,
	togglePlay: 0,
	pause: 0,
	setProgress: 1,
	seekTo: 1,
	setVolume: 1,
	setIsPlaying: 1,
	playNext: 1,
	playPrev: 0,
	toggleShuffle: 0,
	cycleRepeatMode: 0,
	clearTrack: 1,
	reset: 0,
} as const satisfies Record<keyof PlayerActions, number>

const PROXIED_ACTION_NAMES = Object.keys(PROXIED_ACTION_ARITY) as (keyof PlayerActions)[]

const createProxyActions = (): PlayerActions => {
	const actions = {} as PlayerActions
	for (const name of PROXIED_ACTION_NAMES) {
		const arity = PROXIED_ACTION_ARITY[name]
		// biome-ignore lint/suspicious/noExplicitAny: forwarding call — args are re-typed by PlayerActions
		;(actions as any)[name] = (...args: unknown[]) =>
			window.electronAPI?.playerCommand(name, args.slice(0, arity))
	}
	return actions
}

export const usePlayerStore = isProxied
	? create<PlayerStore>()(() => ({
			...initialState,
			...createProxyActions(),
		}))
	: create<PlayerStore>()(
			persist(
				(set) => ({
					...initialState,
					...createRealActions(set),
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

if (isProxied && typeof window !== 'undefined') {
	window.electronAPI?.onPlayerState((state) => {
		usePlayerStore.setState(state as Partial<PlayerStore>)
	})

	window.electronAPI?.getPlayerState().then((state) => {
		if (state) usePlayerStore.setState(state as Partial<PlayerStore>)
	})
}

if (isEngine && typeof window !== 'undefined') {
	window.electronAPI?.onPlayerCommand((name, args) => {
		const action = usePlayerStore.getState()[name as keyof PlayerActions] as (
			...args: unknown[]
		) => void
		action?.(...args)
	})

	let lastQueue: PlayableTrack[] | null = null
	let lastShuffleHistory: PlayableTrack[] | null = null

	const reportState = (state: PlayerState) => {
		const snapshot: Partial<PlayerState> = {
			currentTrack: state.currentTrack,
			isPlaying: state.isPlaying,
			progress: state.progress,
			volume: state.volume,
			queueIndex: state.queueIndex,
			shuffle: state.shuffle,
			shuffleHistoryIndex: state.shuffleHistoryIndex,
			repeatMode: state.repeatMode,
		}

		if (state.queue !== lastQueue) {
			snapshot.queue = state.queue
			lastQueue = state.queue
		}
		if (state.shuffleHistory !== lastShuffleHistory) {
			snapshot.shuffleHistory = state.shuffleHistory
			lastShuffleHistory = state.shuffleHistory
		}

		window.electronAPI?.reportPlayerState(snapshot)
	}

	usePlayerStore.subscribe(reportState)

	reportState(usePlayerStore.getState())
}
