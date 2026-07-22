import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchTracks } from '@/api/tracks.ts'
import TracksList from '@/components/TracksList'
import { useAuthStore } from '@/store/authStore.ts'
import { pluralize } from '@/utils/pluralize.ts'
import './Collection.scss'

const Collection = () => {
	const { user } = useAuthStore()

	const navigate = useNavigate()

	const [searchQuery, setSearchQuery] = useState<string>('')

	const {
		data: tracks,
		isLoading: isTracksLoading,
		error: tracksError,
	} = useQuery({
		queryKey: ['tracks', user?.id],
		queryFn: () => fetchTracks(user!.id),
		enabled: !!user,
	})

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return
			navigate('/')
		}

		window.addEventListener('keydown', handleEscape)

		return () => {
			window.removeEventListener('keydown', handleEscape)
		}
	}, [navigate])

	if (!user) {
		return null
	}

	const filteredTracks = tracks?.filter((track) => {
		const query = searchQuery.toLocaleLowerCase()
		return track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query)
	})

	const trackCount = tracks?.length ?? 0

	return (
		<section className="collection">
			<div className="collection__header">
				<Link to="/" className="collection__back" aria-label="Назад">
					<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path
							d="M19 12H5M11 18l-6-6 6-6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Link>

				<div className="collection__cover-wrap">
					<div className="collection__cover">
						<svg
							aria-hidden="true"
							className="collection__cover-icon"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
						</svg>
					</div>
				</div>
				<div className="collection__info">
					<h1 className="collection__title">Моя коллекция</h1>
					<p className="collection__description">Все треки, которые ты когда-либо загружал</p>
					<span className="collection__count">
						{trackCount} {pluralize(trackCount, ['трек', 'трека', 'треков'])}
					</span>
				</div>
			</div>

			<div className="collection__search">
				<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
					<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M21 21l-4.35-4.35"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					/>
				</svg>
				<input
					type="text"
					className="collection__search-input"
					placeholder="Поиск трека"
					onChange={(event) => setSearchQuery(event.target.value)}
				/>
			</div>

			<TracksList
				tracks={filteredTracks ?? []}
				isLoading={isTracksLoading}
				error={tracksError}
				variant="collection"
				isPreview={false}
			/>
		</section>
	)
}

export default Collection
