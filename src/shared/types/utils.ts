import type { MouseEvent, ReactNode } from 'react'
import type { Playlist } from '@/entities/Playlist/model/types.ts'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'

export type ActiveModal = 'upload-track' | 'create-playlist' | null

export interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: ReactNode
	size?: 'md' | 'lg'
}

export interface UploadProps {
	onClose: () => void
}

export interface SectionHeaderProps {
	title: string
	counterText: string
	children?: ReactNode
	onTitleClick?: () => void
}

export interface PopoverProps {
	children: ReactNode
	placement?: 'bottom-right' | 'right'
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
	isCurrent: boolean
	variant: 'collection' | 'playlist'
	openMenuTrackId?: string
	onTrackClick: (track: PlayableTrack) => void
	handleMenu: (event: MouseEvent, trackId: string) => void
	onMenuClick: (event: MouseEvent, type: 'delete' | 'add-to-playlist', track: PlayableTrack) => void
}

export type ArrayToUpdate = { id: string; position: number }[]
