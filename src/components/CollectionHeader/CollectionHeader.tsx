import { useQuery } from '@tanstack/react-query'
import { fetchTracks } from '@/api/tracks.ts'
import { useAuthStore } from '@/store/authStore.ts'
import type { CollectionHeaderProps } from '@/types/utils.ts'
import './CollectionHeader.scss'

const CollectionHeader = (props: CollectionHeaderProps) => {
	const {
		onOpenModal,
	} = props
	
	const { user } = useAuthStore()

	if (!user) {
		return null
	}

	const { data } = useQuery({
		queryKey: ['tracks', user.id],
		queryFn: () => fetchTracks(user.id),
	})
	
	return (
		<section
			className="collection-header"
		>
			<h2 className="collection-header__title">Моя коллекция</h2>
			<span className="collection-header__counter">{data?.length ?? 0} треков</span>
			<button className="collection-header__add-button"
			  onClick={onOpenModal}
				type="button"
			>Добавить трек</button>
		</section>
	)
}

export default CollectionHeader