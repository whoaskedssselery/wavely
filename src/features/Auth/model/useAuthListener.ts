import { useEffect } from 'react'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'
import { supabase } from '@/shared/lib/supabase.ts'

const useAuthListener = () => {
	const setAuth = useAuthStore((s) => s.setAuth)

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setAuth(data.session?.user ?? null, data.session)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setAuth(session?.user ?? null, session)

			if (event === 'SIGNED_IN' && window.location.href.includes('#')) {
				window.history.replaceState(null, '', '/')
			}
		})

		return () => subscription.unsubscribe()
	}, [setAuth])

	useEffect(() => {
		if (!window.electronAPI) return

		return window.electronAPI.onAuthCallback((url) => {
			const hash = url.split('#')[1] ?? ''
			const params = new URLSearchParams(hash)
			const access_token = params.get('access_token')
			const refresh_token = params.get('refresh_token')

			if (access_token && refresh_token) {
				supabase.auth.setSession({ access_token, refresh_token })
			}
		})
	}, [])
}

export default useAuthListener
