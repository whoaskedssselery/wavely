import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	type ChangeEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useRef,
	useState,
} from 'react'
import {
	updatePlaylistCover,
	updatePlaylistDescription,
	updatePlaylistTitle,
} from '@/entities/Playlist/api/playlists.ts'
import type { Playlist } from '@/entities/Playlist/model/types.ts'

const usePlaylistMetaEditing = (
	playlistId: string,
	userId: string,
	playlistData: Playlist | null | undefined,
) => {
	const queryClient = useQueryClient()

	const [isEditingTitle, setEditingTitle] = useState(false)
	const [titleDraft, setTitleDraft] = useState('')

	const [isEditingDescription, setEditingDescription] = useState(false)
	const [descriptionDraft, setDescriptionDraft] = useState('')

	const titleInputRef = useRef<HTMLInputElement>(null)
	const descriptionRef = useRef<HTMLTextAreaElement>(null)
	const coverInputRef = useRef<HTMLInputElement>(null)

	const invalidatePlaylist = () =>
		queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })

	const { mutate: mutateTitle } = useMutation({
		mutationFn: (title: string) => updatePlaylistTitle(playlistId, title),
		onSuccess: invalidatePlaylist,
	})

	const { mutate: mutateDescription } = useMutation({
		mutationFn: (description: string) => updatePlaylistDescription(playlistId, description),
		onSuccess: invalidatePlaylist,
	})

	const { mutate: mutateCover } = useMutation({
		mutationFn: (coverFile: File) =>
			updatePlaylistCover(playlistId, userId, coverFile, playlistData?.cover_path ?? null),
		onSuccess: invalidatePlaylist,
	})

	const startEditingTitle = () => {
		setTitleDraft(playlistData?.title ?? '')
		setEditingTitle(true)
	}

	const saveTitle = () => {
		setEditingTitle(false)
		if (titleDraft !== (playlistData?.title ?? '')) {
			mutateTitle(titleDraft)
		}
	}

	const startEditingDescription = () => {
		setDescriptionDraft(playlistData?.description ?? '')
		setEditingDescription(true)
	}

	const saveDescription = () => {
		setEditingDescription(false)
		if (descriptionDraft !== (playlistData?.description ?? '')) {
			mutateDescription(descriptionDraft)
		}
	}

	useEffect(() => {
		if (isEditingTitle) titleInputRef.current?.focus()
	}, [isEditingTitle])

	useEffect(() => {
		if (isEditingDescription) descriptionRef.current?.focus()
	}, [isEditingDescription])

	const handleTitleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Escape') {
			event.stopPropagation()
			setEditingTitle(false)
			return
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			event.currentTarget.blur()
		}
	}

	const handleDescriptionKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Escape') {
			event.stopPropagation()
			setEditingDescription(false)
			return
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			event.currentTarget.blur()
		}
	}

	const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) mutateCover(file)
		event.target.value = ''
	}

	return {
		isEditingTitle,
		titleDraft,
		setTitleDraft,
		startEditingTitle,
		saveTitle,
		handleTitleKeyDown,
		titleInputRef,
		isEditingDescription,
		descriptionDraft,
		setDescriptionDraft,
		startEditingDescription,
		saveDescription,
		handleDescriptionKeyDown,
		descriptionRef,
		coverInputRef,
		handleCoverChange,
	}
}

export default usePlaylistMetaEditing
