import Player from '@/components/Player'
import useAuthListener from '@/hooks/useAuthListener.ts'
import AppRouter from '@/router/AppRouter/AppRouter.tsx'

export default function App() {
	useAuthListener()

	return (
		<>
			<AppRouter />
			<Player />
		</>
	)
}
