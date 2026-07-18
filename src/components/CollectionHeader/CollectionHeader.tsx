import { useQuery } from '@tanstack/react-query'
import { fetchTracks } from '@/api/tracks.ts'
import SectionHeader from '@/components/SectionHeader'
import { useAuthStore } from '@/store/authStore.ts'
import type { CollectionHeaderProps } from '@/types/utils.ts'
import { pluralize } from '@/utils/pluralize.ts'

const CollectionHeader = (props: CollectionHeaderProps) => {
	const { onOpenModal } = props

	const { user } = useAuthStore()

	const { data } = useQuery({
		queryKey: ['tracks', user?.id],
		queryFn: () => fetchTracks(user!.id),
		enabled: !!user,
	})

	const trackCount = data?.length ?? 0

	if (!user) {
		return null
	}

	return (
		<SectionHeader
			title="Моя коллекция"
			counterText={`${trackCount} ${pluralize(trackCount, ['трек', 'трека', 'треков'])}`}
			buttonText="Добавить трек"
			onButtonClick={onOpenModal}
		/>
	)
}

export default CollectionHeader
