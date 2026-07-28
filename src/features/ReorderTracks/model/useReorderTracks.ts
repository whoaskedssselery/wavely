import { type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reorderPlaylistTracks } from '@/entities/Playlist/api/playlists.ts'
import type { PlayableTrack } from '@/entities/Track/model/types.ts'

const useReorderTracks = (tracks: PlayableTrack[], playlistId: string | undefined) => {
	const queryClient = useQueryClient()

	const { mutate } = useMutation({
		mutationFn: reorderPlaylistTracks,
		onMutate: (variables: PlayableTrack[]) => {
			const previous = queryClient.getQueryData<PlayableTrack[]>(['playlist_tracks', playlistId])
			queryClient.setQueryData(['playlist_tracks', playlistId], variables)

			return { previous }
		},
		onError: (
			_err: Error,
			_variables: PlayableTrack[],
			context?: { previous: PlayableTrack[] | undefined },
		) => {
			if (context) {
				queryClient.setQueryData(['playlist_tracks', playlistId], context.previous)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['playlist_tracks', playlistId] })
		},
	})

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || active.id === over.id) return

		const oldIndex = tracks.findIndex((track) => track.id === active.id)
		const newIndex = tracks.findIndex((track) => track.id === over.id)

		mutate(arrayMove(tracks, oldIndex, newIndex))
	}

	return { sensors, handleDragEnd }
}

export default useReorderTracks
