import { Routes, Route, useLocation } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import {AnimatePresence} from 'framer-motion'
import ConfirmOtp from '@/pages/ConfirmOtp'
import ProtectedRoute from '@/router/ProtectedRoute'

const AppRouter = () => {
	const location = useLocation()
	
	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/confirm" element={<ConfirmOtp/>}></Route>
			</Routes>
		</AnimatePresence>
	)
}

export default AppRouter