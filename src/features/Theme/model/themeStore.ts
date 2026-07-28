import { persist } from 'zustand/middleware'
import { create } from 'zustand/react'

type Theme = 'light' | 'dark'

interface ThemeStore {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: 'light',
			setTheme: (theme: Theme) => set({ theme }),
			toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
		}),
		{ name: 'theme-store' },
	),
)

const applyTheme = (theme: Theme) => {
	document.documentElement.dataset.theme = theme
}

applyTheme(useThemeStore.getState().theme)
useThemeStore.subscribe((state) => applyTheme(state.theme))
