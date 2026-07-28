import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MouseEvent } from 'react'
import Popover from '@/components/Popover'
import { supabase } from '@/lib/supabase.ts'
import type { SortableTrackCardProps } from '@/types/utils.ts'
import { formatDuration } from '@/utils/formatDuration.ts'

const SortableTrackCard = (props: SortableTrackCardProps) => {
	const { track, isActive, variant, openMenuTrackId, onTrackClick, handleMenu, onMenuClick } = props

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: track.id })

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			{...(variant === 'playlist' ? attributes : {})}
			{...(variant === 'playlist' ? listeners : {})}
			className={`tracks-list__card ${openMenuTrackId === track.id ? 'tracks-list__card--menu-open' : ''}`}
			role="button"
			tabIndex={0}
			onClick={() => onTrackClick(track)}
			onKeyDown={(event) => {
				if (event.target !== event.currentTarget) return
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					onTrackClick(track)
				}
			}}
		>
			<div className="tracks-list__image-wrap">
				{isActive && <span className="tracks-list__pulse" />}
				{track.cover_path ? (
					<img
						className="tracks-list__image"
						src={supabase.storage.from('covers').getPublicUrl(track.cover_path).data.publicUrl}
						alt={track.title}
					/>
				) : (
					<svg
						aria-hidden="true"
						className="tracks-list__image tracks-list__image--placeholder"
						width="44"
						height="44"
						viewBox="0 0 24 24"
						fill="none"
					>
						<circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
						<circle cx="12" cy="12" r="3" fill="currentColor" />
					</svg>
				)}
				<button
					type="button"
					className="tracks-list__play"
					aria-label={isActive ? 'Пауза' : 'Воспроизвести'}
					onClick={(event: MouseEvent) => {
						event.stopPropagation()
						onTrackClick(track)
					}}
				>
					{isActive ? (
						<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
						</svg>
					) : (
						<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>
			</div>
			<h3 className="tracks-list__title">{track.title}</h3>
			<span className="tracks-list__artist">{track.artist}</span>
			<div className="tracks-list__meta">
				<span className="tracks-list__duration">{formatDuration(track.duration)}</span>
				<button
					type="button"
					className="tracks-list__menu"
					aria-label="Меню трека"
					onClick={(event) => handleMenu(event, track.id)}
				>
					<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
