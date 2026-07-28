import { useAuthStore } from '@/features/Auth/model/authStore.ts'

const useAuthedUser = () => {
	const { user } = useAuthStore()

	return user!
}

export default useAuthedUser
