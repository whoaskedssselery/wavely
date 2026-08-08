import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AppRouter from '@/app/router/AppRouter.tsx'
import SplashOverlay from '@/app/SplashOverlay.tsx'
import TitleBar from '@/app/TitleBar.tsx'
import useAppReady from '@/app/useAppReady.ts'
import usePrefetchPlaylists from '@/entities/Playlist/model/usePrefetchPlaylists.ts'
import useProfile from '@/entities/Profile/model/useProfile.ts'
import { useAuthStore } from '@/shared/lib/authStore.ts'
import useAuthListener from '@/features/Auth/model/useAuthListener.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { useSidebarStore } from '@/features/Sidebar/model/sidebarStore.ts'
import { useThemeStore } from '@/features/Theme/model/themeStore.ts'
import useScrollbarVisibility from '@/shared/lib/useScrollbarVisibility.ts'
import CoverImage from '@/shared/ui/CoverImage'
import Logo from '@/shared/ui/Logo'
import Player, { MobilePlayer } from '@/widgets/Player'
import './App.scss'

export default function App() {
	useAuthListener()
	usePrefetchPlaylists()
	const isAppReady = useAppReady()

	const user = useAuthStore((state) => state.user)
	const currentTrack = usePlayerStore((state) => state.currentTrack)
	const isPlaying = usePlayerStore((state) => state.isPlaying)
	const togglePlay = usePlayerStore((state) => state.togglePlay)
	const theme = useThemeStore((state) => state.theme)
	const setTheme = useThemeStore((state) => state.setTheme)
	const isExpanded = useSidebarStore((state) => state.isExpanded) && !!currentTrack
	const toggleExpanded = useSidebarStore((state) => state.toggleExpanded)
	const setExpanded = useSidebarStore((state) => state.setExpanded)
	const { data: profile } = useProfile()

	const contentRef = useRef<HTMLDivElement>(null)
	const hadTrackRef = useRef(!!currentTrack)

	useScrollbarVisibility(contentRef)

	useEffect(() => {
		if (!hadTrackRef.current && currentTrack) {
			setExpanded(true)
		}
		hadTrackRef.current = !!currentTrack
	}, [currentTrack, setExpanded])

	if (!isAppReady) {
		return (
			<>
				<TitleBar />
				<SplashOverlay />
			</>
		)
	}
	if (!user) {
		return (
			<>
				<TitleBar />
				<AppRouter />
			</>
		)
	}

	return (
		<>
			<TitleBar />
			<div
				className={`app ${!isExpanded ? 'app--no-sidebar' : ''} ${currentTrack ? 'app--playing' : ''}`}
			>
			<header className="app__mobile-topbar">
				<Link to="/" className="app__logo" aria-label="Wavely">
					<Logo />
				</Link>
				<div className="app__mobile-topbar-controls">
					<button
						type="button"
						className="app__theme-toggle-mini"
						aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
						onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					>
						{theme === 'dark' ? (
							<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
								<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="currentColor" />
							</svg>
						) : (
							<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="4" fill="currentColor" />
								<path
									d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</button>
					<Link to="/profile" className="app__avatar" aria-label="Профиль">
						<CoverImage
							coverPath={profile?.avatar_url ?? null}
							alt={profile?.username ?? 'Профиль'}
							className="app__avatar-image"
							kind="profile"
							bucket="avatars"
						/>
					</Link>
				</div>
			</header>
			<aside className={`app__sidebar ${!isExpanded ? 'app__sidebar--collapsed' : ''}`}>
				<button
					type="button"
					className="app__sidebar-toggle"
					aria-label={isExpanded ? 'Свернуть сайдбар' : 'Развернуть сайдбар'}
					onClick={toggleExpanded}
					disabled={!currentTrack}
				>
					<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
						<path
							d={isExpanded ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>

				<AnimatePresence mode="wait">
					{isExpanded ? (
						<motion.div
							key="expanded"
							className="app__sidebar-header"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						>
							<Link to="/" className="app__logo">
								<Logo />
							</Link>
							<div className="app__sidebar-controls">
								<div
									className={`app__theme-toggle ${theme === 'dark' ? 'app__theme-toggle--dark' : ''}`}
								>
									<button
										type="button"
										className={`app__theme-toggle-option ${theme === 'light' ? 'app__theme-toggle-option--active' : ''}`}
										aria-label="Светлая тема"
										aria-pressed={theme === 'light'}
										onClick={() => setTheme('light')}
									>
										<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="4" fill="currentColor" />
											<path
												d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
											/>
										</svg>
									</button>
									<button
										type="button"
										className={`app__theme-toggle-option ${theme === 'dark' ? 'app__theme-toggle-option--active' : ''}`}
										aria-label="Тёмная тема"
										aria-pressed={theme === 'dark'}
										onClick={() => setTheme('dark')}
									>
										<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
											<path
												d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
												fill="currentColor"
											/>
										</svg>
									</button>
								</div>
								<Link to="/profile" className="app__avatar" aria-label="Профиль">
									<CoverImage
										coverPath={profile?.avatar_url ?? null}
										alt={profile?.username ?? 'Профиль'}
										className="app__avatar-image"
										kind="profile"
										bucket="avatars"
									/>
								</Link>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="collapsed"
							className="app__sidebar-mini"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						>
							<Link to="/" className="app__logo app__logo--mini" aria-label="Wavely">
								<Logo withLabel={false} />
							</Link>

							{currentTrack && (
								<button
									type="button"
									className="app__mini-player"
									aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
									onClick={togglePlay}
								>
									<CoverImage
										coverPath={currentTrack.cover_path}
										alt={currentTrack.title}
										className="app__mini-player-cover"
										kind="track"
									/>
									<span className="app__mini-player-overlay">
										{isPlaying ? (
											<svg
												aria-hidden="true"
												width="28"
												height="28"
												viewBox="0 0 24 24"
												fill="currentColor"
											>
												<path d="M7 5h4v14H7zM13 5h4v14h-4z" />
											</svg>
										) : (
											<svg
												aria-hidden="true"
												width="28"
												height="28"
												viewBox="0 0 24 24"
												fill="currentColor"
											>
												<path d="M8 5v14l11-7z" />
											</svg>
										)}
									</span>
								</button>
							)}

							<div className="app__sidebar-mini-footer">
								<button
									type="button"
									className="app__theme-toggle-mini"
									aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
									onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
								>
									{theme === 'dark' ? (
										<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
											<path
												d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
												fill="currentColor"
											/>
										</svg>
									) : (
										<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="4" fill="currentColor" />
											<path
												d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
											/>
										</svg>
									)}
								</button>
								<Link to="/profile" className="app__avatar" aria-label="Профиль">
									<CoverImage
										coverPath={profile?.avatar_url ?? null}
										alt={profile?.username ?? 'Профиль'}
										className="app__avatar-image"
										kind="profile"
										bucket="avatars"
									/>
								</Link>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<Player />
			</aside>
			<main className="app__content" ref={contentRef}>
				<AppRouter />
			</main>
			<MobilePlayer />
			</div>
		</>
	)
}
