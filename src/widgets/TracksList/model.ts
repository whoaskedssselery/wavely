import { type MouseEvent, useEffect, useState } from 'react'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'
import type { ActiveTrackModal } from '@/shared/types/utils.ts'

const useTrackRowMenu = () => {
	const [openMenuTrackId, setOpenMenuTrackId] = useState<string>()
	const [activeTrackModal, setActiveTrackModal] = useState<ActiveTrackModal>()

	const closeMenu = () => setOpenMenuTrackId(undefined)
	const closeModal = () => setActiveTrackModal(undefined)
	const closeAll = () => {
		closeMenu()
		closeModal()
	}

	const handleMenu = (event: MouseEvent, trackId: string) => {
		event.stopPropagation()
		setOpenMenuTrackId(trackId === openMenuTrackId ? undefined : trackId)
	}

	const onMenuClick = (
		event: MouseEvent,
		type: 'delete' | 'add-to-playlist',
		track: PlayableTrack,
	) => {
		event.stopPropagation()
		setOpenMenuTrackId(undefined)
		setActiveTrackModal({ type, track })
	}

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

	return {
		openMenuTrackId,
		activeTrackModal,
		handleMenu,
		onMenuClick,
		closeMenu,
		closeModal,
		closeAll,
	}
}

export default useTrackRowMenu
