import { Link } from 'react-router-dom'
import type { Playlist } from '@/entities/Playlist/model/types.ts'
import { pluralize } from '@/shared/lib/pluralize.ts'
import CoverImage from '@/shared/ui/CoverImage'
import Popover from '@/shared/ui/Popover'
import type usePlaylistMetaEditing from '@/widgets/PlaylistHeader/model/usePlaylistMetaEditing.ts'

interface PlaylistHeaderProps {
	playlistData: Playlist | null | undefined
	isLoading: boolean
	error: Error | null
	trackCount: number
	isMenuOpen: boolean
	toggleMenu: () => void
	onDeleteClick: () => void
	meta: ReturnType<typeof usePlaylistMetaEditing>
}

const PlaylistHeader = (props: PlaylistHeaderProps) => {
	const {
		playlistData,
		isLoading,
		error,
		trackCount,
		isMenuOpen,
		toggleMenu,
		onDeleteClick,
		meta,
	} = props

	return (
		<div className="playlist__header">
			<Link to="/" className="playlist__back" aria-label="Назад">
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

			{isLoading && <p className="playlist__loading">Загружаем плейлист</p>}
			{error && <p className="playlist__error">Не удалось загрузить плейлист</p>}

			{playlistData && (
				<>
					<button
						type="button"
						className="playlist__cover-wrap"
						aria-label="Изменить обложку"
						onClick={() => meta.coverInputRef.current?.click()}
					>
						<CoverImage
							coverPath={playlistData.cover_path}
							alt={playlistData.title}
							className="playlist__cover"
							kind="playlist"
						/>
						<span className="playlist__cover-overlay" aria-hidden="true">
							<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
								<path
									d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					</button>
					<input
						ref={meta.coverInputRef}
						type="file"
						accept="image/*"
						className="playlist__cover-input"
						hidden
						onChange={meta.handleCoverChange}
					/>
					<div className="playlist__info">
						<div className="playlist__title-row">
							{meta.isEditingTitle ? (
								<div className="playlist__title-edit">
									<input
										ref={meta.titleInputRef}
										type="text"
										className="playlist__title playlist__title--editing"
										value={meta.titleDraft}
										maxLength={64}
										onChange={(event) => meta.setTitleDraft(event.target.value)}
										onBlur={meta.saveTitle}
										onKeyDown={meta.handleTitleKeyDown}
									/>
									{meta.titleDraft.length >= 64 && (
										<span className="playlist__limit-warning">Достигнут лимит в 64 символа</span>
									)}
								</div>
							) : (
								<h1 className="playlist__title">
									<button
										type="button"
										className="playlist__title-trigger"
										onClick={meta.startEditingTitle}
									>
										{playlistData.title}
									</button>
								</h1>
							)}
							<button
								type="button"
								className={`playlist__menu ${isMenuOpen ? 'playlist__menu--active' : ''}`}
								aria-label="Меню плейлиста"
								onClick={toggleMenu}
							>
								<svg
									aria-hidden="true"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<circle cx="5" cy="12" r="2" />
									<circle cx="12" cy="12" r="2" />
									<circle cx="19" cy="12" r="2" />
								</svg>
							</button>
							{isMenuOpen && (
								<Popover placement="right">
									<button className="popover__item--danger" type="button" onClick={onDeleteClick}>
										Удалить плейлист
									</button>
								</Popover>
							)}
						</div>
						{meta.isEditingDescription ? (
							<div className="playlist__description-edit">
								<textarea
									ref={meta.descriptionRef}
									className="playlist__description playlist__description--editing"
									value={meta.descriptionDraft}
									maxLength={64}
									onChange={(event) => meta.setDescriptionDraft(event.target.value)}
									onBlur={meta.saveDescription}
									onKeyDown={meta.handleDescriptionKeyDown}
								/>
								{meta.descriptionDraft.length >= 64 && (
									<span className="playlist__limit-warning">Достигнут лимит в 64 символа</span>
								)}
							</div>
						) : (
							<button
								type="button"
								className={`playlist__description ${playlistData.description ? '' : 'playlist__description--empty'}`}
								onClick={meta.startEditingDescription}
							>
								{playlistData.description || 'Добавить описание'}
							</button>
						)}
						<span className="playlist__count">
							{trackCount} {pluralize(trackCount, ['трек', 'трека', 'треков'])}
							{playlistData.author && ` · ${playlistData.author}`}
						</span>
					</div>
				</>
			)}
		</div>
	)
}

export default PlaylistHeader
