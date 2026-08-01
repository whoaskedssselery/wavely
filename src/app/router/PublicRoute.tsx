import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/Auth/model/authStore.ts'

const PublicRoute = ({ children }: PropsWithChildren) => {
	const { user, isLoading } = useAuthStore()

	if (isLoading) return null
	if (user) return <Navigate to="/" />
	return <>{children}</>
}

export default PublicRoute
