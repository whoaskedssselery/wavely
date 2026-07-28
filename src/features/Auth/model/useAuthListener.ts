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
}

export default useAuthListener
