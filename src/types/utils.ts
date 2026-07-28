import type { MouseEvent, ReactNode } from 'react'
import type { Playlist } from '@/types/playlists'
import type { PlayableTrack } from '@/types/tracks.ts'

export type ActiveModal = 'upload-track' | 'create-playlist' | null

export interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: ReactNode
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
	onTitleClick?: () => void
}

export interface PopoverProps {
	children: ReactNode
	placement?: 'bottom-left' | 'bottom-right' | 'right'
}

export interface TracksListProps {
	tracks: PlayableTrack[]
	isLoading: boolean
	error: Error | null
	variant: 'collection' | 'playlist'
	playlistId?: string
	isPreview?: boolean
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

export interface DeletePlaylistProps {
	playlist: Playlist
	onClose: () => void
}

export interface ActiveTrackModal {
	type: 'delete' | 'add-to-playlist'
	track: PlayableTrack
}

export interface SortableTrackCardProps {
	track: PlayableTrack
	isActive: boolean
	variant: 'collection' | 'playlist'
	openMenuTrackId?: string
	onTrackClick: (track: PlayableTrack) => void
	handleMenu: (event: MouseEvent, trackId: string) => void
	onMenuClick: (event: MouseEvent, type: 'delete' | 'add-to-playlist', track: PlayableTrack) => void
}

export type ArrayToUpdate = { id: string; position: number }[]
