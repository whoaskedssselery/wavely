import { useQuery } from '@tanstack/react-query'
import { fetchTracks } from '@/entities/Track/api/tracks.ts'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'

const useTracks = () => {
	const { user } = useAuthStore()

	return useQuery({
		queryKey: ['tracks', user?.id],
		queryFn: () => fetchTracks(user!.id),
		enabled: !!user,
	})
}

export default useTracks
