import { useQuery } from '@tanstack/react-query'
import './Playlist.scss'
import { useAuthStore } from '@/store/authStore.ts'
import { fetchPlaylist, fetchPlaylistTracks } from '@/api/playlists.ts'
import { Link, useParams } from 'react-router-dom'
import TracksList from '@/components/TracksList'
import { supabase } from '@/lib/supabase.ts'
import { pluralize } from '@/utils/pluralize.ts'

const Playlist = () => {
	const { user } = useAuthStore()

	const { playlistId } = useParams()

	const { data: playlistData, isLoading: isPlaylistLoading, error: playlistError } = useQuery({
		queryKey: ['playlist', playlistId],
		queryFn: () => fetchPlaylist(playlistId!),
		enabled: !!playlistId,
	})

	const { data: tracks, isLoading: isTracksLoading, error: tracksError } = useQuery({
		queryKey: ['playlist_tracks', playlistId],
		queryFn: () => fetchPlaylistTracks(playlistId!),
		enabled: !!playlistId,
	})

	if (!user) {
		return null
	}

	const trackCount = tracks?.length ?? 0

	return (
		<section className="playlist">
			<div className="playlist__header">
				<Link to="/" className="playlist__back" aria-label="Назад">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</Link>

				{isPlaylistLoading && <p className="playlist__loading">Загружаем плейлист</p>}
				{playlistError && <p className="playlist__error">Не удалось загрузить плейлист</p>}

				{playlistData && (
					<>
						<div className="playlist__cover-wrap">
							{playlistData.cover_path ? (
								<img
									className="playlist__cover"
									src={supabase.storage.from('covers').getPublicUrl(playlistData.cover_path).data.publicUrl}
									alt={playlistData.title}
								/>
							) : (
								<svg className="playlist__cover playlist__cover--placeholder" viewBox="0 0 24 24" fill="none">
									<path
										d="M9 18V5l10-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							)}
						</div>
						<div className="playlist__info">
							<div className="playlist__title-row">
								<h1 className="playlist__title">{playlistData.title}</h1>
								<button type="button" className="playlist__menu" aria-label="Меню плейлиста">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
										<circle cx="5" cy="12" r="2" />
										<circle cx="12" cy="12" r="2" />
										<circle cx="19" cy="12" r="2" />
									</svg>
								</button>
							</div>
							<span className="playlist__count">
								{trackCount} {pluralize(trackCount, ['трек', 'трека', 'треков'])}
							</span>
						</div>
					</>
				)}
			</div>

			<div className="playlist__search">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
					<path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<input
					type="text"
					className="playlist__search-input"
					placeholder="Поиск трека"
					disabled
				/>
			</div>

			<TracksList tracks={tracks ?? []} isLoading={isTracksLoading} error={tracksError} variant="playlist" />
		</section>
	)
}

export default Playlist