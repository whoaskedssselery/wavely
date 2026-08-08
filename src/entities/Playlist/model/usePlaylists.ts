import { useQuery } from '@tanstack/react-query'
import { fetchPlaylists } from '@/entities/Playlist/api/playlists.ts'
import { useAuthStore } from '@/shared/lib/authStore.ts'

const usePlaylists = () => {
	const { user } = useAuthStore()

	return useQuery({
		queryKey: ['playlists', user?.id],
		queryFn: () => fetchPlaylists(user!.id),
		enabled: !!user,
	})
}

export default usePlaylists
