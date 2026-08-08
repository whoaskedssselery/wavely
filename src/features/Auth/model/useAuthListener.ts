import { useEffect } from 'react'
import { useAuthStore } from '@/shared/lib/authStore.ts'
import { supabase } from '@/shared/lib/supabase.ts'

const useAuthListener = () => {
	const setAuth = useAuthStore((s) => s.setAuth)

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setAuth(data.session?.user ?? null, data.session)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setAuth(session?.user ?? null, session)
		})

		return () => subscription.unsubscribe()
	}, [setAuth])

	useEffect(() => {
		if (!window.electronAPI) return

		return window.electronAPI.onAuthCallback((code) => {
			supabase.auth.exchangeCodeForSession(code)
		})
	}, [])
}

export default useAuthListener
