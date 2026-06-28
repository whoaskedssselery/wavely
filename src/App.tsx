import AppRouter from '@/router/AppRouter/AppRouter.tsx'
import useAuthListener from '@/hooks/useAuthListener.ts'

export default function App() {
	useAuthListener()
	
	return (
			<AppRouter />
  )
}
