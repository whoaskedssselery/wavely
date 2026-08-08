import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPlaylist, fetchPlaylistTracks } from '@/entities/Playlist/api/playlists.ts'
import DeletePlaylist from '@/features/DeletePlaylist'
import useAuthedUser from '@/shared/lib/useAuthedUser.ts'
import useEscapeToNavigate from '@/shared/lib/useEscapeToNavigate.ts'
import useTrackSearch from '@/shared/lib/useTrackSearch.ts'
import { SearchIcon } from '@/shared/ui/icons'
import Modal from '@/shared/ui/Modal'
import PlaylistHeader from '@/widgets/PlaylistHeader'
import usePlaylistMetaEditing from '@/widgets/PlaylistHeader/model/usePlaylistMetaEditing.ts'
import TracksList from '@/widgets/TracksList'
import './Playlist.scss'

const Playlist = () => {
	const user = useAuthedUser()

	const { playlistId } = useParams()

	const {
		data: playlistData,
		isLoading: isPlaylistLoading,
		error: playlistError,
	} = useQuery({
		queryKey: ['playlist', playlistId],
		queryFn: () => fetchPlaylist(playlistId!),
		enabled: !!playlistId,
	})

	const {
		data: tracks,
		isLoading: isTracksLoading,
		error: tracksError,
	} = useQuery({
		queryKey: ['playlist_tracks', playlistId],
		queryFn: () => fetchPlaylistTracks(playlistId!),
		enabled: !!playlistId,
	})

	const [isMenuOpen, setMenuOpen] = useState<boolean>(false)
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)

	const { setSearchQuery, filteredTracks } = useTrackSearch(tracks)

	const meta = usePlaylistMetaEditing(playlistId!, user.id, playlistData)

	const toggleMenu = () => {
		setMenuOpen(!isMenuOpen)
	}

	useEscapeToNavigate('/', () => {
		if (isMenuOpen) {
			setMenuOpen(false)
			return true
		}
		return false
	})

	const trackCount = tracks?.length ?? 0

	return (
		<section className="playlist">
			{isMenuOpen && (
				<div className="playlist__overlay" aria-hidden="true" onClick={() => setMenuOpen(false)} />
			)}
			<PlaylistHeader
				playlistData={playlistData}
				isLoading={isPlaylistLoading}
				error={playlistError}
				trackCount={trackCount}
				isMenuOpen={isMenuOpen}
				toggleMenu={toggleMenu}
				onDeleteClick={() => {
					setMenuOpen(false)
					setDeleteModalOpen(true)
				}}
				meta={meta}
			/>

			<label className="playlist__search">
				<SearchIcon />
				<input
					type="text"
					className="playlist__search-input"
					aria-label="Поиск трека"
					placeholder="Поиск трека"
					onChange={(event) => {
						setSearchQuery(event.target.value)
					}}
				/>
			</label>

			<TracksList
				tracks={filteredTracks ?? []}
				isLoading={isTracksLoading}
				error={tracksError}
				variant="playlist"
				playlistId={playlistId}
			/>

			<Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
				{playlistData && (
					<DeletePlaylist playlist={playlistData} onClose={() => setDeleteModalOpen(false)} />
				)}
			</Modal>
		</section>
	)
}

export default Playlist
