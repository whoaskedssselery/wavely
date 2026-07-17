import * as React from 'react'
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

export interface TracksListProps {
	tracks: PlayableTrack[]
	isLoading: boolean
	error: Error | null
	variant: 'collection' | 'playlist'
}