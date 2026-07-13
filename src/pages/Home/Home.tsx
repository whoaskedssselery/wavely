import { useState } from 'react'
import type {ActiveModal} from '@/types/utils.ts'
import Modal from '@/components/Modal'
import TracksList from '@/components/TracksList'
import CollectionHeader from '@/components/CollectionHeader'
import UploadTrack from '@/components/UploadTrack'
import CreatePlaylist from '@/components/CreatePlaylist'
import PlaylistsList from '@/components/PlaylistsList'
import './Home.scss'

const Home = () => {
	const [activeModal, setActiveModal] = useState<ActiveModal>(null)
	
	return (
		<div
			className="home"
		>
			<Modal isOpen={activeModal === 'upload-track'} onClose={() => setActiveModal(null)}>
				<UploadTrack onClose={() => setActiveModal(null)} />
			</Modal>
			<Modal isOpen={activeModal === 'create-playlist'} onClose={() => setActiveModal(null)}>
				<CreatePlaylist onClose={() => setActiveModal(null)} />
			</Modal>
			<CollectionHeader onOpenModal={() => setActiveModal('upload-track')} />
			<TracksList />
			<PlaylistsList onCreatePlaylist={() => setActiveModal('create-playlist')} />
		</div>
	)
}

export default Home