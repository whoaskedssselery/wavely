import useSearch from '@/shared/lib/useSearch.ts'

const useTrackSearch = <T extends { title: string; artist: string }>(tracks?: T[]) => {
	const { searchQuery, setSearchQuery, filteredItems } = useSearch(tracks, (track) => [
		track.title,
		track.artist,
	])

	return { searchQuery, setSearchQuery, filteredTracks: filteredItems }
}

export default useTrackSearch
