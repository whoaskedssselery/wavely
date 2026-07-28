import { useLayoutEffect, useRef, useState } from 'react'
import './Popover.scss'
import type { PopoverProps } from '@/shared/types/utils.ts'

const Popover = ({ children, placement = 'bottom-right' }: PopoverProps) => {
	const ref = useRef<HTMLDivElement>(null)
	const [flipUp, setFlipUp] = useState(false)

	useLayoutEffect(() => {
		if (placement !== 'bottom-right') return
		const element = ref.current
		if (!element) return

		const rect = element.getBoundingClientRect()
		if (rect.bottom > window.innerHeight) {
			setFlipUp(true)
		}
	}, [placement])

	return (
		<div ref={ref} className={`popover popover--${placement} ${flipUp ? 'popover--flip-up' : ''}`}>
			{children}
		</div>
	)
}

export default Popover
