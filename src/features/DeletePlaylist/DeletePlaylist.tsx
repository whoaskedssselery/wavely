import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePlaylist } from '@/entities/Playlist/api/playlists.ts'
import type { DeletePlaylistProps } from '@/shared/types/utils.ts'
import CoverImage from '@/shared/ui/CoverImage'
import './DeletePlaylist.scss'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'

const DeletePlaylist = (props: DeletePlaylistProps) => {
	const { playlist, onClose } = props

	const queryClient = useQueryClient()

	const { user } = useAuthStore()

	const navigate = useNavigate()

	const { mutate, isPending } = useMutation({
		mutationFn: () => {
			return deletePlaylist(playlist.id)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['playlists', user?.id],
			})
			onClose()
			navigate('/')
		},
	})

	return (
		<div className="modal-panel delete-playlist">
			<h2 className="modal-panel__title">Удалить плейлист?</h2>
			<div className="delete-playlist__preview">
				<CoverImage
					coverPath={playlist.cover_path}
					alt={playlist.title}
					className="delete-playlist__image"
					kind="track"
				/>
				<div className="delete-playlist__info">
					<span className="delete-playlist__title">{playlist.title}</span>
					{playlist.description && (
						<span className="delete-playlist__description">{playlist.description}</span>
					)}
				</div>
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
					Удалить
				</button>
			</div>
		</div>
	)
}

export default DeletePlaylist
