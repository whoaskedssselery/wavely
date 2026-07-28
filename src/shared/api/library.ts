import { fetchAllPlaylistTracks } from '@/entities/Playlist/api/playlists.ts'
import { fetchTracks } from '@/entities/Track/api/tracks.ts'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'

export const fetchAllTracks = async (userId: string): Promise<PlayableTrack[]> => {
	const [collectionData, playlistsData] = await Promise.all([
		fetchTracks(userId),
		fetchAllPlaylistTracks(userId),
	])

	const seen = new Set<string>()
	const allTracks: PlayableTrack[] = []

	for (const track of [...collectionData, ...playlistsData]) {
		if (seen.has(track.audio_path)) continue
		seen.add(track.audio_path)
		allTracks.push(track)
	}

	return allTracks
}
