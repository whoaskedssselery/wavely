import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeTrackFromPlaylist } from '@/entities/Playlist/api/playlists.ts'
import { deleteTrack } from '@/entities/Track/api/tracks.ts'
import { formatDuration } from '@/entities/Track/lib/formatDuration.ts'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import type { DeleteTrackProps } from '@/shared/types/utils.ts'
import CoverImage from '@/shared/ui/CoverImage'
import './DeleteTrack.scss'

const DeleteTrack = (props: DeleteTrackProps) => {
	const { track, variant, playlistId, onClose, onDeleted } = props
	const queryClient = useQueryClient()

	const { user } = useAuthStore()

	const { clearTrack } = usePlayerStore()

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
			clearTrack(track.id)
			onClose()
		},
	})

	return (
		<div className="modal-panel delete-track">
			<h2 className="modal-panel__title">
				{variant === 'collection' ? 'Удалить трек?' : 'Убрать из плейлиста?'}
			</h2>
			<div className="delete-track__track">
				<CoverImage
					coverPath={track.cover_path}
					alt={track.title}
					className="delete-track__image"
					kind="track"
				/>
				<div className="delete-track__info">
					<span className="delete-track__title">{track.title}</span>
					<span className="delete-track__artist">{track.artist}</span>
				</div>
				<span className="delete-track__duration">{formatDuration(track.duration)}</span>
			</div>
			<div className="modal-panel__actions">
				<button
					type="button"
					className="modal-panel__button modal-panel__button--ghost"
					onClick={onClose}
				>
					Отмена
				</button>
				<button
					type="button"
					className="modal-panel__button modal-panel__button--danger"
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
