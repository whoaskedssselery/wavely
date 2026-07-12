import { useState } from 'react'
import Modal from '@/components/Modal'
import TracksList from '@/components/TracksList'
import CollectionHeader from '@/components/CollectionHeader'
import './Home.scss'
import Upload from '@/pages/Upload'

const Home = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	
	const onOpenModal = () => {
		setIsModalOpen(true)
	}
	
	const onCloseModal = () => {
		setIsModalOpen(false)
	}
	
	return (
		<div
			className="home"
		>
			<Modal isOpen={isModalOpen} onClose={onCloseModal}>
				<Upload onClose={onCloseModal} />
			</Modal>
			<CollectionHeader onOpenModal={onOpenModal} />
			<TracksList />
		</div>
	)
}

export default Home