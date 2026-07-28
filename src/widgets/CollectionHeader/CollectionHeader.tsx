import { useNavigate } from 'react-router-dom'
import useTracks from '@/entities/Track/model/useTracks.ts'
import { pluralize } from '@/shared/lib/pluralize.ts'
import SectionHeader from '@/shared/ui/SectionHeader'

const CollectionHeader = () => {
	const navigate = useNavigate()

	const { data } = useTracks()

	const trackCount = data?.length ?? 0

	return (
		<SectionHeader
			title="Моя коллекция"
			counterText={`${trackCount} ${pluralize(trackCount, ['трек', 'трека', 'треков'])}`}
			onTitleClick={() => navigate('/collection')}
		/>
	)
}

export default CollectionHeader
