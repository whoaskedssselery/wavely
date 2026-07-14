import { create } from 'zustand/react'
import { persist } from 'zustand/middleware'
import type { Track } from '@/types/tracks.ts'

interface PlayerStore {
	currentTrack: Track | null
	isPlaying: boolean
	progress: number
	volume: number
	playTrack: (track: Track) => void
	togglePlay: () => void
	setProgress: (progress: number) => void
	setVolume: (volume: number) => void
	setIsPlaying: (isPlaying: boolean) => void
}

export const usePlayerStore = create<PlayerStore>()(
	persist((set) => ({
		currentTrack: null,
		isPlaying: false,
		progress: 0,
		volume: 1,
		playTrack: (track: Track) => { set({ currentTrack: track, isPlaying: true })},
		togglePlay: () => set((state) => ({
			isPlaying: !state.isPlaying,
		})),
		setProgress: (currentProgress: number) => { set({ progress: currentProgress })},
		setVolume: (volume: number) => { set({ volume: volume })},
		setIsPlaying: (isPlaying: boolean) => { set({ isPlaying })},
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