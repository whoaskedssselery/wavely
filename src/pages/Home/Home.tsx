import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchTracks } from '@/api/tracks.ts'
import CollectionHeader from '@/components/CollectionHeader'
import CreatePlaylist from '@/components/CreatePlaylist'
import Modal from '@/components/Modal'
import PlaylistsList from '@/components/PlaylistsList'
import TracksList from '@/components/TracksList'
import UploadTrack from '@/components/UploadTrack'
import { useAuthStore } from '@/store/authStore.ts'
import type { ActiveModal } from '@/types/utils.ts'
import './Home.scss'

const Home = () => {
	const [activeModal, setActiveModal] = useState<ActiveModal>(null)

	const { user } = useAuthStore()

	const { data, isLoading, error } = useQuery({
		queryKey: ['tracks', user?.id],
		queryFn: () => fetchTracks(user!.id),
		enabled: !!user,
	})

	const collectionData = data?.slice(0, 8)

	return (
		<div className="home">
			<Modal isOpen={activeModal === 'upload-track'} onClose={() => setActiveModal(null)}>
				<UploadTrack onClose={() => setActiveModal(null)} />
			</Modal>
			<Modal isOpen={activeModal === 'create-playlist'} onClose={() => setActiveModal(null)}>
				<CreatePlaylist onClose={() => setActiveModal(null)} />
			</Modal>
			<CollectionHeader onOpenModal={() => setActiveModal('upload-track')} />
			<TracksList
				tracks={collectionData ?? []}
				isLoading={isLoading}
				error={error}
				variant="collection"
			/>
			<PlaylistsList onCreatePlaylist={() => setActiveModal('create-playlist')} />
		</div>
	)
}

export default Home
