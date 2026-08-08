import { useEffect, useState } from 'react'
import Logo from '@/shared/ui/Logo'
import './TitleBar.scss'

export default function TitleBar() {
	const [isMaximized, setIsMaximized] = useState(false)

	useEffect(() => {
		window.electronAPI?.isWindowMaximized().then(setIsMaximized)
		return window.electronAPI?.onWindowMaximizedChange(setIsMaximized)
	}, [])

	if (!window.electronAPI || window.electronAPI.windowRole) return null

	return (
		<div className="title-bar">
			<div className="title-bar__drag">
				<Logo withLabel={false} />
			</div>
			<div className="title-bar__controls">
				<button
					type="button"
					className="title-bar__button"
					aria-label="Свернуть"
					onClick={() => window.electronAPI?.minimizeWindow()}
				>
					<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
						<path d="M2 6h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
					</svg>
				</button>
				<button
					type="button"
					className="title-bar__button"
					aria-label={isMaximized ? 'Восстановить' : 'Развернуть'}
					onClick={() => window.electronAPI?.toggleMaximizeWindow()}
				>
					{isMaximized ? (
						<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
							<rect
								x="3.5"
								y="1.5"
								width="7"
								height="7"
								stroke="currentColor"
								strokeWidth="1.1"
								fill="none"
							/>
							<rect
								x="1.5"
								y="3.5"
								width="7"
								height="7"
								stroke="currentColor"
								strokeWidth="1.1"
								fill="none"
							/>
						</svg>
					) : (
						<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
							<rect
								x="2"
								y="2"
								width="8"
								height="8"
								stroke="currentColor"
								strokeWidth="1.2"
								fill="none"
							/>
						</svg>
					)}
				</button>
				<button
					type="button"
					className="title-bar__button title-bar__button--close"
					aria-label="Закрыть"
					onClick={() => window.electronAPI?.closeWindow()}
				>
					<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
						<path
							d="M2 2l8 8M10 2l-8 8"
							stroke="currentColor"
							strokeWidth="1.2"
							strokeLinecap="round"
						/>
					</svg>
				</button>
			</div>
		</div>
	)
}
