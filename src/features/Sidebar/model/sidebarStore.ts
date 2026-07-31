import { persist } from 'zustand/middleware'
import { create } from 'zustand/react'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'

interface SidebarStore {
	isExpanded: boolean
	toggleExpanded: () => void
}

export const useSidebarStore = create<SidebarStore>()(
	persist(
		(set) => ({
			isExpanded: !!usePlayerStore.getState().currentTrack,
			toggleExpanded: () => set((state) => ({ isExpanded: !state.toggleExpanded
		})),
		}),
		{ name: 'sidebar-store' },
	)
)