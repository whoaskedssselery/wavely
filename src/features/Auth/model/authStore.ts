import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand/react'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { supabase } from '@/shared/lib/supabase.ts'

interface AuthStore {
	user: User | null
	session: Session | null
	isLoading: boolean
	setAuth: (user: User | null, session: Session | null) => void
	signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set) => ({
	user: null,
	session: null,
	isLoading: true,
	setAuth: (user, session) => set({ user, session, isLoading: false }),
	signOut: async () => {
		await supabase.auth.signOut()
		usePlayerStore.getState().reset()
		set({ user: null, session: null, isLoading: false })
	},
}))
