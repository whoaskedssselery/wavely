import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Swiper as SwiperType } from 'swiper'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import usePlaylists from '@/entities/Playlist/model/usePlaylists.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { useSidebarStore } from '@/features/Sidebar/model/sidebarStore.ts'
import { filterBySearch } from '@/shared/lib/filterBySearch.ts'
import { pluralize } from '@/shared/lib/pluralize.ts'
import CoverImage from '@/shared/ui/CoverImage'
import SectionHeader from '@/shared/ui/SectionHeader'
import 'swiper/css'
import './PlaylistsList.scss'

interface PlaylistsListProps {
	searchQuery?: string
}

const PlaylistsList = ({ searchQuery = '' }: PlaylistsListProps) => {
	const { data, isLoading, error } = usePlaylists()
	const currentTrack = usePlayerStore((state) => state.currentTrack)
	const hasPlayer = useSidebarStore((state) => state.isExpanded) && !!currentTrack

	const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
	const [isBeginning, setIsBeginning] = useState(true)
	const [isEnd, setIsEnd] = useState(false)

	const updateNavState = (swiper: SwiperType) => {
		setIsBeginning(swiper.isBeginning)
		setIsEnd(swiper.isEnd)
	}

	const playlistCount = data?.length ?? 0

	const filteredData = filterBySearch(data, searchQuery, (playlist) => [
		playlist.title,
		playlist.author,
	])

	useEffect(() => {
		if (!swiperInstance) return
		swiperInstance.update()
		setIsBeginning(swiperInstance.isBeginning)
		setIsEnd(swiperInstance.isEnd)
	}, [swiperInstance, filteredData?.length, hasPlayer])

	return (
		<section className="playlists-list">
			<SectionHeader
				title="Мои плейлисты"
				counterText={`${playlistCount} ${pluralize(playlistCount, ['плейлист', 'плейлиста', 'плейлистов'])}`}
			>
				<button
					type="button"
					className="playlists-list__nav playlists-list__nav--prev"
					aria-label="Предыдущие плейлисты"
					disabled={isBeginning}
					onClick={(event) => {
						swiperInstance?.slidePrev()
						event.currentTarget.blur()
					}}
				>
					<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
						<path
							d="M15 6l-6 6 6 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
				<button
					type="button"
					className="playlists-list__nav playlists-list__nav--next"
					aria-label="Следующие плейлисты"
					disabled={isEnd}
					onClick={(event) => {
						swiperInstance?.slideNext()
						event.currentTarget.blur()
					}}
				>
					<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
						<path
							d="M9 6l6 6-6 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</SectionHeader>

			{isLoading && <p className="playlists-list__loading">Загружаем плейлисты</p>}
			{error && <p className="playlists-list__error">Не удалось загрузить данные</p>}
			{data && data.length === 0 && (
				<p className="playlists-list__warning">У вас пока нет плейлистов</p>
			)}
			{data && data.length > 0 && filteredData?.length === 0 && (
				<p className="playlists-list__warning">Ничего не найдено</p>
			)}

			{filteredData && filteredData.length > 0 && (
				<Swiper
					onSwiper={(swiper) => {
						setSwiperInstance(swiper)
						updateNavState(swiper)
					}}
					onSlideChange={updateNavState}
					modules={[Mousewheel]}
					mousewheel={{ forceToAxis: true }}
					slidesPerView={2}
					spaceBetween={10}
					slidesPerGroup={1}
					breakpoints={{
						480: { slidesPerView: 3, spaceBetween: 12 },
						680: { slidesPerView: 4, spaceBetween: 12 },
						900: { slidesPerView: 5, spaceBetween: 14 },
						1024: { slidesPerView: hasPlayer ? 4 : 5, spaceBetween: 14 },
						1280: { slidesPerView: hasPlayer ? 4 : 5, spaceBetween: 14 },
						1600: { slidesPerView: hasPlayer ? 5 : 6, spaceBetween: 14 },
					}}
					className="playlists-list__track"
				>
					{filteredData.map((playlist) => (
						<SwiperSlide className="playlists-list__slide" key={playlist.id}>
							<Link className="playlists-list__card" to={`/playlists/${playlist.id}`}>
								<CoverImage
									coverPath={playlist.cover_path}
									alt={playlist.title}
									className="playlists-list__image"
									kind="playlist"
								/>
								<div className="playlists-list__card-info">
									<span className="playlists-list__card-title">{playlist.title}</span>
									{playlist.author && (
										<span className="playlists-list__card-author">{playlist.author}</span>
									)}
								</div>
							</Link>
						</SwiperSlide>
					))}
				</Swiper>
			)}
		</section>
	)
}

export default PlaylistsList
