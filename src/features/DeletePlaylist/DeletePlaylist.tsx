import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Playlist } from '@/entities/Playlist/model/types.ts'
import { deletePlaylist } from '@/entities/Playlist/api/playlists.ts'
import CoverImage from '@/shared/ui/CoverImage'
import './DeletePlaylist.scss'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/lib/authStore.ts'

interface DeletePlaylistProps {
	playlist: Playlist
	onClose: () => void
}

const DeletePlaylist = (props: DeletePlaylistProps) => {
	const { playlist, onClose } = props

	const queryClient = useQueryClient()

	const { user } = useAuthStore()

	const navigate = useNavigate()

	const [serverError, setServerError] = useState<string | null>(null)

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
		onError: (error) => setServerError(error.message),
	})

	return (
		<div className="modal-panel delete-playlist">
			<h2 className="modal-panel__title">Удалить плейлист?</h2>
			<div className="delete-playlist__preview">
				<CoverImage
					coverPath={playlist.cover_path}
					alt={playlist.title}
					className="delete-playlist__image"
					kind="playlist"
				/>
				<div className="delete-playlist__info">
					<span className="delete-playlist__title">{playlist.title}</span>
					{playlist.description && (
						<span className="delete-playlist__description">{playlist.description}</span>
					)}
				</div>
			</div>
			{serverError && <p className="modal-panel__error">{serverError}</p>}
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
