import * as React from 'react'

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