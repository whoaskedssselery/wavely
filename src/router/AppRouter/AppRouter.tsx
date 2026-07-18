import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import ConfirmOtp from '@/pages/ConfirmOtp'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Playlist from '@/pages/Playlist'
import Register from '@/pages/Register'
import ProtectedRoute from '@/router/ProtectedRoute'

const AppRouter = () => {
	const location = useLocation()

	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<Home />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/playlists/:playlistId"
					element={
						<ProtectedRoute>
							<Playlist />
						</ProtectedRoute>
					}
				/>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/confirm" element={<ConfirmOtp />}></Route>
			</Routes>
		</AnimatePresence>
	)
}

export default AppRouter
