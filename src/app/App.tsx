import { useRef } from 'react'
import { Link } from 'react-router-dom'
import AppRouter from '@/app/router/AppRouter.tsx'
import usePrefetchPlaylists from '@/entities/Playlist/model/usePrefetchPlaylists.ts'
import useProfile from '@/entities/Profile/model/useProfile.ts'
import useAuthListener from '@/features/Auth/model/useAuthListener.ts'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { useThemeStore } from '@/features/Theme/model/themeStore.ts'
import useScrollbarVisibility from '@/shared/lib/useScrollbarVisibility.ts'
import CoverImage from '@/shared/ui/CoverImage'
import Player from '@/widgets/Player'
import './App.scss'

export default function App() {
	useAuthListener()
	usePrefetchPlaylists()

	const currentTrack = usePlayerStore((state) => state.currentTrack)
	const theme = useThemeStore((state) => state.theme)
	const setTheme = useThemeStore((state) => state.setTheme)
	const { data: profile } = useProfile()

	const contentRef = useRef<HTMLDivElement>(null)

	useScrollbarVisibility(contentRef)

	return (
		<div className={`app ${!currentTrack ? 'app--no-sidebar' : ''}`}>
			{currentTrack && (
				<aside className="app__sidebar">
					<div className="app__sidebar-header">
						<Link to="/" className="app__logo">
							<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
								<rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
								<rect x="10" y="6" width="4" height="15" rx="1" fill="currentColor" />
								<rect x="17" y="9" width="4" height="12" rx="1" fill="currentColor" />
							</svg>
							<span>Wavely</span>
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
					</div>
					<Player />
				</aside>
			)}
			<main className="app__content" ref={contentRef}>
				<AppRouter />
			</main>
		</div>
	)
}
