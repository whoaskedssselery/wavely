import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const useEscapeToNavigate = (to: string, onEscape?: () => boolean) => {
	const navigate = useNavigate()
	const onEscapeRef = useRef(onEscape)
	onEscapeRef.current = onEscape

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return
			if (onEscapeRef.current?.()) return
			navigate(to)
		}

		window.addEventListener('keydown', handleEscape)

		return () => {
			window.removeEventListener('keydown', handleEscape)
		}
	}, [navigate, to])
}

export default useEscapeToNavigate
