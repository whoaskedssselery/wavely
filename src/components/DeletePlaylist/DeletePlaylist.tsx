import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePlaylist } from '@/api/playlists.ts'
import { supabase } from '@/lib/supabase.ts'
import type { DeletePlaylistProps } from '@/types/utils.ts'
import './DeletePlaylist.scss'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore.ts'

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
		<div className="delete-playlist">
			<p className="delete-playlist__text">Удалить плейлист?</p>
			<div className="delete-playlist__preview">
				{playlist.cover_path ? (
					<img
						className="delete-playlist__image"
						src={supabase.storage.from('covers').getPublicUrl(playlist.cover_path).data.publicUrl}
						alt={playlist.title}
					/>
				) : (
					<svg
						aria-hidden="true"
						className="delete-playlist__image delete-playlist__image--placeholder"
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
				<div className="delete-playlist__info">
					<span className="delete-playlist__title">{playlist.title}</span>
					{playlist.description && (
						<span className="delete-playlist__description">{playlist.description}</span>
					)}
				</div>
			</div>
			<div className="delete-playlist__actions">
				<button type="button" className="delete-playlist__cancel" onClick={onClose}>
					Отмена
				</button>
				<button
					type="button"
					className="delete-playlist__confirm"
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
