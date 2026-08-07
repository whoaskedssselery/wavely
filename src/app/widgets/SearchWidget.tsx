import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { fetchPlaylist, fetchPlaylistTracks } from '@/entities/Playlist/api/playlists.ts'
import { filterPlaylists } from '@/entities/Playlist/lib/filterPlaylists.ts'
import usePlaylists from '@/entities/Playlist/model/usePlaylists.ts'
import useTracks from '@/entities/Track/model/useTracks.ts'
import useAuthListener from '@/features/Auth/model/useAuthListener.ts'
import useTrackSearch from '@/shared/lib/useTrackSearch.ts'
import CoverImage from '@/shared/ui/CoverImage'
import TracksList from '@/widgets/TracksList'
import '@/features/Theme/model/themeStore.ts'
import './SearchWidget.scss'

type View = 'search' | 'playlist'

const COLLAPSED_HEIGHT = 56
const EXPANDED_HEIGHT = 480

const SearchWidget = () => {
	useAuthListener()

	const [view, setView] = useState<View>('search')
	const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const { data: playlists } = usePlaylists()
	const { data: tracks } = useTracks()
	const { searchQuery, setSearchQuery, filteredTracks } = useTrackSearch(tracks)

	const filteredPlaylists = filterPlaylists(playlists, searchQuery)

	const { data: activePlaylist } = useQuery({
		queryKey: ['playlist', activePlaylistId],
		queryFn: () => fetchPlaylist(activePlaylistId!),
		enabled: !!activePlaylistId,
	})

	const {
		data: playlistTracks,
		isLoading: isPlaylistTracksLoading,
		error: playlistTracksError,
	} = useQuery({
		queryKey: ['playlist_tracks', activePlaylistId],
		queryFn: () => fetchPlaylistTracks(activePlaylistId!),
		enabled: !!activePlaylistId,
	})

	const backToSearch = useCallback(() => {
		setView('search')
		setActivePlaylistId(null)
	}, [])

	const openPlaylist = (playlistId: string) => {
		setActivePlaylistId(playlistId)
		setView('playlist')
	}

	const resetAndFocus = useCallback(() => {
		setView('search')
		setActivePlaylistId(null)
		setSearchQuery('')
		inputRef.current?.focus()
	}, [setSearchQuery])

	useEffect(() => {
		if (!window.electronAPI) return
		return window.electronAPI.onWidgetShown(resetAndFocus)
	}, [resetAndFocus])

	const isLibraryReady = !!tracks && !!playlists
	const isExpanded = view === 'playlist' || (searchQuery.trim().length > 0 && isLibraryReady)

	useLayoutEffect(() => {
		window.electronAPI?.resizeWidget(isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT)
	}, [isExpanded])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return
			if (view === 'playlist') {
				backToSearch()
			} else {
				window.electronAPI?.hideWidget()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [view, backToSearch])

	const hasPlaylistResults = !!filteredPlaylists && filteredPlaylists.length > 0
	const hasTrackResults = !!filteredTracks && filteredTracks.length > 0

	return (
		<div className="search-widget">
			<div className="search-widget__bar">
				<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
					<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M21 21l-4.35-4.35"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
				<input
					ref={inputRef}
					type="text"
					className="search-widget__input"
					aria-label="Поиск трека или плейлиста"
					placeholder="Поиск трека или плейлиста"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{isExpanded && (
				<div className="search-widget__panel">
					{view === 'playlist' ? (
						<>
							<button
								type="button"
								className="search-widget__back"
								onClick={backToSearch}
								aria-label="Назад к поиску"
							>
								<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
									<path
										d="M15 6l-6 6 6 6"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>{activePlaylist?.title ?? 'Плейлист'}</span>
							</button>
							<TracksList
								tracks={playlistTracks ?? []}
								isLoading={isPlaylistTracksLoading}
								error={playlistTracksError}
								variant="collection"
								isPreview
							/>
						</>
					) : (
						<>
							{hasPlaylistResults && (
								<section className="search-widget__section">
									<h4 className="search-widget__section-title">Плейлисты</h4>
									<div className="search-widget__playlists">
										{filteredPlaylists.map((playlist) => (
											<button
												type="button"
												key={playlist.id}
												className="search-widget__playlist"
												onClick={() => openPlaylist(playlist.id)}
											>
												<CoverImage
													coverPath={playlist.cover_path}
													alt={playlist.title}
													className="search-widget__playlist-cover"
													kind="playlist"
												/>
												<span className="search-widget__playlist-title">{playlist.title}</span>
											</button>
										))}
									</div>
								</section>
							)}

							{hasTrackResults && (
								<section className="search-widget__section">
									<h4 className="search-widget__section-title">Треки</h4>
									<TracksList
										tracks={filteredTracks.slice(0, 20)}
										isLoading={false}
										error={null}
										variant="collection"
										isPreview
									/>
								</section>
							)}

							{!hasPlaylistResults && !hasTrackResults && (
								<p className="search-widget__empty">Ничего не найдено</p>
							)}
						</>
					)}
				</div>
			)}
		</div>
	)
}

export default SearchWidget
