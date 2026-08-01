import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDuration } from '@/entities/Track/lib/formatDuration.ts'
import type { SortableTrackCardProps } from '@/shared/types/utils.ts'
import Popover from '@/shared/ui/Popover'

const SortableTrackCard = (props: SortableTrackCardProps) => {
	const {
		track,
		isActive,
		isCurrent,
		variant,
		openMenuTrackId,
		onTrackClick,
		handleMenu,
		onMenuClick,
	} = props

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: track.id })

	const playLabel = isCurrent
		? isActive
			? 'Пауза'
			: 'Продолжить'
		: `Воспроизвести «${track.title}»`

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			{...(variant === 'playlist' ? attributes : {})}
			{...(variant === 'playlist' ? listeners : {})}
			className={`tracks-list__card ${isCurrent ? 'tracks-list__card--current' : ''} ${openMenuTrackId === track.id ? 'tracks-list__card--menu-open' : ''}`}
		>
			<button
				type="button"
				className="tracks-list__play"
				aria-label={playLabel}
				onClick={() => onTrackClick(track)}
			>
				<span className="tracks-list__eq-wrap" aria-hidden="true">
					{isCurrent && (
						<span className={`tracks-list__eq ${isActive ? 'tracks-list__eq--playing' : ''}`}>
							<span />
							<span />
							<span />
						</span>
					)}
				</span>
				<div className="tracks-list__info">
					<h3 className="tracks-list__title">{track.title}</h3>
					<span className="tracks-list__artist">{track.artist}</span>
				</div>
			</button>
			<div className="tracks-list__meta">
				<span className="tracks-list__duration">{formatDuration(track.duration)}</span>
				<button
					type="button"
					className="tracks-list__menu"
					aria-label="Меню трека"
					onClick={(event) => handleMenu(event, track.id)}
				>
					<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<circle cx="3" cy="12" r="2.6" />
						<circle cx="12" cy="12" r="2.6" />
						<circle cx="21" cy="12" r="2.6" />
					</svg>
				</button>
				{openMenuTrackId === track.id && (
					<Popover>
						<button type="button" onClick={(event) => onMenuClick(event, 'add-to-playlist', track)}>
							Добавить в плейлист
						</button>
						<button
							type="button"
							className="popover__item--danger"
							onClick={(event) => onMenuClick(event, 'delete', track)}
						>
							{variant === 'collection' ? 'Удалить трек' : 'Убрать из плейлиста'}
						</button>
					</Popover>
				)}
			</div>
		</div>
	)
}

export default SortableTrackCard
