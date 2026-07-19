import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchPlaylist, fetchPlaylistTracks } from '@/api/playlists.ts'
import TracksList from '@/components/TracksList'
import { supabase } from '@/lib/supabase.ts'
import { useAuthStore } from '@/store/authStore.ts'
import { pluralize } from '@/utils/pluralize.ts'
import Popover from '@/components/Popover'
import Modal from '@/components/Modal'
import DeletePlaylist from '@/components/DeletePlaylist'
import './Playlist.scss'

const Playlist = () => {
	const { user } = useAuthStore()

	const { playlistId } = useParams()

	const navigate = useNavigate()

	const {
		data: playlistData,
		isLoading: isPlaylistLoading,
		error: playlistError,
	} = useQuery({
		queryKey: ['playlist', playlistId],
		queryFn: () => fetchPlaylist(playlistId!),
		enabled: !!playlistId,
	})

	const {
		data: tracks,
		isLoading: isTracksLoading,
		error: tracksError,
	} = useQuery({
		queryKey: ['playlist_tracks', playlistId],
		queryFn: () => fetchPlaylistTracks(playlistId!),
		enabled: !!playlistId,
	})

	const [isMenuOpen, setMenuOpen] = useState<boolean>(false)
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)

	const toggleMenu = () => {
		setMenuOpen(!isMenuOpen)
	}

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return
			if (isMenuOpen) {
				setMenuOpen(false)
				return
			}
			navigate('/')
		}

		window.addEventListener('keydown', handleEscape)

		return () => {
			window.removeEventListener('keydown', handleEscape)
		}
	}, [navigate, isMenuOpen])

	if (!user) {
		return null
	}

	const trackCount = tracks?.length ?? 0

	return (
		<section className="playlist">
			{isMenuOpen && (
				<div className="playlist__overlay" aria-hidden="true" onClick={() => setMenuOpen(false)} />
			)}
			<div className="playlist__header">
				<Link to="/" className="playlist__back" aria-label="Назад">
					<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path
							d="M19 12H5M11 18l-6-6 6-6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
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
									src={
										supabase.storage.from('covers').getPublicUrl(playlistData.cover_path).data
											.publicUrl
									}
									alt={playlistData.title}
								/>
							) : (
								<svg
									aria-hidden="true"
									className="playlist__cover playlist__cover--placeholder"
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
						</div>
						<div className="playlist__info">
							<div className="playlist__title-row">
								<h1 className="playlist__title">{playlistData.title}</h1>
								<button
									type="button"
									className={`playlist__menu ${isMenuOpen ? 'playlist__menu--active' : ''}`}
									aria-label="Меню плейлиста"
									onClick={toggleMenu}
								>
									<svg
										aria-hidden="true"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<circle cx="5" cy="12" r="2" />
										<circle cx="12" cy="12" r="2" />
										<circle cx="19" cy="12" r="2" />
									</svg>
								</button>
								{isMenuOpen && (
									<Popover placement="right">
										<button
											className="popover__item--danger"
											type="button"
											onClick={() => setDeleteModalOpen(true)}
										>
											Удалить плейлист
										</button>
									</Popover>
								)}
							</div>
							<span className="playlist__count">
								{trackCount} {pluralize(trackCount, ['трек', 'трека', 'треков'])}
							</span>
						</div>
					</>
				)}
			</div>

			<div className="playlist__search">
				<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
					<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M21 21l-4.35-4.35"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
				<input type="text" className="playlist__search-input" placeholder="Поиск трека" disabled />
			</div>

			<TracksList
				tracks={tracks ?? []}
				isLoading={isTracksLoading}
				error={tracksError}
				variant="playlist"
				playlistId={playlistId}
			/>

			<Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
				{playlistData && (
					<DeletePlaylist playlist={playlistData} onClose={() => setDeleteModalOpen(false)} />
				)}
			</Modal>
		</section>
	)
}

export default Playlist
