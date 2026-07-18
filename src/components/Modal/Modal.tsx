import './Modal.scss'
import { useEffect } from 'react'
import type { ModalProps } from '@/types/utils.ts'

const Modal = (props: ModalProps) => {
	const { isOpen, onClose, children } = props

	useEffect(() => {
		if (!isOpen) return

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		window.addEventListener('keydown', handleEscape)

		return () => window.removeEventListener('keydown', handleEscape)
	}, [onClose, isOpen])

	if (!isOpen) return null

	return (
		<section className="modal">
			<div className="modal__content">
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
		</section>
	)
}

export default Modal
