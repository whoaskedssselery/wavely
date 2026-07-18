import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore.ts'

const ProtectedRoute = ({ children }: PropsWithChildren) => {
	const { user, isLoading } = useAuthStore()

	if (isLoading) return null
	if (!user) return <Navigate to="/login" />
	return <>{children}</>
}

export default ProtectedRoute
