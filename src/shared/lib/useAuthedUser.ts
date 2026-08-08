import { useAuthStore } from '@/shared/lib/authStore.ts'

const useAuthedUser = () => {
	const { user } = useAuthStore()

	return user!
}

export default useAuthedUser
