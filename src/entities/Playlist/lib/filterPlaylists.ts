import type { Playlist } from '@/entities/Playlist/model/types.ts'

export const filterPlaylists = (playlists: Playlist[] | undefined, searchQuery: string) => {
	const query = searchQuery.toLowerCase()

	return playlists?.filter(
		(playlist) =>
			playlist.title.toLowerCase().includes(query) ||
			(playlist.author?.toLowerCase().includes(query) ?? false),
	)
}
