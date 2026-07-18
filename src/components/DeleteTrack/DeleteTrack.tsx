import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeTrackFromPlaylist } from '@/api/playlists.ts'
import { deleteTrack } from '@/api/tracks.ts'
import { supabase } from '@/lib/supabase.ts'
import { useAuthStore } from '@/store/authStore.ts'
import type { DeleteTrackProps } from '@/types/utils.ts'
import { formatDuration } from '@/utils/formatDuration.ts'
import './DeleteTrack.scss'

const DeleteTrack = (props: DeleteTrackProps) => {
	const { track, variant, playlistId, onClose, onDeleted } = props
	const queryClient = useQueryClient()

	const { user } = useAuthStore()

	const { mutate, isPending } = useMutation({
		mutationFn: () => {
			if (variant === 'collection') {
				return deleteTrack(track.id)
			} else {
				return removeTrackFromPlaylist(track.id)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: variant === 'collection' ? ['tracks', user?.id] : ['playlist_tracks', playlistId],
			})
			onDeleted()
			onClose()
		},
	})

	return (
		<div className="delete-track">
			<p className="delete-track__text">
				{variant === 'collection' ? 'Удалить трек?' : 'Убрать из плейлиста?'}
			</p>
			<div className="delete-track__track">
				{track.cover_path ? (
					<img
						className="delete-track__image"
						src={supabase.storage.from('covers').getPublicUrl(track.cover_path).data.publicUrl}
						alt={track.title}
					/>
				) : (
					<svg
						aria-hidden="true"
						className="delete-track__image delete-track__image--placeholder"
						width="44"
						height="44"
						viewBox="0 0 24 24"
						fill="none"
					>
						<circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
						<circle cx="12" cy="12" r="3" fill="currentColor" />
					</svg>
				)}
				<div className="delete-track__info">
					<span className="delete-track__title">{track.title}</span>
					<span className="delete-track__artist">{track.artist}</span>
				</div>
				<span className="delete-track__duration">{formatDuration(track.duration)}</span>
			</div>
			<div className="delete-track__actions">
				<button type="button" className="delete-track__cancel" onClick={onClose}>
					Отмена
				</button>
				<button
					type="button"
					className="delete-track__confirm"
					onClick={() => mutate()}
					disabled={isPending}
				>
					{variant === 'collection' ? 'Удалить' : 'Убрать'}
				</button>
			</div>
		</div>
	)
}

export default DeleteTrack
