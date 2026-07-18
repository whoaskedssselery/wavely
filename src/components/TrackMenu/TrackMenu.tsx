import './TrackMenu.scss'
import type { TrackMenuProps } from '@/types/utils.ts'

const TrackMenu = (props: TrackMenuProps) => {
	const { variant, onDelete, onAddToPlaylist } = props

	return (
		<div className="track-menu">
			{variant === 'collection' && (
				<>
					<button className="track-menu__add-button" onClick={onAddToPlaylist} type="button">
						Добавить в плейлист
					</button>
					<button className="track-menu__delete-button" onClick={onDelete} type="button">
						Удалить трек
					</button>
				</>
			)}
			{variant === 'playlist' && (
				<>
					<button className="track-menu__add-button" onClick={onAddToPlaylist} type="button">
						Добавить в плейлист
					</button>
					<button className="track-menu__delete-button" onClick={onDelete} type="button">
						Убрать из плейлиста
					</button>
				</>
			)}
		</div>
	)
}

export default TrackMenu
