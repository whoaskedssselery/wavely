import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
	type ChangeEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useRef,
	useState,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
	fetchPlaylist,
	fetchPlaylistTracks,
	updatePlaylistCover,
	updatePlaylistDescription,
	updatePlaylistTitle,
} from '@/api/playlists.ts'
import DeletePlaylist from '@/components/DeletePlaylist'
import Modal from '@/components/Modal'
import Popover from '@/components/Popover'
import TracksList from '@/components/TracksList'
import { supabase } from '@/lib/supabase.ts'
import { useAuthStore } from '@/store/authStore.ts'
import { pluralize } from '@/utils/pluralize.ts'
import './Playlist.scss'

const Playlist = () => {
	const { user } = useAuthStore()

	const { playlistId } = useParams()

	const navigate = useNavigate()

	const queryClient = useQueryClient()

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

	const [isEditingTitle, setEditingTitle] = useState(false)
	const [titleDraft, setTitleDraft] = useState('')

	const [isEditingDescription, setEditingDescription] = useState(false)
	const [descriptionDraft, setDescriptionDraft] = useState('')

	const [searchQuery, setSearchQuery] = useState<string>('')

	const toggleMenu = () => {
		setMenuOpen(!isMenuOpen)
	}

	const { mutate: mutateTitle } = useMutation({
		mutationFn: (title: string) => updatePlaylistTitle(playlistId!, title),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })
		},
	})

	const { mutate: mutateDescription } = useMutation({
		mutationFn: (description: string) => updatePlaylistDescription(playlistId!, description),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })
		},
	})

	const { mutate: mutateCover } = useMutation({
		mutationFn: (coverFile: File) =>
			updatePlaylistCover(playlistId!, user!.id, coverFile, playlistData?.cover_path ?? null),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })
		},
	})

	const startEditingTitle = () => {
		setTitleDraft(playlistData?.title ?? '')
		setEditingTitle(true)
	}

	const saveTitle = () => {
		setEditingTitle(false)
		if (titleDraft !== (playlistData?.title ?? '')) {
			mutateTitle(titleDraft)
		}
	}

	const startEditingDescription = () => {
		setDescriptionDraft(playlistData?.description ?? '')
		setEditingDescription(true)
	}

	const saveDescription = () => {
		setEditingDescription(false)
		if (descriptionDraft !== (playlistData?.description ?? '')) {
			mutateDescription(descriptionDraft)
		}
	}

	const titleInputRef = useRef<HTMLInputElement>(null)
	const descriptionRef = useRef<HTMLTextAreaElement>(null)
	const coverInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isEditingTitle) titleInputRef.current?.focus()
	}, [isEditingTitle])

	useEffect(() => {
		if (isEditingDescription) descriptionRef.current?.focus()
	}, [isEditingDescription])

	const handleTitleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Escape') {
			event.stopPropagation()
			setEditingTitle(false)
			return
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			event.currentTarget.blur()
		}
	}

	const handleDescriptionKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Escape') {
			event.stopPropagation()
			setEditingDescription(false)
			return
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			event.currentTarget.blur()
		}
	}

	const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) mutateCover(file)
		event.target.value = ''
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

	const filteredTracks = tracks?.filter((track) => {
		const query = searchQuery.toLocaleLowerCase()
		return track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query)
	})

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
						<button
							type="button"
							className="playlist__cover-wrap"
							aria-label="Изменить обложку"
							onClick={() => coverInputRef.current?.click()}
						>
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
							<span className="playlist__cover-overlay" aria-hidden="true">
								<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
						</button>
						<input
							ref={coverInputRef}
							type="file"
							accept="image/*"
							className="playlist__cover-input"
							hidden
							onChange={handleCoverChange}
						/>
						<div className="playlist__info">
							<div className="playlist__title-row">
								{isEditingTitle ? (
									<div className="playlist__title-edit">
										<input
											ref={titleInputRef}
											type="text"
											className="playlist__title playlist__title--editing"
											value={titleDraft}
											maxLength={64}
											onChange={(event) => setTitleDraft(event.target.value)}
											onBlur={saveTitle}
											onKeyDown={handleTitleKeyDown}
										/>
										{titleDraft.length >= 64 && (
											<span className="playlist__limit-warning">Достигнут лимит в 64 символа</span>
										)}
									</div>
								) : (
									<h1 className="playlist__title">
										<button
											type="button"
											className="playlist__title-trigger"
											onClick={startEditingTitle}
										>
											{playlistData.title}
										</button>
									</h1>
								)}
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
							{isEditingDescription ? (
								<div className="playlist__description-edit">
									<textarea
										ref={descriptionRef}
										className="playlist__description playlist__description--editing"
										value={descriptionDraft}
										maxLength={64}
										onChange={(event) => setDescriptionDraft(event.target.value)}
										onBlur={saveDescription}
										onKeyDown={handleDescriptionKeyDown}
									/>
									{descriptionDraft.length >= 64 && (
										<span className="playlist__limit-warning">Достигнут лимит в 64 символа</span>
									)}
								</div>
							) : (
								<button
									type="button"
									className={`playlist__description ${playlistData.description ? '' : 'playlist__description--empty'}`}
									onClick={startEditingDescription}
								>
									{playlistData.description || 'Добавить описание'}
								</button>
							)}
							<span className="playlist__count">
								{trackCount} {pluralize(trackCount, ['трек', 'трека', 'треков'])}
								{playlistData.author && ` · ${playlistData.author}`}
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
				<input
					type="text"
					className="playlist__search-input"
					placeholder="Поиск трека"
					onChange={(event) => {
						setSearchQuery(event.target.value)
					}}
				/>
			</div>

			<TracksList
				tracks={filteredTracks ?? []}
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
