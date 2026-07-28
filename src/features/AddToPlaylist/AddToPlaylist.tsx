import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { addTrackToPlaylist, fetchPlaylistIdsWithTrack } from '@/entities/Playlist/api/playlists.ts'
import usePlaylists from '@/entities/Playlist/model/usePlaylists.ts'
import useScrollbarVisibility from '@/shared/lib/useScrollbarVisibility.ts'
import useSearch from '@/shared/lib/useSearch.ts'
import type { AddToPlaylistProps } from '@/shared/types/utils.ts'
import CoverImage from '@/shared/ui/CoverImage'
import './AddToPlaylist.scss'

const AddToPlaylist = (props: AddToPlaylistProps) => {
	const { track, onAdded } = props
	const queryClient = useQueryClient()

	const { data: playlists } = usePlaylists()

	const { setSearchQuery, filteredItems: filteredPlaylists } = useSearch(playlists, (playlist) => [
		playlist.title,
		playlist.author,
	])

	const listRef = useRef<HTMLDivElement>(null)
	useScrollbarVisibility(listRef)

	const { data: playlistIdsWithTrack } = useQuery({
		queryKey: ['playlist-ids-with-track', track.audio_path],
		queryFn: () => fetchPlaylistIdsWithTrack(track.audio_path),
	})

	const { mutate } = useMutation({
		mutationFn: (playlistId: string) => addTrackToPlaylist(track, playlistId),
		onSuccess: (_data, playlistId) => {
			queryClient.invalidateQueries({ queryKey: ['playlist_tracks', playlistId] })
			onAdded()
		},
	})

	return (
		<div className="add-to-playlist">
			<h2 className="add-to-playlist__text">Добавить в плейлист</h2>
			<label className="add-to-playlist__search">
				<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
					<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M21 21l-4.35-4.35"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
				<input
					type="text"
					className="add-to-playlist__search-input"
					aria-label="Поиск плейлиста по названию или автору"
					placeholder="Поиск по названию или автору"
					onChange={(event) => setSearchQuery(event.target.value)}
				/>
			</label>
			<div className="add-to-playlist__list" ref={listRef}>
				{filteredPlaylists?.length === 0 && (
					<p className="add-to-playlist__empty">Ничего не нашлось</p>
				)}
				{filteredPlaylists?.map((playlist) => {
					const alreadyAdded = playlistIdsWithTrack?.includes(playlist.id)

					return (
						<button
							type="button"
							key={playlist.id}
							className="add-to-playlist__item"
							disabled={alreadyAdded}
							onClick={() => mutate(playlist.id)}
						>
							<CoverImage
								coverPath={playlist.cover_path}
								alt={playlist.title}
								className="add-to-playlist__image"
								kind="playlist"
							/>
							<span className="add-to-playlist__info">
								<span className="add-to-playlist__title">{playlist.title}</span>
								{playlist.author && (
									<span className="add-to-playlist__author">{playlist.author}</span>
								)}
							</span>
							{alreadyAdded && (
								<span className="add-to-playlist__badge" role="img" aria-label="Уже добавлено">
									<svg
										aria-hidden="true"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M20 6L9 17l-5-5" />
									</svg>
								</span>
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default AddToPlaylist
