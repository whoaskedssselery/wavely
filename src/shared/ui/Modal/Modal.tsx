import './Modal.scss'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ModalProps } from '@/shared/types/utils.ts'

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const Modal = (props: ModalProps) => {
	const { isOpen, onClose, children, size = 'md' } = props
	const contentRef = useRef<HTMLDivElement>(null)
	const previouslyFocusedRef = useRef<HTMLElement | null>(null)
	const titleId = useId()

	useEffect(() => {
		if (!isOpen || !contentRef.current) return

		const content = contentRef.current
		previouslyFocusedRef.current = document.activeElement as HTMLElement | null

		const heading = content.querySelector('h1, h2, h3')
		if (heading) heading.id = titleId

		const getFocusable = () => Array.from(content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

		getFocusable()[0]?.focus()

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
				return
			}

			if (event.key !== 'Tab') return

			const items = getFocusable()
			if (items.length === 0) {
				event.preventDefault()
				return
			}

			const first = items[0]
			const last = items[items.length - 1]

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		}

		window.addEventListener('keydown', handleKeydown)
		document.body.classList.add('modal-open')

		return () => {
			window.removeEventListener('keydown', handleKeydown)
			document.body.classList.remove('modal-open')
			previouslyFocusedRef.current?.focus()
		}
	}, [onClose, isOpen, titleId])

	if (!isOpen) return null

	return createPortal(
		<section className="modal">
			<div
				ref={contentRef}
				className={`modal__content ${size === 'lg' ? 'modal__content--lg' : ''}`}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
			>
				<button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть">
					<svg
						aria-hidden="true"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
					</svg>
				</button>
				{children}
			</div>
		</section>,
		document.body,
	)
}

export default Modal
