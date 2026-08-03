import { useEffect, useState } from 'react'
import useTracks from '@/entities/Track/model/useTracks.ts'
import CreatePlaylist from '@/features/CreatePlaylist'
import UploadTrack from '@/features/UploadTrack'
import useTrackSearch from '@/shared/lib/useTrackSearch.ts'
import type { ActiveModal } from '@/shared/types/utils.ts'
import Modal from '@/shared/ui/Modal'
import Popover from '@/shared/ui/Popover'
import CollectionHeader from '@/widgets/CollectionHeader'
import PlaylistsList from '@/widgets/PlaylistsList'
import ShuffleBanner from '@/widgets/ShuffleBanner'
import TracksList from '@/widgets/TracksList'
import './Home.scss'

const Home = () => {
	const [activeModal, setActiveModal] = useState<ActiveModal>(null)
	const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
	const [isSearchFocused, setIsSearchFocused] = useState(false)

	useEffect(() => {
		if (!isAddMenuOpen) return

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setIsAddMenuOpen(false)
		}

		document.addEventListener('keydown', handleEscape)

		return () => document.removeEventListener('keydown', handleEscape)
	}, [isAddMenuOpen])

	const { data, isLoading, error } = useTracks()

	const { searchQuery, setSearchQuery, filteredTracks } = useTrackSearch(data)

	const collectionData = filteredTracks?.slice(0, 8)

	const isSearchExpanded = isSearchFocused || searchQuery.length > 0

	return (
		<div className="home">
			<Modal isOpen={activeModal === 'upload-track'} onClose={() => setActiveModal(null)}>
				<UploadTrack onClose={() => setActiveModal(null)} />
			</Modal>
			<Modal isOpen={activeModal === 'create-playlist'} onClose={() => setActiveModal(null)}>
				<CreatePlaylist onClose={() => setActiveModal(null)} />
			</Modal>
			<div className={`home__toolbar ${isSearchExpanded ? 'home__toolbar--search-expanded' : ''}`}>
				<label className="home__search">
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
						className="home__search-input"
						aria-label="Поиск трека или плейлиста"
						placeholder="Поиск трека или плейлиста"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						onFocus={() => setIsSearchFocused(true)}
						onBlur={() => setIsSearchFocused(false)}
						onKeyDown={(event) => {
							if (event.key !== 'Escape') return
							setSearchQuery('')
							event.currentTarget.blur()
						}}
					/>
				</label>
				<div className="home__toolbar-actions">
					{isAddMenuOpen && (
						<div
							className="home__add-menu-overlay"
							aria-hidden="true"
							onClick={() => setIsAddMenuOpen(false)}
						/>
					)}
					<div className="home__add-menu">
						<div className="home__add-menu-collapse">
							<button
								type="button"
								className="home__toolbar-button home__toolbar-button--accent"
								aria-haspopup="menu"
								aria-expanded={isAddMenuOpen}
								onClick={() => setIsAddMenuOpen((open) => !open)}
							>
								Добавить
							</button>
						</div>
						{isAddMenuOpen && (
							<Popover>
								<button
									type="button"
									onClick={() => {
										setIsAddMenuOpen(false)
										setActiveModal('upload-track')
									}}
								>
									Добавить трек
								</button>
								<button
									type="button"
									onClick={() => {
										setIsAddMenuOpen(false)
										setActiveModal('create-playlist')
									}}
								>
									Создать плейлист
								</button>
							</Popover>
						)}
					</div>
				</div>
			</div>
			{!searchQuery && <ShuffleBanner />}
			<PlaylistsList searchQuery={searchQuery} />
			<div className="home__section">
				<CollectionHeader />
				<TracksList
					tracks={collectionData ?? []}
					isLoading={isLoading}
					error={error}
					variant="collection"
					isPreview={true}
				/>
			</div>
		</div>
	)
}

export default Home
