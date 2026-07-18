import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchPlaylists } from '@/api/playlists.ts'
import SectionHeader from '@/components/SectionHeader'
import { supabase } from '@/lib/supabase.ts'
import { useAuthStore } from '@/store/authStore.ts'
import type { PlaylistsListProps } from '@/types/utils.ts'
import { pluralize } from '@/utils/pluralize.ts'
import './PlaylistsList.scss'

const PlaylistsList = ({ onCreatePlaylist }: PlaylistsListProps) => {
	const { user } = useAuthStore()

	const { data, isLoading, error } = useQuery({
		queryKey: ['playlists', user?.id],
		queryFn: () => fetchPlaylists(user!.id),
		enabled: !!user,
	})

	const playlistCount = data?.length ?? 0

	if (!user) {
		return null
	}

	return (
		<section className="playlists-list">
			<SectionHeader
				title="Мои плейлисты"
				counterText={`${playlistCount} ${pluralize(playlistCount, ['плейлист', 'плейлиста', 'плейлистов'])}`}
				buttonText="Создать плейлист"
				onButtonClick={onCreatePlaylist}
			/>

			{isLoading && <p className="playlists-list__loading">Загружаем плейлисты</p>}
			{error && <p className="playlists-list__error">Не удалось загрузить данные</p>}
			{data && data.length === 0 && (
				<p className="playlists-list__warning">У вас пока нет плейлистов</p>
			)}

			{data && data.length > 0 && (
				<div className="playlists-list__track">
					{data.map((playlist) => (
						<Link
							className="playlists-list__card"
							to={`/playlists/${playlist.id}`}
							key={playlist.id}
						>
							{playlist.cover_path ? (
								<img
									className="playlists-list__image"
									src={
										supabase.storage.from('covers').getPublicUrl(playlist.cover_path).data.publicUrl
									}
									alt={playlist.title}
								/>
							) : (
								<svg
									aria-hidden="true"
									className="playlists-list__image playlists-list__image--placeholder"
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
							<span className="playlists-list__card-title">{playlist.title}</span>
						</Link>
					))}
				</div>
			)}
		</section>
	)
}

export default PlaylistsList
