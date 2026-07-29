import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, useRef } from 'react'
import { Link } from 'react-router-dom'
import usePlaylists from '@/entities/Playlist/model/usePlaylists.ts'
import { updateAvatar, updateUsername } from '@/entities/Profile/api/profile.ts'
import useProfile from '@/entities/Profile/model/useProfile.ts'
import useTracks from '@/entities/Track/model/useTracks.ts'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'
import { fetchAllTracks } from '@/shared/api/library.ts'
import { pluralize } from '@/shared/lib/pluralize.ts'
import useInlineEdit from '@/shared/lib/useInlineEdit.ts'
import CoverImage from '@/shared/ui/CoverImage'
import './Profile.scss'

const Profile = () => {
	const { user, signOut } = useAuthStore()

	const { data: userData, isLoading: isUserLoading, error: userError } = useProfile()
	const { data: playlists } = usePlaylists()
	const { data: tracks } = useTracks()
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
	})

	const { mutate: mutateAvatar } = useMutation({
		mutationFn: (avatarFile: File) =>
			updateAvatar(user!.id, avatarFile, userData?.avatar_url ?? null),
		onSuccess: invalidateProfile,
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
			<button
				type="button"
				className="profile__sign-out"
				aria-label="Выйти из аккаунта"
				onClick={signOut}
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
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}
					</span>
					<span className="profile__stat-label">В приложении с</span>
				</div>
			</div>

			{(latestTrack || latestPlaylist) && (
				<div className="profile__recent">
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
		</section>
	)
}

export default Profile
