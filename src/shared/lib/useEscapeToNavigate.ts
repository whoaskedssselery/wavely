import { useEffect, useRef } from 'react'
import useSmartBack from '@/shared/lib/useSmartBack.ts'

const useEscapeToNavigate = (to: string, onEscape?: () => boolean) => {
	const goBack = useSmartBack(to)
	const onEscapeRef = useRef(onEscape)
	onEscapeRef.current = onEscape

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return
			if (onEscapeRef.current?.()) return
			goBack()
		}

		window.addEventListener('keydown', handleEscape)

		return () => {
			window.removeEventListener('keydown', handleEscape)
		}
	}, [goBack])
}

export default useEscapeToNavigate
