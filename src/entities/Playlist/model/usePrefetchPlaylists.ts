import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchPlaylistTracks } from '@/entities/Playlist/api/playlists.ts'
import usePlaylists from '@/entities/Playlist/model/usePlaylists.ts'

const usePrefetchPlaylists = () => {
	const queryClient = useQueryClient()
	const { data: playlists } = usePlaylists()

	useEffect(() => {
		if (!playlists) return

		for (const playlist of playlists) {
			queryClient.setQueryData(['playlist', playlist.id], playlist)
		}

		const idleId = requestIdleCallback(() => {
			for (const playlist of playlists) {
				queryClient.prefetchQuery({
					queryKey: ['playlist_tracks', playlist.id],
					queryFn: () => fetchPlaylistTracks(playlist.id),
				})
			}
		})

		return () => cancelIdleCallback(idleId)
	}, [playlists, queryClient])
}

export default usePrefetchPlaylists
