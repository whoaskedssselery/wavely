import { useRef } from 'react'
import Player from '@/components/Player'
import useAuthListener from '@/hooks/useAuthListener.ts'
import useScrollbarVisibility from '@/hooks/useScrollbarVisibility.ts'
import AppRouter from '@/router/AppRouter/AppRouter.tsx'
import './App.scss'

export default function App() {
	useAuthListener()

	const contentRef = useRef<HTMLDivElement>(null)

	useScrollbarVisibility(contentRef)

	return (
		<div className="app">
			<div className="app__content" ref={contentRef}>
				<AppRouter />
			</div>
			<Player />
		</div>
	)
}
