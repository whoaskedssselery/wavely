import { useQuery } from '@tanstack/react-query'
import { fetchFavoriteTrack } from '@/entities/Track/api/trackPlays.ts'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'

const useFavoriteTrack = () => {
	const { user } = useAuthStore()

	return useQuery({
		queryKey: ['favorite-track', user?.id],
		queryFn: () => fetchFavoriteTrack(user!.id),
		enabled: !!user,
	})
}

export default useFavoriteTrack
