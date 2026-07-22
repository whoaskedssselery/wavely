import { type RefObject, useEffect } from 'react'

const HIDE_DELAY = 800

const useScrollbarVisibility = (ref: RefObject<HTMLElement | null>) => {
	useEffect(() => {
		const element = ref.current
		if (!element) return

		let hideTimeout: ReturnType<typeof setTimeout>

		const handleScroll = () => {
			element.classList.add('is-scrolling')
			clearTimeout(hideTimeout)
			hideTimeout = setTimeout(() => {
				element.classList.remove('is-scrolling')
			}, HIDE_DELAY)
		}

		element.addEventListener('scroll', handleScroll, { passive: true })

		return () => {
			element.removeEventListener('scroll', handleScroll)
			clearTimeout(hideTimeout)
		}
	}, [ref])
}

export default useScrollbarVisibility
