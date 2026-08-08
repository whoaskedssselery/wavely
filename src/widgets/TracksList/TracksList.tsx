import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useRef } from 'react'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'
import AddToPlaylist from '@/features/AddToPlaylist'
import DeleteTrack from '@/features/DeleteTrack'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import useSyncPersistedQueue from '@/features/PlayerControls/model/useSyncPersistedQueue.ts'
import useReorderTracks from '@/features/ReorderTracks/model/useReorderTracks.ts'
import useScrollbarVisibility from '@/shared/lib/useScrollbarVisibility.ts'
import Modal from '@/shared/ui/Modal'
import useTrackRowMenu from '@/widgets/TracksList/model.ts'
import './TracksList.scss'
import SortableTrackCard from './ui/SortableTrackCard'

interface TracksListProps {
	tracks: PlayableTrack[]
	isLoading: boolean
	error: Error | null
	variant: 'collection' | 'playlist'
	playlistId?: string
	isPreview?: boolean
}

const TracksList = (props: TracksListProps) => {
	const { tracks, isLoading, error, variant, playlistId, isPreview } = props

	const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore()

	const {
		openMenuTrackId,
		activeTrackModal,
		handleMenu,
		onMenuClick,
		closeMenu,
		closeModal,
		closeAll,
	} = useTrackRowMenu()

	const listRef = useRef<HTMLElement>(null)

	useSyncPersistedQueue(tracks, isPreview)
	useScrollbarVisibility(listRef)

	const { sensors, handleDragEnd } = useReorderTracks(tracks, playlistId)

	const onTrackClick = (track: PlayableTrack) => {
		if (currentTrack === null || currentTrack !== track) {
			if (tracks) {
				const index = tracks.findIndex((t) => t.id === track.id)
				playTrack(track, tracks, index)
			}
		} else {
			togglePlay()
		}
	}

	const trackCards = (
		<section
			ref={listRef}
			className={`tracks-list ${isPreview ? 'tracks-list--preview' : 'tracks-list--bounded'}`}
		>
			{openMenuTrackId && (
				<div className="tracks-list__overlay" aria-hidden="true" onClick={closeMenu} />
			)}
			{isLoading && <p className="tracks-list__loading">Загружаем треки</p>}
			{error && <p className="tracks-list__error">Не удалось загрузить данные</p>}
			{tracks && tracks.length === 0 && (
				<p className="tracks-list__warning">Вы не добавили еще ни одного трека</p>
			)}
			{tracks?.map((track) => {
				const isCurrent = currentTrack?.id === track.id
				const isActive = isCurrent && isPlaying

				return (
					<SortableTrackCard
						key={track.id}
						track={track}
						isActive={isActive}
						isCurrent={isCurrent}
						variant={variant}
						openMenuTrackId={openMenuTrackId}
						onTrackClick={onTrackClick}
						handleMenu={handleMenu}
						onMenuClick={onMenuClick}
					/>
				)
			})}
		</section>
	)

	return (
		<>
			{variant === 'playlist' ? (
				<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
					<SortableContext
						items={tracks?.map((t) => t.id) ?? []}
						strategy={verticalListSortingStrategy}
					>
						{trackCards}
					</SortableContext>
				</DndContext>
			) : (
				trackCards
			)}
			<Modal isOpen={activeTrackModal?.type === 'delete'} onClose={closeModal}>
				{activeTrackModal && (
					<DeleteTrack
						track={activeTrackModal.track}
						variant={variant}
						playlistId={playlistId}
						onClose={closeModal}
						onDeleted={closeAll}
					/>
				)}
			</Modal>
			<Modal isOpen={activeTrackModal?.type === 'add-to-playlist'} onClose={closeModal} size="lg">
				{activeTrackModal && (
					<AddToPlaylist track={activeTrackModal.track} onClose={closeModal} onAdded={closeAll} />
				)}
			</Modal>
		</>
	)
}

export default TracksList
