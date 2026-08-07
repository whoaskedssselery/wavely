import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import PlayerControlsView from './PlayerControlsView.tsx'
import './Player.scss'

const Player = () => {
	const currentTrack = usePlayerStore((state) => state.currentTrack)

	if (!currentTrack) return null

	return (
		<section className="player">
			<PlayerControlsView />
		</section>
	)
}

export default Player
