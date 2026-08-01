import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import PageTransition from '@/app/router/PageTransition.tsx'
import ProtectedRoute from '@/app/router/ProtectedRoute.tsx'
import PublicRoute from '@/app/router/PublicRoute.tsx'
import Collection from '@/pages/Collection'
import ConfirmOtp from '@/pages/ConfirmOtp'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Playlist from '@/pages/Playlist'
import Profile from '@/pages/Profile'
import Register from '@/pages/Register'

const AppRouter = () => {
	const location = useLocation()

	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<PageTransition>
								<Home />
							</PageTransition>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<PageTransition>
								<Profile />
							</PageTransition>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/playlists/:playlistId"
					element={
						<ProtectedRoute>
							<PageTransition>
								<Playlist />
							</PageTransition>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/collection"
					element={
						<ProtectedRoute>
							<PageTransition>
								<Collection />
							</PageTransition>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/login"
					element={
						<PublicRoute>
							<PageTransition>
								<Login />
							</PageTransition>
						</PublicRoute>
					}
				/>
				<Route
					path="/register"
					element={
						<PublicRoute>
							<PageTransition>
								<Register />
							</PageTransition>
						</PublicRoute>
					}
				/>
				<Route
					path="/confirm"
					element={
						<PageTransition>
							<ConfirmOtp />
						</PageTransition>
					}
				/>
			</Routes>
		</AnimatePresence>
	)
}

export default AppRouter
