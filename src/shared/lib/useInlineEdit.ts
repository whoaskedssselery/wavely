import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react'

const useInlineEdit = <T extends HTMLElement>(options: {
	value: string
	onSave: (value: string) => void
}) => {
	const { value, onSave } = options

	const [isEditing, setIsEditing] = useState(false)
	const [draft, setDraft] = useState('')

	const inputRef = useRef<T | null>(null)

	const startEditing = () => {
		setDraft(value)
		setIsEditing(true)
	}

	const save = () => {
		setIsEditing(false)
		if (draft !== value) {
			onSave(draft)
		}
	}

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus()
		}
	}, [isEditing])

	const handleKeyDown = (event: ReactKeyboardEvent<T>) => {
		if (event.key === 'Escape') {
			event.stopPropagation()
			setIsEditing(false)
			return
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			event.currentTarget.blur()
		}
	}

	return { isEditing, draft, setDraft, startEditing, save, handleKeyDown, inputRef }
}

export default useInlineEdit
