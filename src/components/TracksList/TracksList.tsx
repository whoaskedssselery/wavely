import { type MouseEvent, useEffect, useRef, useState } from 'react'
import useScrollbarVisibility from '@/hooks/useScrollbarVisibility.ts'
import { usePlayerStore } from '@/store/playerStore.ts'
import type { PlayableTrack } from '@/types/tracks.ts'
import type { ActiveTrackModal, TracksListProps } from '@/types/utils.ts'
import './TracksList.scss'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reorderPlaylistTracks } from '@/api/playlists.ts'
import AddToPlaylist from '@/components/AddToPlaylist'
import DeleteTrack from '@/components/DeleteTrack'
import Modal from '@/components/Modal'
import SortableTrackCard from './ui/SortableTrackCard'

const TracksList = (props: TracksListProps) => {
	const { tracks, isLoading, error, variant, playlistId, isPreview } = props

	const { currentTrack, isPlaying, playTrack, syncQueue, resyncShuffleHistory, togglePlay } =
		usePlayerStore()

	const [openMenuTrackId, setOpenMenuTrackId] = useState<string>()
	const [activeTrackModal, setActiveTrackModal] = useState<ActiveTrackModal>()

	const hasSyncedQueue = useRef(false)
	const listRef = useRef<HTMLElement>(null)

	useScrollbarVisibility(listRef)

	const queryClient = useQueryClient()

	const onMutate = (variables: PlayableTrack[]) => {
		const previous = queryClient.getQueryData<PlayableTrack[]>(['playlist_tracks', playlistId])
		queryClient.setQueryData(['playlist_tracks', playlistId], variables)

		return { previous }
	}

	const onError = (
		_err: Error,
		_variables: PlayableTrack[],
		context?: { previous: PlayableTrack[] | undefined },
	) => {
		if (context) {
			queryClient.setQueryData(['playlist_tracks', playlistId], context.previous)
		}
	}

	const onSettled = () => {
		queryClient.invalidateQueries({ queryKey: ['playlist_tracks', playlistId] })
	}

	const { mutate } = useMutation({
		mutationFn: reorderPlaylistTracks,
		onMutate,
		onError,
		onSettled,
	})

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	)

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

	const onDeleted = () => {
		setOpenMenuTrackId(undefined)
		setActiveTrackModal(undefined)
	}

	const onAdded = () => {
		setOpenMenuTrackId(undefined)
		setActiveTrackModal(undefined)
	}

	const handleMenu = (event: MouseEvent, trackId: string) => {
		event.stopPropagation()

		if (trackId === openMenuTrackId) {
			setOpenMenuTrackId(undefined)
		} else {
			setOpenMenuTrackId(trackId)
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || active.id === over.id) return

		const oldIndex = tracks.findIndex((t) => t.id === active.id)
		const newIndex = tracks.findIndex((t) => t.id === over.id)

		const newOrder = arrayMove(tracks, oldIndex, newIndex)

		mutate(newOrder)
	}

	const onMenuClick = (
		event: MouseEvent,
		type: 'delete' | 'add-to-playlist',
		track: PlayableTrack,
	) => {
		event.stopPropagation()
		setActiveTrackModal({ type, track })
	}

	useEffect(() => {
		if (hasSyncedQueue.current) return
		if (!tracks || !currentTrack) return

		const index = tracks.findIndex((t) => t.id === currentTrack.id)
		if (index !== -1) {
			syncQueue(tracks, index)
			hasSyncedQueue.current = true
			resyncShuffleHistory()
		}
	}, [tracks, currentTrack, syncQueue, resyncShuffleHistory])

	useEffect(() => {
		if (!openMenuTrackId) return

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpenMenuTrackId(undefined)
			}
		}

		document.addEventListener('keydown', handleEscape)

		return () => document.removeEventListener('keydown', handleEscape)
	}, [openMenuTrackId])

	return (
		<DndContext sensors={sensors} onDragEnd={variant === 'playlist' ? handleDragEnd : undefined}>
			<SortableContext
				items={tracks?.map((t) => t.id) ?? []}
				strategy={verticalListSortingStrategy}
			>
				<section
					ref={listRef}
					className={`tracks-list ${isPreview ? 'tracks-list--preview' : 'tracks-list--bounded'} ${isPreview && (tracks?.length ?? 0) > 4 ? 'tracks-list--two-col' : ''}`}
				>
					{openMenuTrackId && (
						<div
							className="tracks-list__overlay"
							aria-hidden="true"
							onClick={() => setOpenMenuTrackId(undefined)}
						/>
					)}
					{isLoading && <p className="tracks-list__loading">Загружаем треки</p>}
					{error && <p className="tracks-list__error">Не удалось загрузить данные</p>}
					{tracks && tracks.length === 0 && (
						<p className="tracks-list__warning">Вы не добавили еще ни одного трека</p>
					)}
					{tracks?.map((track) => {
						const isActive = currentTrack?.id === track.id && isPlaying

						return (
							<SortableTrackCard
								key={track.id}
								track={track}
								isActive={isActive}
								variant={variant}
								openMenuTrackId={openMenuTrackId}
								onTrackClick={onTrackClick}
								handleMenu={handleMenu}
								onMenuClick={onMenuClick}
							/>
						)
					})}
				</section>
				<Modal
					isOpen={activeTrackModal?.type === 'delete'}
					onClose={() => setActiveTrackModal(undefined)}
				>
					{activeTrackModal && (
						<DeleteTrack
							track={activeTrackModal.track}
							variant={variant}
							playlistId={playlistId}
							onClose={() => setActiveTrackModal(undefined)}
							onDeleted={onDeleted}
						/>
					)}
				</Modal>
				<Modal
					isOpen={activeTrackModal?.type === 'add-to-playlist'}
					onClose={() => setActiveTrackModal(undefined)}
				>
					{activeTrackModal && (
						<AddToPlaylist
							track={activeTrackModal.track}
							onClose={() => setActiveTrackModal(undefined)}
							onAdded={onAdded}
						/>
					)}
				</Modal>
			</SortableContext>
		</DndContext>
	)
}

export default TracksList
