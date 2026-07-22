import type { SectionHeaderProps } from '@/types/utils.ts'
import './SectionHeader.scss'

const SectionHeader = ({
	title,
	counterText,
	buttonText,
	onButtonClick,
	onTitleClick,
}: SectionHeaderProps) => {
	return (
		<div className="section-header">
			<div className="section-header__title-row">
				<h2 className="section-header__title">{title}</h2>
				{onTitleClick && (
					<button
						type="button"
						className="section-header__title-link"
						aria-label={`Открыть «${title}» целиком`}
						onClick={onTitleClick}
					>
						<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
							<path
								d="M9 6l6 6-6 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				)}
			</div>
			<span className="section-header__counter">{counterText}</span>
			<button type="button" className="section-header__button" onClick={onButtonClick}>
				{buttonText}
			</button>
		</div>
	)
}

export default SectionHeader
