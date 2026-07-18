import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTrackToPlaylist, fetchPlaylistIdsWithTrack, fetchPlaylists } from '@/api/playlists.ts'
import { supabase } from '@/lib/supabase.ts'
import { useAuthStore } from '@/store/authStore.ts'
import type { AddToPlaylistProps } from '@/types/utils.ts'
import './AddToPlaylist.scss'

const AddToPlaylist = (props: AddToPlaylistProps) => {
	const { track, onAdded } = props
	const { user } = useAuthStore()
	const queryClient = useQueryClient()

	const { data: playlists } = useQuery({
		queryKey: ['playlists', user?.id],
		queryFn: () => fetchPlaylists(user!.id),
		enabled: !!user,
	})

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
			<p className="add-to-playlist__text">Добавить в плейлист</p>
			<div className="add-to-playlist__list">
				{playlists?.map((playlist) => {
					const alreadyAdded = playlistIdsWithTrack?.includes(playlist.id)

					return (
						<button
							type="button"
							key={playlist.id}
							className="add-to-playlist__item"
							disabled={alreadyAdded}
							onClick={() => mutate(playlist.id)}
						>
							{playlist.cover_path ? (
								<img
									className="add-to-playlist__image"
									src={
										supabase.storage.from('covers').getPublicUrl(playlist.cover_path).data.publicUrl
									}
									alt={playlist.title}
								/>
							) : (
								<svg
									aria-hidden="true"
									className="add-to-playlist__image add-to-playlist__image--placeholder"
									viewBox="0 0 24 24"
									fill="none"
								>
									<path
										d="M9 18V5l10-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							)}
							<span className="add-to-playlist__title">{playlist.title}</span>
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
