import { type MouseEvent } from 'react'
import type { PlayableTrack } from '@/types/tracks.ts'

export type ActiveModal = 'upload-track' | 'create-playlist' | null

export interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
}

export interface UploadProps {
	onClose: () => void
}

export interface CollectionHeaderProps {
	onOpenModal: () => void
}

export interface PlaylistsListProps {
	onCreatePlaylist: () => void
}

export interface SectionHeaderProps {
	title: string
	counterText: string
	buttonText: string
	onButtonClick: () => void
}

export interface TrackMenuProps {
	variant: 'collection' | 'playlist'
	onDelete: (event: MouseEvent) => void
	onAddToPlaylist: (event: MouseEvent) => void
}

export interface TracksListProps {
	tracks: PlayableTrack[]
	isLoading: boolean
	error: Error | null
	variant: 'collection' | 'playlist'
	playlistId?: string
}

export interface DeleteTrackProps {
	track: PlayableTrack
	variant: 'collection' | 'playlist'
	playlistId?: string
	onClose: () => void
	onDeleted: () => void
}

export interface AddToPlaylistProps {
	track: PlayableTrack
	onClose: () => void
	onAdded: () => void
}

export interface ActiveTrackModal {
	type: 'delete' | 'add-to-playlist'
	track: PlayableTrack
}