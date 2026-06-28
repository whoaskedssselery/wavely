import { useAuthStore } from '@/store/authStore.ts'
import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'

const ProtectedRoute = ({ children }: PropsWithChildren) => {
	const { user, isLoading } = useAuthStore()
	
	if (isLoading) return null
	if (!user) return <Navigate to="/login" />
	return <>{children}</>
}

export default ProtectedRoute