import usePlaylists from '@/entities/Playlist/model/usePlaylists.ts'
import useTracks from '@/entities/Track/model/useTracks.ts'
import { useAuthStore } from '@/shared/lib/authStore.ts'

const useAppReady = () => {
	const isAuthLoading = useAuthStore((state) => state.isLoading)
	const user = useAuthStore((state) => state.user)
	const { isLoading: isTracksLoading } = useTracks()
	const { isLoading: isPlaylistsLoading } = usePlaylists()

	if (!window.electronAPI) return true

	return !isAuthLoading && (!user || (!isTracksLoading && !isPlaylistsLoading))
}

export default useAppReady
