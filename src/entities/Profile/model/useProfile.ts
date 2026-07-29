import { useQuery } from '@tanstack/react-query'
import { fetchProfile } from '@/entities/Profile/api/profile.ts'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'

const useProfile = () => {
	const { user } = useAuthStore()

	return useQuery({
		queryKey: ['profile', user?.id],
		queryFn: () => fetchProfile(user!.id),
		enabled: !!user,
	})
}

export default useProfile
