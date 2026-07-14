import AppRouter from '@/router/AppRouter/AppRouter.tsx'
import useAuthListener from '@/hooks/useAuthListener.ts'
import Player from '@/components/Player'

export default function App() {
	useAuthListener()
	
	return (
		<>
			<AppRouter />
			<Player />
		</>
  )
}
