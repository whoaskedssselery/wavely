import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import usePlaylists from '@/entities/Playlist/model/usePlaylists.ts'
import { deleteAccount, updateAvatar, updateUsername } from '@/entities/Profile/api/profile.ts'
import useProfile from '@/entities/Profile/model/useProfile.ts'
import { fetchAllTracks } from '@/entities/Track/api/library.ts'
import useFavoriteTrack from '@/entities/Track/model/useFavoriteTrack.ts'
import useTracks from '@/entities/Track/model/useTracks.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { useAuthStore } from '@/shared/lib/authStore.ts'
import { pluralize } from '@/shared/lib/pluralize.ts'
import useEscapeToNavigate from '@/shared/lib/useEscapeToNavigate.ts'
import useInlineEdit from '@/shared/lib/useInlineEdit.ts'
import useSmartBack from '@/shared/lib/useSmartBack.ts'
import CoverImage from '@/shared/ui/CoverImage'
import { BackIcon } from '@/shared/ui/icons'
import Modal from '@/shared/ui/Modal'
import './Profile.scss'

const Profile = () => {
	const { user, signOut } = useAuthStore()
	const resetPlayer = usePlayerStore((state) => state.reset)
	const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [profileError, setProfileError] = useState<string | null>(null)
	const [accountError, setAccountError] = useState<string | null>(null)

	const handleSignOut = async () => {
		await signOut()
		resetPlayer()
	}

	const { data: userData, isLoading: isUserLoading, error: userError } = useProfile()
	const { data: playlists } = usePlaylists()
	const { data: tracks } = useTracks()
	const { data: favoriteTrack } = useFavoriteTrack()
	const { data: allTracks } = useQuery({
		queryKey: ['all-tracks', user?.id],
		queryFn: () => fetchAllTracks(user!.id),
		enabled: !!user,
	})

	const playlistCount = playlists?.length ?? 0
	const trackCount = allTracks?.length ?? 0
	const latestPlaylist = playlists?.[0]
	const latestTrack = tracks?.[0]

	const queryClient = useQueryClient()
	const invalidateProfile = () => queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })

	const { mutate: mutateUsername } = useMutation({
		mutationFn: (username: string) => updateUsername(user!.id, username),
		onSuccess: invalidateProfile,
		onError: (error) => setProfileError(error.message),
	})

	const { mutate: mutateAvatar } = useMutation({
		mutationFn: (avatarFile: File) =>
			updateAvatar(user!.id, avatarFile, userData?.avatar_url ?? null),
		onSuccess: invalidateProfile,
		onError: (error) => setProfileError(error.message),
	})

	const { mutate: mutateDeleteAccount, isPending: isDeletingAccount } = useMutation({
		mutationFn: deleteAccount,
		onSuccess: handleSignOut,
		onError: (error) => setAccountError(error.message),
	})

	const {
		isEditing: isUsernameEditing,
		draft: usernameDraft,
		setDraft: setUsernameDraft,
		startEditing: startUsernameEditing,
		save: saveUsername,
		handleKeyDown: handleUsernameKeyDown,
		inputRef: usernameRef,
	} = useInlineEdit<HTMLInputElement>({ value: userData?.username ?? '', onSave: mutateUsername })

	const avatarInputRef = useRef<HTMLInputElement>(null)
	const goBack = useSmartBack('/')

	useEscapeToNavigate('/')

	const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target?.files?.[0]
		if (file) mutateAvatar(file)
		event.target.value = ''
	}

	if (isUserLoading) {
		return <p className="profile__loading">Загружаем профиль</p>
	}

	if (userError || !userData) {
		return <p className="profile__error">Не удалось загрузить профиль</p>
	}

	return (
		<section className="profile">
			<div className="profile__toolbar">
				<div className="profile__toolbar-row">
					<button
						type="button"
						className="profile__toolbar-button"
						aria-label="Назад"
						onClick={goBack}
					>
						<BackIcon />
					</button>
					<button
						type="button"
						className="profile__toolbar-button"
						aria-label="Выйти из аккаунта"
						onClick={() => setIsSignOutModalOpen(true)}
					>
						<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
				<button
					type="button"
					className="profile__toolbar-button profile__toolbar-button--danger"
					aria-label="Удалить аккаунт"
					onClick={() => setIsDeleteModalOpen(true)}
				>
					<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
						<path
							d="M4 7h16M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7h12ZM10 11v6M14 11v6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>

			<div className="profile__header">
				<button
					type="button"
					className="profile__cover-wrap"
					aria-label="Изменить аватарку"
					onClick={() => avatarInputRef.current?.click()}
				>
					<CoverImage
						coverPath={userData.avatar_url}
						alt={userData.username}
						className="profile__cover"
						kind="profile"
						bucket="avatars"
						priority
					/>
					<span className="profile__cover-overlay">
						<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
							<path
								d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</span>
				</button>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					className="profile__avatar-input"
					ref={avatarInputRef}
					onChange={handleAvatarChange}
				/>

				<div className="profile__identity">
					{isUsernameEditing ? (
						<input
							type="text"
							className="profile__title profile__title--editing"
							ref={usernameRef}
							value={usernameDraft}
							onChange={(event) => setUsernameDraft(event.target.value)}
							onBlur={saveUsername}
							onKeyDown={handleUsernameKeyDown}
						/>
					) : (
						<h1 className="profile__title">
							<button
								type="button"
								className="profile__title-trigger"
								onClick={startUsernameEditing}
							>
								{userData.username}
							</button>
						</h1>
					)}
					<span className="profile__email">{user?.email}</span>
				</div>
			</div>
			{profileError && <p className="modal-panel__error">{profileError}</p>}

			<div className="profile__stats">
				<div className="profile__stat">
					<span className="profile__stat-value">{playlistCount}</span>
					<span className="profile__stat-label">
						{pluralize(playlistCount, ['плейлист', 'плейлиста', 'плейлистов'])}
					</span>
				</div>
				<div className="profile__stat">
					<span className="profile__stat-value">{trackCount}</span>
					<span className="profile__stat-label">
						{pluralize(trackCount, ['трек', 'трека', 'треков'])}
					</span>
				</div>
				<div className="profile__stat">
					<span className="profile__stat-value">
						{new Date(userData.created_at).toLocaleDateString('ru-RU', {
							day: '2-digit',
							month: '2-digit',
							year: '2-digit',
						})}
					</span>
					<span className="profile__stat-label">В приложении с</span>
				</div>
			</div>

			{(latestTrack || latestPlaylist || favoriteTrack) && (
				<div className="profile__recent">
					{favoriteTrack && (
						<div className="profile__recent-card">
							<span className="profile__recent-label">Любимый трек</span>
							<div className="profile__recent-item">
								<CoverImage
									coverPath={favoriteTrack.cover_path}
									alt={favoriteTrack.title}
									className="profile__recent-cover"
									kind="track"
								/>
								<div className="profile__recent-info">
									<span className="profile__recent-title">{favoriteTrack.title}</span>
									<span className="profile__recent-subtitle">
										{favoriteTrack.play_count}{' '}
										{pluralize(favoriteTrack.play_count, [
											'прослушивание',
											'прослушивания',
											'прослушиваний',
										])}
									</span>
								</div>
							</div>
						</div>
					)}

					{latestTrack && (
						<div className="profile__recent-card">
							<span className="profile__recent-label">Последний трек</span>
							<div className="profile__recent-item">
								<CoverImage
									coverPath={latestTrack.cover_path}
									alt={latestTrack.title}
									className="profile__recent-cover"
									kind="track"
								/>
								<div className="profile__recent-info">
									<span className="profile__recent-title">{latestTrack.title}</span>
									<span className="profile__recent-subtitle">{latestTrack.artist}</span>
								</div>
							</div>
						</div>
					)}

					{latestPlaylist && (
						<Link to={`/playlists/${latestPlaylist.id}`} className="profile__recent-card">
							<span className="profile__recent-label">Последний плейлист</span>
							<div className="profile__recent-item">
								<CoverImage
									coverPath={latestPlaylist.cover_path}
									alt={latestPlaylist.title}
									className="profile__recent-cover"
									kind="playlist"
								/>
								<div className="profile__recent-info">
									<span className="profile__recent-title">{latestPlaylist.title}</span>
								</div>
							</div>
						</Link>
					)}
				</div>
			)}

			<Modal isOpen={isSignOutModalOpen} onClose={() => setIsSignOutModalOpen(false)}>
				<div className="modal-panel">
					<h2 className="modal-panel__title">Выйти из аккаунта?</h2>
					<div className="profile__account-preview">
						<CoverImage
							coverPath={userData.avatar_url}
							alt={userData.username}
							className="profile__account-avatar"
							kind="profile"
							bucket="avatars"
						/>
						<div className="profile__account-info">
							<span className="profile__account-name">{userData.username}</span>
							<span className="profile__account-email">{user?.email}</span>
						</div>
					</div>
					<div className="modal-panel__actions">
						<button
							type="button"
							className="modal-panel__button modal-panel__button--ghost"
							onClick={() => setIsSignOutModalOpen(false)}
						>
							Отмена
						</button>
						<button
							type="button"
							className="modal-panel__button modal-panel__button--danger"
							onClick={handleSignOut}
						>
							Выйти
						</button>
					</div>
				</div>
			</Modal>

			<Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
				<div className="modal-panel">
					<h2 className="modal-panel__title">Удалить аккаунт?</h2>
					<p className="profile__delete-warning">
						Действие необратимо: удалятся все треки, плейлисты и обложки. Отменить или восстановить
						аккаунт после этого нельзя.
					</p>
					<div className="profile__account-preview">
						<CoverImage
							coverPath={userData.avatar_url}
							alt={userData.username}
							className="profile__account-avatar"
							kind="profile"
							bucket="avatars"
						/>
						<div className="profile__account-info">
							<span className="profile__account-name">{userData.username}</span>
							<span className="profile__account-email">{user?.email}</span>
						</div>
					</div>
					{accountError && <p className="modal-panel__error">{accountError}</p>}
					<div className="modal-panel__actions">
						<button
							type="button"
							className="modal-panel__button modal-panel__button--ghost"
							onClick={() => setIsDeleteModalOpen(false)}
							disabled={isDeletingAccount}
						>
							Отмена
						</button>
						<button
							type="button"
							className="modal-panel__button modal-panel__button--danger"
							onClick={() => mutateDeleteAccount()}
							disabled={isDeletingAccount}
						>
							{isDeletingAccount ? 'Удаляем...' : 'Удалить навсегда'}
						</button>
					</div>
				</div>
			</Modal>
		</section>
	)
}

export default Profile
