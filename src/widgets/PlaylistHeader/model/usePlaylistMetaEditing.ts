import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, useRef } from 'react'
import {
	updatePlaylistCover,
	updatePlaylistDescription,
	updatePlaylistTitle,
} from '@/entities/Playlist/api/playlists.ts'
import type { Playlist } from '@/entities/Playlist/model/types.ts'
import useInlineEdit from '@/shared/lib/useInlineEdit.ts'

const usePlaylistMetaEditing = (
	playlistId: string,
	userId: string,
	playlistData: Playlist | null | undefined,
) => {
	const queryClient = useQueryClient()

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

	const {
		isEditing: isEditingTitle,
		draft: titleDraft,
		setDraft: setTitleDraft,
		startEditing: startEditingTitle,
		save: saveTitle,
		handleKeyDown: handleTitleKeyDown,
		inputRef: titleInputRef,
	} = useInlineEdit<HTMLInputElement>({
		value: playlistData?.title ?? '',
		onSave: mutateTitle,
	})

	const {
		isEditing: isEditingDescription,
		draft: descriptionDraft,
		setDraft: setDescriptionDraft,
		startEditing: startEditingDescription,
		save: saveDescription,
		handleKeyDown: handleDescriptionKeyDown,
		inputRef: descriptionRef,
	} = useInlineEdit<HTMLTextAreaElement>({
		value: playlistData?.description ?? '',
		onSave: mutateDescription,
	})

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
