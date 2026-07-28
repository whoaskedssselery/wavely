import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { fetchPlaylists } from '@/api/playlists.ts'
import SectionHeader from '@/components/SectionHeader'
import { supabase } from '@/lib/supabase.ts'
import { useAuthStore } from '@/store/authStore.ts'
import type { PlaylistsListProps } from '@/types/utils.ts'
import { pluralize } from '@/utils/pluralize.ts'
import 'swiper/css'
import './PlaylistsList.scss'

const PlaylistsList = ({ onCreatePlaylist }: PlaylistsListProps) => {
	const { user } = useAuthStore()

	const { data, isLoading, error } = useQuery({
		queryKey: ['playlists', user?.id],
		queryFn: () => fetchPlaylists(user!.id),
		enabled: !!user,
	})

	const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
	const [isBeginning, setIsBeginning] = useState(true)
	const [isEnd, setIsEnd] = useState(false)

	const updateNavState = (swiper: SwiperType) => {
		setIsBeginning(swiper.isBeginning)
		setIsEnd(swiper.isEnd)
	}

	const playlistCount = data?.length ?? 0

	if (!user) {
		return null
	}

	return (
		<section className="playlists-list">
			<SectionHeader
				title="Мои плейлисты"
				counterText={`${playlistCount} ${pluralize(playlistCount, ['плейлист', 'плейлиста', 'плейлистов'])}`}
				buttonText="Создать плейлист"
				onButtonClick={onCreatePlaylist}
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

			{data && data.length > 0 && (
				<Swiper
					onSwiper={(swiper) => {
						setSwiperInstance(swiper)
						updateNavState(swiper)
					}}
					onSlideChange={updateNavState}
					slidesPerView="auto"
					slidesPerGroup={1}
					spaceBetween={16}
					className="playlists-list__track"
				>
					{data.map((playlist) => (
						<SwiperSlide className="playlists-list__slide" key={playlist.id}>
							<Link className="playlists-list__card" to={`/playlists/${playlist.id}`}>
								{playlist.cover_path ? (
									<img
										className="playlists-list__image"
										src={
											supabase.storage.from('covers').getPublicUrl(playlist.cover_path).data
												.publicUrl
										}
										alt={playlist.title}
									/>
								) : (
									<svg
										aria-hidden="true"
										className="playlists-list__image playlists-list__image--placeholder"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M9 18V5l10-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								)}
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
