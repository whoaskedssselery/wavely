import type { ReactNode } from 'react'

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

export type ArrayToUpdate = { id: string; position: number }[]
